import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import duckdb from '../data/linux/duckdb.json' with { type: 'json' };
import { prepareGuestTools } from './guest-tools.mjs';
import { readGuestPrograms } from './guest-programs.mjs';
import { writeThirdPartyNotices } from './build-notices.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const guest = join(root, 'data/linux');
const output = join(root, 'public/portfolio.wasm');
const user = 'skywalker212';
const hostname = 'akash.is';
const uid = 1000;
const home = `/home/${user}`;
const initrdSection = 'unkernel.initrd';
const dataDiskSection = 'unkernel.datadisk';

function readU32(bytes, offset) {
    let value = 0;
    for (let shift = 0; shift < 35 && offset < bytes.length; shift += 7) {
        const byte = bytes[offset++];
        value += (byte & 0x7f) * 2 ** shift;
        if (byte < 0x80) return [value, offset];
    }
    throw new Error('Invalid WASM section length');
}

function u32(value) {
    const bytes = [];
    while (value >= 0x80) {
        bytes.push((value & 0x7f) | 0x80);
        value >>>= 7;
    }
    return Buffer.from([...bytes, value]);
}

function customSection(name, body) {
    const nameBytes = Buffer.from(name);
    const payload = Buffer.concat([u32(nameBytes.length), nameBytes, body]);
    return Buffer.concat([Buffer.from([0]), u32(payload.length), payload]);
}

function sections(wasm) {
    if (wasm.subarray(0, 8).toString('hex') !== '0061736d01000000') {
        throw new Error('Invalid unkernel WASM header');
    }
    const result = [];
    for (let start = 8; start < wasm.length;) {
        const [length, payload] = readU32(wasm, start + 1);
        const end = payload + length;
        if (end > wasm.length) throw new Error('Truncated unkernel WASM section');
        const section = { bytes: wasm.subarray(start, end) };
        if (wasm[start] === 0) {
            const [nameLength, nameStart] = readU32(wasm, payload);
            const bodyStart = nameStart + nameLength;
            section.name = wasm.toString('utf8', nameStart, bodyStart);
            section.body = wasm.subarray(bodyStart, end);
        }
        result.push(section);
        start = end;
    }
    return result;
}

const align4 = value => Math.ceil(value / 4) * 4;

