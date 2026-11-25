/// <reference lib="webworker" />

import { bundledBoot, checkSupport, createKernel, loadKernelModule, MemoryFs, readKwsparse } from 'unkernel/web';
import type { KernelHandle, Pty, VsockConnection, VsockListener } from 'unkernel/web';
import { duckdbFiles } from './duckdb';
import { openHomeDisk } from './homeDisk';
import type { SessionEvent, SessionRequest, ZshPrompt } from './sessionMessages';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const boot = new AbortController();
const stopping = Promise.withResolvers<null>();
const promptPort = 46217;
const promptWriters = new Set<WritableStreamDefaultWriter<Uint8Array | string>>();
let shell: Pty | undefined;
let zshPrompt: ZshPrompt;

function promptFile() {
    const theme = /^[a-z0-9_-]+$/.test(zshPrompt.theme) ? zshPrompt.theme : 'portfolio';
    const format = zshPrompt.format.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').slice(0, 160);
    return `${theme}\n${format}\n`;
}

function watchPrompt(connection: VsockConnection) {
    const writer = connection.writable.getWriter();
    promptWriters.add(writer);
    void writer.write('\n').catch(() => {});
    void connection.closed.then(() => {
        promptWriters.delete(writer);
        writer.releaseLock();
    });
}

function post(message: SessionEvent, transfer: Transferable[] = []) {
    scope.postMessage(message, transfer);
}

async function run({ kernel: url, size }: Extract<SessionRequest, { type: 'start' }>) {
    const { signal } = boot;
    let kernel: KernelHandle | undefined;
    let promptEvents: VsockListener | undefined;
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
        const tools = duckdbFiles(url, signal, state => post({ type: 'duckdb-download', state }));
        kernel = await createKernel({
            kernel: module,
            disks: [disk.device],
            memoryMiB: 192,
            cpus: 1,
            signal,
            mounts: {
                '/opt/portfolio/tools': { fs: tools, readOnly: true, requestTimeout: 120_000 },
                '/opt/portfolio/settings': {
                    fs: new MemoryFs({ prompt: promptFile, 'prompt-events': `${promptPort}\n` }),
                    readOnly: true,
                },
            },
        });
        promptEvents = kernel.vsock?.listen(promptPort, watchPrompt);

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
        promptEvents?.close();
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
            zshPrompt = request.prompt;
            void run(request);
            break;
        case 'zsh-prompt':
            if (zshPrompt.theme === request.prompt.theme && zshPrompt.format === request.prompt.format) break;
            zshPrompt = request.prompt;
            promptWriters.forEach(writer => { void writer.write('\n').catch(() => {}); });
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
