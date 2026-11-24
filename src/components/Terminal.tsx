'use client';

import { useEffect, useRef, useState } from 'react';
import type { Terminal as Xterm } from '@xterm/xterm';
import { startLinuxSession, type GuestFiles } from '@/linux/session';
import styles from '@/styles/Terminal.module.css';

type Status =
    | { phase: 'booting' | 'running' | 'exited' }
    | { phase: 'failed'; message: string };

function openLink(_event: MouseEvent, uri: string) {
    if (/^(https?:\/\/|mailto:)/i.test(uri)) {
        window.open(uri, '_blank', 'noopener,noreferrer');
    }
}

function renderBytes(terminal: Xterm, bytes: Uint8Array, signal: AbortSignal) {
    return new Promise<void>(resolve => {
        function done() {
            signal.removeEventListener('abort', done);
            resolve();
        }
        if (signal.aborted) {
            resolve();
            return;
        }
        signal.addEventListener('abort', done, { once: true });
        terminal.write(bytes, done);
    });
}

export default function Terminal({ files, banner }: { files: GuestFiles; banner: string }) {
    const surface = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<Status>({ phase: 'booting' });
    const [generation, setGeneration] = useState(0);

    useEffect(() => {
        const container = surface.current;
        if (!container) return;

        const controller = new AbortController();
        const { signal } = controller;
        let terminal: Xterm | undefined;
        let observer: ResizeObserver | undefined;

        function fail(error: unknown) {
            if (signal.aborted) return;
            setStatus({
                phase: 'failed',
                message: error instanceof Error ? error.message : 'The Linux session ended unexpectedly.',
            });
            controller.abort();
        }

        async function connect(container: HTMLDivElement) {
            const [{ Terminal }, { FitAddon }, { WebLinksAddon }] = await Promise.all([
                import('@xterm/xterm'),
                import('@xterm/addon-fit'),
                import('@xterm/addon-web-links'),
            ]);
            signal.throwIfAborted();

            const style = getComputedStyle(container);
            const color = (variable: string) => style.getPropertyValue(variable).trim();
            const xterm = new Terminal({
                fontFamily: style.fontFamily,
                fontSize: parseFloat(style.fontSize),
                lineHeight: 1.3,
                cursorStyle: 'bar',
                cursorInactiveStyle: 'none',
                cursorBlink: true,
                disableStdin: true,
                screenReaderMode: true,
                theme: {
                    background: color('--terminal-bg'),
                    foreground: color('--terminal-text'),
                    green: color('--terminal-prompt'),
                    cursor: color('--terminal-text'),
                    selectionBackground: color('--terminal-selection'),
                },
                linkHandler: { activate: openLink, allowNonHttpProtocols: true },
            });
            terminal = xterm;

            const fit = new FitAddon();
            xterm.loadAddon(fit);
            xterm.loadAddon(new WebLinksAddon(openLink));
            xterm.open(container);

            const resize = () => {
                xterm.options.fontSize = parseFloat(getComputedStyle(container).fontSize);
                fit.fit();
            };
            observer = new ResizeObserver(resize);
            observer.observe(container);
            resize();

            const session = await startLinuxSession(files, { cols: xterm.cols, rows: xterm.rows }, signal);
            const { pty } = session;
            try {
                signal.throwIfAborted();
                pty.resize(xterm.cols, xterm.rows);
                const input = xterm.onData(data => {
                    void pty.write(data).catch(error => {
                        if (pty.exitCode === null) fail(error);
                    });
                });
                const size = xterm.onResize(({ cols, rows }) => pty.resize(cols, rows));
                try {
                    xterm.options.disableStdin = false;
                    setStatus({ phase: 'running' });
                    if (matchMedia('(pointer: fine)').matches) xterm.focus();

                    const output = pty.output.pipeTo(new WritableStream({
                        write: bytes => renderBytes(xterm, bytes, signal),
                    }), { signal });
                    await Promise.all([pty.ended, output]);
                    if (!signal.aborted) setStatus({ phase: 'exited' });
                } finally {
                    input.dispose();
                    size.dispose();
                    if (!signal.aborted) xterm.options.disableStdin = true;
                }
            } finally {
                await session.stop();
            }
        }

        void connect(container).catch(fail);
        return () => {
            controller.abort();
            observer?.disconnect();
            terminal?.dispose();
        };
    }, [files, generation]);

    function restart() {
        setStatus({ phase: 'booting' });
        setGeneration(value => value + 1);
    }

    return (
        <section className={styles.terminal} aria-label="Linux terminal" aria-busy={status.phase === 'booting'}>
            <div className={styles.surface} ref={surface} />
            {(status.phase === 'booting' || status.phase === 'failed') && (
                <div className={styles.preview}>
                    <pre className={styles.banner}>{banner}</pre>
                    {status.phase === 'failed'
                        ? <p className={styles.error} role="alert">{status.message}</p>
                        : <p>Type &apos;help&apos; for available commands.</p>}
                </div>
            )}
            {(status.phase === 'exited' || status.phase === 'failed') && (
                <button className={styles.restart} type="button" onClick={restart}>
                    Restart session
                </button>
            )}
        </section>
    );
}
