import { F_FLUSH, FlushTracker } from 'unkernel/web';
import type { BlockDevice, KwsparseImage } from 'unkernel/web';

// The first sector belongs to the browser adapter. Linux sees only the ext4 image.
const dataOffset = 512;
const format = new TextEncoder().encode('portfolio-ext4-v1');
const readyOffset = format.length;
const ready = 1;

function readAll(handle: FileSystemSyncAccessHandle, buffer: Uint8Array, at: number) {
    for (let offset = 0; offset < buffer.length;) {
        const count = handle.read(buffer.subarray(offset), { at: at + offset });
        if (count === 0) throw new Error('The home disk returned a short read.');
        offset += count;
    }
}

function writeAll(handle: FileSystemSyncAccessHandle, buffer: Uint8Array, at: number) {
    for (let offset = 0; offset < buffer.length;) {
        const count = handle.write(buffer.subarray(offset), { at: at + offset });
        if (count === 0) throw new Error('The home disk returned a short write.');
        offset += count;
    }
}

export function openOpfsDisk(handle: FileSystemSyncAccessHandle, seed: KwsparseImage) {
    const size = handle.getSize();
    const header = new Uint8Array(readyOffset + 1);
    if (size > 0) {
        const prefix = header.subarray(0, Math.min(size, header.length));
        readAll(handle, prefix, 0);
        if (!format.every((byte, index) => header[index] === byte)) {
            throw new Error('The saved home disk has an unknown format.');
        }
    }

    if (header[readyOffset] === 0) {
        // Commit the ready byte only after the seed is durable. An interrupted
        // initialization leaves a known header and can be seeded again.
        handle.truncate(0);
        writeAll(handle, format, 0);
        handle.flush();
        handle.truncate(dataOffset + seed.size);
        seed.indices.forEach((block, index) => {
            writeAll(handle, seed.block(index), dataOffset + block * seed.blockSize);
        });
        handle.flush();
        writeAll(handle, Uint8Array.of(ready), readyOffset);
        handle.flush();
    } else if (header[readyOffset] !== ready || size !== dataOffset + seed.size) {
        throw new Error('The saved home disk does not match this Linux image.');
    }

    function transfer(io: typeof readAll, off: number, views: Uint8Array[]) {
        for (const view of views) {
            io(handle, view, dataOffset + off);
            off += view.length;
        }
    }

    const flushes = new FlushTracker();
    return {
        size: seed.size,
        flags: F_FLUSH,
        persistent: true,
        get flushSeq() { return flushes.flushSeq; },
        whenFlushed: after => flushes.whenFlushed(after),
        read: (off, views) => transfer(readAll, off, views),
        write: (off, views) => transfer(writeAll, off, views),
        flush() {
            const seq = flushes.begin();
            handle.flush();
            flushes.done(seq);
        },
    } satisfies BlockDevice;
}
