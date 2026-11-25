export async function startLinuxSession(
    size: { cols: number; rows: number },
    signal: AbortSignal,
) {
    const { checkSupport, createKernel } = await import('unkernel/web');
    if (!(await checkSupport()).ok) {
        throw new Error('This browser does not support the WebAssembly features needed to run Linux.');
    }
    signal.throwIfAborted();

    const kernel = await createKernel({
        kernel: new URL('/portfolio.wasm', window.location.origin),
        worker: true,
        cpus: 1,
        memoryMiB: 128,
        signal,
    });
    try {
        const pty = await kernel.spawn('/opt/portfolio/login', [], { ...size, user: 0, signal });
        return { pty, stop: () => kernel.stop() };
    } catch (error) {
        await kernel.stop();
        throw error;
    }
}
