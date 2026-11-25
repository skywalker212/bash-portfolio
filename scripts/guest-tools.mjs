import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, readlink, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';
import duckdb from '../data/linux/duckdb.json' with { type: 'json' };

const tar = promisify(execFile);
const compress = promisify(gzip);
const alpine = 'https://dl-cdn.alpinelinux.org/alpine/v3.24';
const duckdbArchive = 'duckdb-cli-linux-arm64-musl.tar.gz';

const packages = [
    ['main', 'musl-1.2.6-r3', '2e17864102278d9049c3a56f1bceed9e8cf287065617e579325123443daed8a5'],
    ['main', 'libgcc-15.2.0-r5', '369aaa6e9d099a737bad6dd3e6c2fe7bb1547ca26d22b94ee0411228f709b403'],
    ['main', 'libstdc++-15.2.0-r5', '2302e766d4e4926038ec166ecb85837ee884576115236ddb565e3a5fca4a11d7'],
    ['main', 'libncursesw-6.6_p20260516-r0', '51a7aa4b3ec40b144d0801c0544e0a9f62e2a41d04b6067bb5e95786040741c6'],
    ['main', 'ncurses-terminfo-base-6.6_p20260516-r0', 'e0c546b9461bdce206a90bc720cb69aa4628b5a5b8d908c3e5084e00f28f6a9d'],
    ['main', 'pixman-0.46.4-r0', '022ab7d2b766f3893e6c457a03c723fe3e79e9f009d8a62d06f1692d9f2fc77f'],
    ['main', 'libcap2-2.78-r0', 'e13be383f18b1fcfe895361d816ff7cfd2b3c265e442bb371c4a234b29b0e4a9'],
    ['main', 'zsh-5.9-r7', 'e76097433573a22fe9978605ca8867ac0b9fd125c7a53ddb6ce98b5cd7dd4003'],
    ['community', 'vim-9.2.1352-r0', '8db535fc9cfae2cad19d679d2405d3554fc731b84a710b29aef34513115d104c'],
    ['community', 'vim-common-9.2.1352-r0', '74fe012b8c4034b4b821452173fcb02a754f0e2ab4fad427327742852770c47e'],
    ['community', 'xxd-9.2.1352-r0', '141a3ad801fb9e721c687a9b7f8a8ea8f65c6a852c09109f90043fc2361e748d'],
];

function sha256(bytes) {
    return createHash('sha256').update(bytes).digest('hex');
}

async function cacheFile(cache, staging, name, url, hash) {
    const path = join(cache, name);
    const cached = await readFile(path).catch(error => {
        if (error.code !== 'ENOENT') throw error;
    });
    if (cached && sha256(cached) === hash) return path;

    const response = await fetch(url, { signal: AbortSignal.timeout(90_000) });
    if (!response.ok) throw new Error(`Could not download ${name} (HTTP ${response.status})`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== hash) throw new Error(`SHA-256 mismatch for ${name}`);
    const temporary = join(staging, name);
    await writeFile(temporary, bytes);
    await rename(temporary, path);
    return path;
}

async function archiveEntries(root, directory = '') {
    const entries = [];
    const children = await readdir(join(root, directory), { withFileTypes: true });
    for (const child of children.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
        // Skip APK signatures, metadata, and install scripts.
        if (directory === '' && child.name.startsWith('.')) continue;
        const name = directory ? `${directory}/${child.name}` : child.name;
        const path = join(root, name);
        if (child.isDirectory()) {
            entries.push({ name, mode: 0o040755 }, ...await archiveEntries(root, name));
        } else if (child.isSymbolicLink()) {
            entries.push({ name, mode: 0o120777, data: Buffer.from(await readlink(path)) });
        } else if (child.isFile()) {
            const mode = (await stat(path)).mode & 0o111 ? 0o100755 : 0o100644;
            entries.push({ name, mode, data: await readFile(path) });
        } else {
            throw new Error(`Unsupported guest package entry ${name}`);
        }
    }
    return entries;
}

export async function prepareGuestTools(root) {
    const cache = join(root, '.cache/guest-tools');
    await mkdir(cache, { recursive: true });
    const staging = await mkdtemp(join(cache, 'build-'));
    try {
        const tree = join(staging, 'root');
        await mkdir(tree);
        const downloads = await Promise.allSettled([
            ...packages.map(([repo, version, hash]) => {
                const name = `${version}.apk`;
                return cacheFile(cache, staging, name, `${alpine}/${repo}/aarch64/${name}`, hash);
            }),
            cacheFile(cache, staging, duckdbArchive,
                `https://github.com/duckdb/duckdb/releases/download/${duckdb.version}/${duckdbArchive}`,
                '70b9c629688ba8a76e15021b4b9e2ee5687e04d835d2d2f14367ea698bcca913'),
            cacheFile(cache, staging, 'duckdb-LICENSE',
                `https://raw.githubusercontent.com/duckdb/duckdb/${duckdb.version}/LICENSE`,
                '075c33400ffcb0c586dd106a029d3e733e9da3693f8fcb9cebfc651c8a2f14e3'),
        ]);
        const archives = downloads.map(result => {
            if (result.status === 'rejected') throw result.reason;
            return result.value;
        });
        for (const archive of archives.slice(0, packages.length)) {
            await tar('tar', ['-xzf', archive, '-C', tree]);
        }
        await tar('tar', ['-xzf', archives[packages.length], '-C', staging, 'duckdb']);
        const binary = await readFile(join(staging, 'duckdb'));
        if (binary.length !== duckdb.binarySize) throw new Error('DuckDB binary size differs from the guest manifest');
        const licenseDir = join(tree, 'usr/share/licenses/duckdb');
        await mkdir(licenseDir, { recursive: true });
        const license = await readFile(archives.at(-1), 'utf8');
        await writeFile(join(licenseDir, 'LICENSE'), license);
        const entries = await archiveEntries(tree);
        entries.push({ name: 'usr/bin/duckdb', mode: 0o120777, data: Buffer.from('/opt/portfolio/tools/duckdb') });
        return { entries, duckdbAsset: await compress(binary), duckdbNotice: `DuckDB ${duckdb.version}\n\n${license.trimEnd()}` };
    } finally {
        await rm(staging, { recursive: true, force: true });
    }
}