function readInitramfs(bytes) {
    const files = new Map();
    for (let offset = 0; offset + 110 <= bytes.length;) {
        if (bytes.toString('ascii', offset, offset + 6) !== '070701') break;
        const field = i => Number.parseInt(bytes.toString('ascii', offset + 6 + i * 8, offset + 14 + i * 8), 16);
        const nameEnd = offset + 110 + field(11);
        const name = bytes.toString('utf8', offset + 110, nameEnd - 1).replace(/^\.\//, '');
        if (name === 'TRAILER!!!') return files;
        const start = align4(nameEnd);
        const end = start + field(6);
        if (!Number.isFinite(end) || end > bytes.length || end <= offset) break;
        files.set(name, bytes.subarray(start, end));
        offset = align4(end);
    }
    throw new Error('Expected the pinned unkernel initramfs to be an uncompressed newc archive');
}

function newc(entries) {
    const chunks = [];
    for (const [index, entry] of [...entries, { name: 'TRAILER!!!', mode: 0 }].entries()) {
        const { name, mode, owner = 0, data = Buffer.alloc(0) } = entry;
        const path = Buffer.from(name + '\0');
        const fields = [index + 1, mode, owner, owner, 1, 0, data.length, 0, 0, 0, 0, path.length, 0];
        const header = Buffer.from('070701' + fields.map(n => n.toString(16).padStart(8, '0')).join(''));
        chunks.push(header, path, Buffer.alloc(align4(110 + path.length) - 110 - path.length));
        chunks.push(data, Buffer.alloc(align4(data.length) - data.length));
    }
    return Buffer.concat(chunks);
}

const directory = (name, owner = 0) => ({ name, mode: 0o040755, owner });
const file = (name, data, executable = false) =>
    ({ name, data: Buffer.from(data), mode: executable ? 0o100755 : 0o100644 });

async function portfolioArchive(base) {
    function accountFile(name, entry) {
        const original = base.get(name)?.toString('utf8');
        if (original === undefined) throw new Error(`Missing ${name} in the unkernel initramfs`);
        const collision = original.split('\n').some(row => {
            const [name, , id] = row.split(':');
            return name === user || id === String(uid);
        });
        if (collision) throw new Error(`Portfolio account conflicts with the base ${name}`);
        return file(name, original.trimEnd() + '\n' + entry + '\n');
    }

    const inittab = base.get('etc/inittab')?.toString('utf8');
    const sysinit = '::sysinit:/kw/lib/sysinit\n';
    if (!inittab?.includes(sysinit)) throw new Error('Missing the expected unkernel sysinit action');

    const entries = [
        file('etc/inittab', inittab.replace(sysinit, sysinit + `::sysinit:/opt/portfolio/mount-home ${home} ${uid}\n`)),
        accountFile('etc/passwd', `${user}:x:${uid}:${uid}:Portfolio:${home}:/bin/zsh`),
        accountFile('etc/group', `${user}:x:${uid}:`),
        file('etc/hostname', hostname + '\n'),
        file('etc/profile', await readFile(join(guest, 'profile.sh'))),
        file('etc/vim/vimrc.local', await readFile(join(guest, 'vimrc'))),
        file('etc/zsh/zshrc.d/portfolio.zsh', await readFile(join(guest, 'zshrc.zsh'))),
        file('etc/motd', await readFile(join(guest, 'motd'))),
        directory('home'),
        directory(home.slice(1), uid),
        directory('opt'),
        directory('opt/portfolio'),
        file('opt/portfolio/mount-home', await readFile(join(guest, 'mount-home.sh')), true),
        file('opt/portfolio/login', `#!/bin/sh\nmountpoint -q ${home} || { echo "Unable to mount the persistent home directory." >&2; exit 1; }\nexec /bin/busybox login -f ${user}\n`, true),
    ];

    for (const subdirectory of ['bin', 'libexec']) {
        const target = `opt/portfolio/${subdirectory}`;
        entries.push(directory(target));
        for (const { name, data } of await readGuestPrograms(join(guest, subdirectory))) {
            entries.push(file(`${target}/${name}`, data, true));
        }
    }

    for (const subdirectory of ['lib', 'share']) {
        const target = `opt/portfolio/${subdirectory}`;
        entries.push(directory(target));
        for (const name of (await readdir(join(guest, subdirectory))).sort()) {
            entries.push(file(`${target}/${name}`, await readFile(join(guest, subdirectory, name))));
        }
    }
    return entries;
}

const wasm = await readFile(new URL(import.meta.resolve('unkernel/unkernel.wasm')));
const parts = sections(wasm);
const initrd = parts.find(part => part.name === initrdSection)?.body;
if (!initrd || initrd.length % 4 !== 0 || !parts.some(part => part.name === dataDiskSection)) {
    throw new Error('Missing or unaligned bundled boot data in the pinned unkernel WASM');
}
const tools = await prepareGuestTools(root);
const overlay = gzipSync(newc([
    ...tools.entries,
    ...await portfolioArchive(readInitramfs(initrd)),
]), { level: 9 });
const disk = await readFile(join(guest, 'home.kwsparse.gz'));
const image = Buffer.concat([wasm.subarray(0, 8), ...parts.map(part => {
    if (part.name === initrdSection) return customSection(initrdSection, Buffer.concat([initrd, overlay]));
    if (part.name === dataDiskSection) return customSection(dataDiskSection, disk);
    return part.bytes;
})]);
async function writeAsset(path, bytes) {
    const temporary = `${path}.${process.pid}`;
    await mkdir(dirname(path), { recursive: true });
    try {
        await writeFile(temporary, bytes);
        await rename(temporary, path);
    } finally {
        await rm(temporary, { force: true });
    }
}
await writeAsset(join(root, `public/guest-tools/duckdb-${duckdb.version}.gz`), tools.duckdbAsset);
await writeAsset(join(root, 'public/guest-tools/zsh-prompts.json'), JSON.stringify(tools.promptThemes) + '\n');
await writeThirdPartyNotices(join(dirname(output), 'third-party.txt'), tools.duckdbNotice);
await writeAsset(output, image);
console.log(`Built public/portfolio.wasm with a ${overlay.length}-byte portfolio initramfs overlay`);
