import { FsError } from 'unkernel/web';
import type { Fs } from 'unkernel/web';
import duckdb from '../../data/linux/duckdb.json';
import type { DuckDbDownload } from './sessionMessages';

export function duckdbFiles(kernelUrl: string, signal: AbortSignal, report: (state: DuckDbDownload) => void): Fs {
    const url = new URL(`guest-tools/duckdb-${duckdb.version}.gz`, kernelUrl);
    let binary: Promise<Uint8Array> | undefined;

    async function download() {
        const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(110_000)]) });
        if (!response.ok || !response.body) throw new Error(`DuckDB download failed (HTTP ${response.status})`);
        const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
        const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        if (bytes.byteLength !== duckdb.binarySize) throw new Error('DuckDB download has an unexpected size');
        return bytes;
    }

    return {
        getattr(path) {
            if (path === '/') return { type: 'dir', uid: 0, gid: 0 };
            if (path === '/duckdb') return { type: 'file', uid: 0, gid: 0, mode: 0o755, size: duckdb.binarySize };
            throw new FsError('ENOENT');
        },
        readdir(path) {
            if (path !== '/') throw new FsError('ENOTDIR');
            return [{ name: 'duckdb', type: 'file' }];
        },
        open(path) {
            if (path !== '/duckdb') throw new FsError('ENOENT');
            return {
                async read(offset, length) {
                    if (!binary) {
                        report('loading');
                        binary = download().then(bytes => {
                            report('ready');
                            return bytes;
                        }, error => {
                            binary = undefined;
                            report('failed');
                            throw error;
                        });
                    }
                    return (await binary).subarray(offset, offset + length);
                },
            };
        },
    };
}
