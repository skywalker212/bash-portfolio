'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { FitAddon as XtermFit } from '@xterm/addon-fit';
import type { Terminal as Xterm } from '@xterm/xterm';
import { startLinuxSession } from '@/linux/session';
import type { DuckDbDownload } from '@/linux/sessionMessages';
import styles from '@/styles/Terminal.module.css';

type Status =
    | { phase: 'booting' | 'running' | 'exited' }
    | { phase: 'failed'; message: string };

const themes = { classic: 'Classic', midnight: 'Midnight', light: 'Light' };
const fontSizes = ['auto', '12', '14', '16', '18', '20', '24'];
const cursors = { bar: 'Bar', block: 'Block', underline: 'Underline' };
type Preferences = { theme: keyof typeof themes; fontSize: string; cursor: keyof typeof cursors };
const defaults: Preferences = { theme: 'classic', fontSize: 'auto', cursor: 'bar' };
const preferencesKey = 'portfolio-terminal-preferences';
const downloadMessages = {
    loading: 'Downloading DuckDB…',
    ready: '',
    failed: 'DuckDB download failed. Run duckdb to retry.',
};

function readPreferences(): Preferences {
    try {
        const saved = JSON.parse(localStorage.getItem(preferencesKey) ?? '{}');
        return {
            theme: Object.hasOwn(themes, saved.theme) ? saved.theme : defaults.theme,
            fontSize: fontSizes.includes(saved.fontSize) ? saved.fontSize : defaults.fontSize,
            cursor: Object.hasOwn(cursors, saved.cursor) ? saved.cursor : defaults.cursor,
        };
    } catch {
        return defaults;
    }
}

function terminalTheme(style: CSSStyleDeclaration) {
    const color = (name: string) => style.getPropertyValue(`--terminal-${name}`).trim() || undefined;
    return {
        background: color('bg'), foreground: color('text'), cursor: color('text'),
        selectionBackground: color('selection'), black: color('black'), red: color('red'),
        green: color('prompt'), yellow: color('yellow'), blue: color('blue'),
        magenta: color('magenta'), cyan: color('cyan'), white: color('white'),
        brightBlack: color('bright-black'), brightRed: color('red'), brightGreen: color('bright-green'),
        brightYellow: color('yellow'), brightBlue: color('blue'), brightMagenta: color('magenta'),
        brightCyan: color('cyan'), brightWhite: color('white'),
    };
}

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

function acceptNativeText(terminal: Xterm, signal: AbortSignal) {
    const { textarea } = terminal;
    if (!textarea) return;

    // xterm handles key events and IME composition in screen reader mode.
    // Input-only events from soft keyboards and emoji pickers need forwarding.
    let keyDown = false;
    let composing = false;
    let endComposition: ReturnType<typeof setTimeout> | undefined;
    textarea.addEventListener('keydown', () => { keyDown = true; }, { signal });
    textarea.addEventListener('keyup', () => { keyDown = false; }, { signal });
    textarea.addEventListener('blur', () => { keyDown = false; }, { signal });
    textarea.addEventListener('compositionstart', () => {
        clearTimeout(endComposition);
        composing = true;
    }, { signal });
    textarea.addEventListener('compositionend', () => {
        endComposition = setTimeout(() => { composing = false; });
    }, { signal });
    textarea.addEventListener('input', event => {
        const { data, inputType, isComposing } = event as InputEvent;
        if (keyDown || composing || isComposing) return;
        if (inputType === 'insertText' && data) terminal.input(data, true);
        if (inputType === 'deleteContentBackward') terminal.input('\x7f', true);
        if (inputType === 'insertLineBreak') terminal.input('\r', true);
    }, { signal });
    signal.addEventListener('abort', () => clearTimeout(endComposition), { once: true });
}

