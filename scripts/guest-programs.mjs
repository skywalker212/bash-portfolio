import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const elfMagic = Buffer.from([0x7f, 0x45, 0x4c, 0x46]);
const aarch64 = 183;
const interpreterSegment = 3;

function validateProgram(data, path) {
    if (data[0] === 0x23 && data[1] === 0x21) return; // Script with a shebang.

    if (data.length < 64 || !data.subarray(0, 4).equals(elfMagic) ||
        data[4] !== 2 || data[5] !== 1 || data.readUInt16LE(18) !== aarch64) {
        throw new Error(`${path}: expected a Linux ARM64 executable or a script with a shebang`);
    }

    const type = data.readUInt16LE(16);
    const offset = Number(data.readBigUInt64LE(32));
    const size = data.readUInt16LE(54);
    const count = data.readUInt16LE(56);
    if ((type !== 2 && type !== 3) || data.readBigUInt64LE(24) === 0n ||
        offset < 64 || size < 56 || count === 0 || offset + count * size > data.length) {
        throw new Error(`${path}: invalid ARM64 ELF executable headers`);
    }

    for (let i = 0; i < count; i++) {
        if (data.readUInt32LE(offset + i * size) === interpreterSegment) {
            throw new Error(`${path}: use a static Linux ARM64 binary for the guest`);
        }
    }
}

export async function readGuestPrograms(directory) {
    const files = await readdir(directory, { withFileTypes: true });
    const programs = new Map();

    for (const file of files) {
        const path = join(directory, file.name);
        if (!file.isFile()) throw new Error(`${path}: expected a regular file`);

        const compressed = file.name.endsWith('.gz');
        const name = compressed ? file.name.slice(0, -3) : file.name;
        if (!name || name === '.' || name === '..') throw new Error(`${path}: invalid command name`);
        if (programs.has(name)) throw new Error(`${path}: duplicate command name "${name}"`);

        let data = await readFile(path);
        if (compressed) {
            try {
                data = gunzipSync(data);
            } catch (error) {
                throw new Error(`${path}: invalid gzip file`, { cause: error });
            }
        }
        validateProgram(data, path);
        programs.set(name, data);
    }

    return [...programs.keys()].sort().map(name => ({ name, data: programs.get(name) }));
}
