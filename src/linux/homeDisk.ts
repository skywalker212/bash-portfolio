/// <reference lib="webworker" />

import { CowDisk, openDataDisk, SparseBase } from 'unkernel/web';
import type { BlockDevice, KwsparseImage } from 'unkernel/web';
import { openOpfsDisk } from './opfsDisk';

const diskName = 'portfolio-home';
const diskVersion = 'v1';
const fileName = `${diskName}-${diskVersion}.img`;
const homeInUse = 'Your home directory is open in another tab. Close it there, then restart this session.';

interface HomeDisk {
    device: BlockDevice;
    temporary: boolean;
    close(): void | Promise<void>;
}

function storageUnavailable(error: unknown) {
    return error instanceof DOMException && [
        'NotAllowedError', 'NotSupportedError', 'SecurityError',
        'InvalidStateError', 'QuotaExceededError', 'UnknownError',
    ].includes(error.name);
}

async function existingOpfsFile(root: FileSystemDirectoryHandle) {
    try {
        return await root.getFileHandle(fileName);
    } catch (error) {
        if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error;
    }
}

async function hasIndexedDisk() {
    try {
        const databases = await globalThis.indexedDB?.databases?.();
        return databases?.some(({ name }) => name === `kwdisk:${diskName}-${diskVersion}`);
    } catch (error) {
        if (!storageUnavailable(error)) throw error;
    }
}

async function openOpfsHandle() {
    try {
        const root = await navigator.storage?.getDirectory?.();
        if (!root) return;
        const existing = await existingOpfsFile(root);
        // Keep using an IndexedDB home if a browser update adds OPFS support.
        if ((!existing || (await existing.getFile()).size === 0) && await hasIndexedDisk()) return;
        const file = existing ?? await root.getFileHandle(fileName, { create: true });
        return await file.createSyncAccessHandle?.();
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NoModificationAllowedError') {
            throw new Error(homeInUse);
        }
        if (!storageUnavailable(error)) throw error;
    }
}

async function openIndexedDisk(template: KwsparseImage, signal: AbortSignal, onError: (error: unknown) => void) {
    if (!navigator.locks || typeof globalThis.indexedDB === 'undefined') return;

    // unkernel's IndexedDB disk has one writer. The worker holds the lock until
    // the store is closed, and the browser releases it if the worker is killed.
    const opened = Promise.withResolvers<HomeDisk>();
    const released = Promise.withResolvers<void>();
    void navigator.locks.request(diskName, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]),
    }, async () => {
        const device = await openDataDisk({ template, name: diskName, version: diskVersion, onError });
        opened.resolve({
            device,
            temporary: false,
            async close() {
                try {
                    await device.store?.close?.();
                } finally {
                    released.resolve();
                }
            },
        });
        await released.promise;
    }).catch(opened.reject);
    try {
        return await opened.promise;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            throw new Error(homeInUse);
        }
        if (!storageUnavailable(error)) throw error;
    }
}

export async function openHomeDisk(template: KwsparseImage, signal: AbortSignal, onError: (error: unknown) => void): Promise<HomeDisk> {
    const handle = await openOpfsHandle();
    if (handle) {
        try {
            const device = openOpfsDisk(handle, template);
            return { device, temporary: false, close: () => handle.close() };
        } catch (error) {
            handle.close();
            throw error;
        }
    }

    const disk = await openIndexedDisk(template, signal, onError);
    if (disk) return disk;

    const device = new CowDisk(new SparseBase(template.size, template.map()));
    return { device, temporary: true, close() {} };
}
