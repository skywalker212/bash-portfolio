export interface GuestFiles {
    [name: string]: string | GuestFiles;
}

const USER = 'skywalker212';
const HOST = 'akash.is';
const SOURCE = '/mnt/portfolio-source';

export async function startLinuxSession(
    files: GuestFiles,
    size: { cols: number; rows: number },
    signal: AbortSignal,
) {
    const { checkSupport, createKernel } = await import('unkernel/web');
    if (!(await checkSupport()).ok) {
        throw new Error('This browser does not support the WebAssembly features needed to run Linux.');
    }
    signal.throwIfAborted();

    const kernel = await createKernel({ worker: true, cpus: 1, memoryMiB: 128, signal });
    try {
        const source = await kernel.mount(SOURCE, files, { readOnly: true });
        const setup = await kernel.exec('/bin/sh', [
            `${SOURCE}/setup.sh`, SOURCE, USER, HOST,
        ], { signal });
        if (setup.exitCode !== 0) {
            throw new Error(setup.stderr.trim() || 'Unable to initialize the Linux guest.');
        }
        await source.unmount();
        // The guest's login applet prints /etc/motd and switches to the portfolio user.
        const pty = await kernel.spawn('/bin/busybox', ['login', '-f', USER], {
            ...size,
            user: 0,
            signal,
        });
        return { pty, stop: () => kernel.stop() };
    } catch (error) {
        await kernel.stop();
        throw error;
    }
}
