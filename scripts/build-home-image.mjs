import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { encodeKwsparse } from 'unkernel/node';

const scratch = await mkdtemp(join(tmpdir(), 'portfolio-home-'));
const blockSize = 4096;
const blocks = 8192;
const uuid = 'e0ca1048-a803-4b13-978d-ab2e64c425f8';

try {
    const disk = join(scratch, 'home.ext4');
    execFileSync(process.env.MKE2FS || 'mke2fs', [
        '-q', '-F', '-t', 'ext4', '-b', String(blockSize), '-m', '0',
        '-L', 'kwdata', '-U', uuid,
        '-E', `hash_seed=${uuid},lazy_itable_init=0,lazy_journal_init=0,root_owner=0:0`,
        disk, String(blocks),
    ], { stdio: 'inherit', env: { ...process.env, E2FSPROGS_FAKE_TIME: '1700000000' } });

    const image = await readFile(disk);
    const sparse = encodeKwsparse({
        size: image.length,
        blockSize,
        blocks: Array.from({ length: blocks }, (_, block) => [
            block, image.subarray(block * blockSize, (block + 1) * blockSize),
        ]),
    });
    await writeFile(new URL('../data/linux/home.kwsparse.gz', import.meta.url), gzipSync(sparse));
} finally {
    await rm(scratch, { recursive: true, force: true });
}