export default function Terminal({ motd, fallback }: { motd: string; fallback: ReactNode }) {
    const surface = useRef<HTMLDivElement>(null);
    const settings = useRef<HTMLDialogElement>(null);
    const active = useRef<{ terminal: Xterm; fit: XtermFit } | null>(null);
    const [preferences, setPreferences] = useState(defaults);
    const [status, setStatus] = useState<Status>({ phase: 'booting' });
    const [generation, setGeneration] = useState(0);
    const [bellRinging, setBellRinging] = useState(false);
    const [duckDbDownload, setDuckDbDownload] = useState<DuckDbDownload>('ready');

    useEffect(() => setPreferences(readPreferences()), []);

    useEffect(() => {
        const container = surface.current;
        if (!container || !active.current) return;
        const { terminal, fit } = active.current;
        const style = getComputedStyle(container);
        terminal.options.theme = terminalTheme(style);
        terminal.options.fontSize = parseFloat(style.fontSize);
        terminal.options.cursorStyle = preferences.cursor;
        fit.fit();
    }, [preferences]);

    useEffect(() => {
        const container = surface.current;
        if (!container) return;

        const controller = new AbortController();
        const { signal } = controller;
        let terminal: Xterm | undefined;
        let observer: ResizeObserver | undefined;
        let resizeFrame: number | undefined;

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
            const xterm = new Terminal({
                fontFamily: style.fontFamily,
                fontSize: parseFloat(style.fontSize),
                lineHeight: 1.3,
                cursorStyle: style.getPropertyValue('--terminal-cursor').trim() as Preferences['cursor'],
                cursorInactiveStyle: 'none',
                cursorBlink: true,
                disableStdin: true,
                screenReaderMode: true,
                theme: terminalTheme(style),
                linkHandler: { activate: openLink, allowNonHttpProtocols: true },
            });
            terminal = xterm;

            const fit = new FitAddon();
            xterm.loadAddon(fit);
            xterm.loadAddon(new WebLinksAddon(openLink));
            xterm.open(container);
            acceptNativeText(xterm, signal);
            active.current = { terminal: xterm, fit };

            const resize = () => {
                xterm.options.fontSize = parseFloat(getComputedStyle(container).fontSize);
                fit.fit();
            };
            observer = new ResizeObserver(() => {
                if (resizeFrame !== undefined) return;
                resizeFrame = requestAnimationFrame(() => {
                    resizeFrame = undefined;
                    resize();
                });
            });
            observer.observe(container);
            resize();

            const session = await startLinuxSession({ cols: xterm.cols, rows: xterm.rows }, signal, setDuckDbDownload);
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
                const pageTitle = document.title;
                let guestTitle: string | undefined;
                let bellTimer: ReturnType<typeof setTimeout> | undefined;
                const bell = xterm.onBell(() => {
                    clearTimeout(bellTimer);
                    setBellRinging(true);
                    bellTimer = setTimeout(() => setBellRinging(false), 1200);
                });
                const title = xterm.onTitleChange(value => {
                    const label = value.trim().slice(0, 120);
                    guestTitle = label ? `${label} | ${pageTitle}` : pageTitle;
                    document.title = guestTitle;
                });
                try {
                    if (session.temporary) xterm.writeln('Temporary home. Files are lost when this session closes.');
                    xterm.options.disableStdin = false;
                    setStatus({ phase: 'running' });
                    if (!settings.current?.open && matchMedia('(pointer: fine)').matches) xterm.focus();

                    const output = pty.output.pipeTo(new WritableStream({
                        write: bytes => renderBytes(xterm, bytes, signal),
                    }), { signal });
                    await Promise.all([pty.ended, output]);
                    if (!signal.aborted) setStatus({ phase: 'exited' });
                } finally {
                    input.dispose();
                    size.dispose();
                    bell.dispose();
                    title.dispose();
                    clearTimeout(bellTimer);
                    if (document.title === guestTitle) document.title = pageTitle;
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
            if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
            active.current = null;
            terminal?.dispose();
        };
    }, [generation]);

    function changePreferences(next: Preferences) {
        setPreferences(next);
        try {
            localStorage.setItem(preferencesKey, JSON.stringify(next));
        } catch {
            // The current tab can still apply these settings.
        }
    }

    function restart() {
        setBellRinging(false);
        setDuckDbDownload('ready');
        setStatus({ phase: 'booting' });
        setGeneration(value => value + 1);
    }

    let terminalStatus = '';
    if (status.phase === 'booting') terminalStatus = 'Starting Linux…';
    if (status.phase === 'running') terminalStatus = downloadMessages[duckDbDownload] || (bellRinging ? 'Terminal bell' : '');

    return (
        <section className={styles.terminal} data-theme={preferences.theme}
            data-cursor={preferences.cursor} aria-label="Linux terminal" aria-busy={status.phase === 'booting'}>
            <div className={styles.toolbar}>
                <span className={styles.status} role="status">{terminalStatus}</span>
                {status.phase === 'running' && (
                    <button className={styles.escape} type="button" onPointerDown={event => event.preventDefault()}
                        onClick={() => active.current?.terminal.input('\x1b', true)} aria-label="Send Escape">Esc</button>
                )}
                <button type="button" onClick={() => settings.current?.showModal()}>Terminal settings</button>
            </div>
            <div className={styles.viewport}>
                <div className={styles.surface} ref={surface}
                    style={{ fontSize: preferences.fontSize === 'auto' ? undefined : `${preferences.fontSize}px` }} />
                {status.phase === 'booting' && (
                    <div className={styles.preview}><pre className={styles.motd}>{motd}</pre></div>
                )}
                {status.phase === 'failed' && (
                    <div className={`${styles.preview} ${styles.fallback}`}>
                        <p className={styles.error} role="alert">{status.message}</p>
                        {fallback}
                    </div>
                )}
                {(status.phase === 'exited' || status.phase === 'failed') && (
                    <button className={styles.restart} type="button" onClick={restart}>
                        Restart session
                    </button>
                )}
            </div>
            <dialog className={styles.settings} ref={settings} aria-labelledby="terminal-settings-title"
                onClose={() => {
                    if (status.phase === 'running') active.current?.terminal.focus();
                }}>
                <h2 id="terminal-settings-title">Terminal settings</h2>
                <label>
                    Theme
                    <select value={preferences.theme} onChange={event => changePreferences({
                        ...preferences, theme: event.currentTarget.value as Preferences['theme'],
                    })}>
                        {Object.entries(themes).map(([key, title]) => <option key={key} value={key}>{title}</option>)}
                    </select>
                </label>
                <label>
                    Font size
                    <select value={preferences.fontSize} onChange={event => changePreferences({
                        ...preferences, fontSize: event.currentTarget.value,
                    })}>
                        {fontSizes.map(size => <option key={size} value={size}>{size === 'auto' ? 'Auto' : `${size} px`}</option>)}
                    </select>
                </label>
                <label>
                    Default cursor
                    <select value={preferences.cursor} onChange={event => changePreferences({
                        ...preferences, cursor: event.currentTarget.value as Preferences['cursor'],
                    })}>
                        {Object.entries(cursors).map(([key, title]) => <option key={key} value={key}>{title}</option>)}
                    </select>
                </label>
                <form method="dialog"><button type="submit">Done</button></form>
            </dialog>
        </section>
    );
}
