import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { readGuestPrograms } from './guest-programs.mjs';

function elf({ type = 2, machine = 183, segment = 1 } = {}) {
    // A synthetic ELF64 header with one program header and a nonzero entry.
    const data = Buffer.alloc(120);
    data.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1]);
    data.writeUInt16LE(type, 16);
    data.writeUInt16LE(machine, 18);
    data.writeUInt32LE(1, 20);
    data.writeBigUInt64LE(0x400000n, 24);
    data.writeBigUInt64LE(64n, 32);
    data.writeUInt16LE(64, 52);
    data.writeUInt16LE(56, 54);
    data.writeUInt16LE(1, 56);
    data.writeUInt32LE(segment, 64);
    return data;
}

async function programs(t, files = {}) {
    const directory = await mkdtemp(join(tmpdir(), 'guest-programs-'));
    t.after(() => rm(directory, { recursive: true, force: true }));
    for (const [name, data] of Object.entries(files)) {
        await writeFile(join(directory, name), data);
    }
    return directory;
}

test('loads scripts, raw ELF, and compressed static PIE in installed name order', async t => {
    const script = Buffer.from('#!/bin/sh\necho hello\n');
    const raw = elf();
    const pie = elf({ type: 3 });
    const directory = await programs(t, {
        'sample.gz': gzipSync(pie),
        'sample-mode': raw,
        'hello': script,
    });

    assert.deepEqual(await readGuestPrograms(directory), [
        { name: 'hello', data: script },
        { name: 'sample', data: pie },
        { name: 'sample-mode', data: raw },
    ]);
});

test('rejects two artifacts with the same installed name', async t => {
    const directory = await programs(t, { tool: elf(), 'tool.gz': gzipSync(elf()) });
    await assert.rejects(readGuestPrograms(directory), /duplicate command name/);
});

test('rejects subdirectories in command directories', async t => {
    const directory = await programs(t);
    await mkdir(join(directory, 'nested'));
    await assert.rejects(readGuestPrograms(directory), /expected a regular file/);
});

test('rejects an invalid gzip payload', async t => {
    const directory = await programs(t, { 'tool.gz': 'wrong format' });
    await assert.rejects(readGuestPrograms(directory), /invalid gzip/);
});

test('rejects a Linux executable for another architecture', async t => {
    const directory = await programs(t, { tool: elf({ machine: 62 }) });
    await assert.rejects(readGuestPrograms(directory), /expected a Linux ARM64 executable/);
});

test('rejects executables that require a dynamic linker', async t => {
    const directory = await programs(t, { tool: elf({ segment: 3 }) });
    await assert.rejects(readGuestPrograms(directory), /use a static Linux ARM64 binary/);
});

test('rejects plain text without a shebang', async t => {
    const directory = await programs(t, { tool: 'echo hello' });
    await assert.rejects(readGuestPrograms(directory), /script with a shebang/);
});
