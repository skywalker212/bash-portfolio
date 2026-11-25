/// <reference lib="webworker" />

import { bundledBoot, checkSupport, createKernel, loadKernelModule, readKwsparse } from 'unkernel/web';
import type { KernelHandle, Pty } from 'unkernel/web';
import { openHomeDisk } from './homeDisk';
import type { SessionEvent, SessionRequest } from './sessionMessages';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const boot = new AbortController();
const stopping = Promise.withResolvers<null>();
let shell: Pty | undefined;

function post(message: SessionEvent, transfer: Transferable[] = []) {
    scope.postMessage(message, transfer);
}

async function run({ kernel: url, size }: Extract<SessionRequest, { type: 'start' }>) {
    const { signal } = boot;
    let kernel: KernelHandle | undefined;
    let disk: Awaited<ReturnType<typeof openHomeDisk>> | undefined;
    let code: number | null = null;
    let error: string | undefined;
    const message = (cause: unknown) => cause instanceof Error ? cause.message : String(cause);

    try {
        if (!(await checkSupport()).ok) {
            throw new Error('This browser does not support the WebAssembly features needed to run Linux.');
        }
        const module = await loadKernelModule(url, { signal });
        const template = bundledBoot(module).datadisk;
        if (!template) throw new Error('The Linux image is missing its home-disk template.');
        disk = await openHomeDisk(await readKwsparse(template), signal, cause => {
            error = `The browser could not save your home directory. ${message(cause)}`;
            stopping.resolve(null);
        });
        kernel = await createKernel({ kernel: module, disks: [disk.device], memoryMiB: 128, cpus: 1, signal });

        const pty = await kernel.spawn('/opt/portfolio/login', [], { ...size, user: 0, signal });
        shell = pty;
        const input = new WritableStream<string>({ write: data => pty.write(data) });
        const { output } = pty;
        post({ type: 'ready', input, output, temporary: disk.temporary }, [input, output]);
        const end = await Promise.race([pty.ended, stopping.promise]);
        code = end?.type === 'exit' ? end.code : null;
    } catch (cause) {
        if (!signal.aborted) error = message(cause);
    } finally {
        try {
            if (kernel) {
                try {
                    if (shell) await kernel.sync({ timeout: 1000 });
                } finally {
                    await kernel.stop();
                }
            }
        } catch (cause) {
            error ??= message(cause);
        } finally {
            try {
                await disk?.close();
            } catch (cause) {
                error ??= message(cause);
            }
            post({ type: 'closed', code, error });
        }
    }
}

scope.onmessage = (event: MessageEvent<SessionRequest>) => {
    const request = event.data;
    switch (request.type) {
        case 'start':
            void run(request);
            break;
        case 'resize':
            shell?.resize(request.size.cols, request.size.rows);
            break;
        case 'stop':
            if (!shell) boot.abort();
            stopping.resolve(null);
            break;
    }
};
