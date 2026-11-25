import type { DuckDbDownload, SessionEvent, SessionRequest, TerminalSize, ZshPrompt } from './sessionMessages';

export async function startLinuxSession(
    size: TerminalSize,
    signal: AbortSignal,
    prompt: ZshPrompt,
    onDuckDbDownload: (state: DuckDbDownload) => void,
) {
    signal.throwIfAborted();
    const worker = new Worker(new URL('./guest.worker.ts', import.meta.url), { type: 'module' });
    const ready = Promise.withResolvers<Extract<SessionEvent, { type: 'ready' }>>();
    const finished = Promise.withResolvers<Extract<SessionEvent, { type: 'closed' }>>();
    let result: Extract<SessionEvent, { type: 'closed' }> | undefined;
    let shutdownTimer: ReturnType<typeof setTimeout> | undefined;

    function send(message: SessionRequest) {
        worker.postMessage(message);
    }

    function finish(message: Extract<SessionEvent, { type: 'closed' }>) {
        if (result) return;
        result = message;
        clearTimeout(shutdownTimer);
        signal.removeEventListener('abort', stop);
        finished.resolve(message);
    }

    async function stop() {
        if (!result && shutdownTimer === undefined) {
            send({ type: 'stop' });
            shutdownTimer = setTimeout(() => finish({ type: 'closed', code: null }), 3000);
        }
        await finished.promise;
        worker.terminate();
    }

    worker.onmessage = (event: MessageEvent<SessionEvent>) => {
        const message = event.data;
        if (message.type === 'ready') ready.resolve(message);
        if (message.type === 'closed') finish(message);
        if (message.type === 'duckdb-download' && !signal.aborted) onDuckDbDownload(message.state);
    };
    worker.onerror = event => {
        event.preventDefault();
        finish({ type: 'closed', code: null, error: event.message || 'The Linux worker stopped unexpectedly.' });
    };
    worker.onmessageerror = () => {
        finish({ type: 'closed', code: null, error: 'This browser could not connect to the Linux terminal.' });
    };

    signal.addEventListener('abort', stop, { once: true });
    send({ type: 'start', kernel: new URL('/portfolio.wasm', window.location.origin).href, size, prompt });

    try {
        const { input, output, temporary } = await Promise.race([
            ready.promise,
            finished.promise.then(({ error }) => {
                throw new Error(error || 'The Linux session closed before login.');
            }),
        ]);
        const writer = input.getWriter();
        const pty = {
            output,
            write: (text: string) => writer.write(text),
            resize: (cols: number, rows: number) => {
                if (!result) send({ type: 'resize', size: { cols, rows } });
            },
            get exitCode() { return result?.code ?? null; },
            ended: finished.promise.then(({ code, error }) => {
                if (error) throw new Error(error);
                return { code };
            }),
        };
        return {
            pty, stop, temporary,
            setPrompt(prompt: ZshPrompt) {
                if (!result) send({ type: 'zsh-prompt', prompt });
            },
        };
    } catch (error) {
        await stop();
        throw error;
    }
}
