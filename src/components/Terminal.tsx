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
const arrows = [
    { label: '↑', name: 'Up arrow', code: 'A' },
    { label: '↓', name: 'Down arrow', code: 'B' },
    { label: '←', name: 'Left arrow', code: 'D' },
    { label: '→', name: 'Right arrow', code: 'C' },
] as const;

function controlInput(data: string) {
    if (data.length !== 1) return data;
    const code = data.charCodeAt(0);
    if (code >= 97 && code <= 122) return String.fromCharCode(code - 96);
    if (code >= 64 && code <= 95) return String.fromCharCode(code - 64);
    if (data === ' ') return '\x00';
    if (data === '?') return '\x7f';
    return data;
}

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
    const area = useRef<HTMLElement>(null);
    const surface = useRef<HTMLDivElement>(null);
    const settings = useRef<HTMLDialogElement>(null);
    const active = useRef<{ terminal: Xterm; fit: XtermFit } | null>(null);
    const controlKey = useRef(false);
    const [preferences, setPreferences] = useState(defaults);
    const [status, setStatus] = useState<Status>({ phase: 'booting' });
    const [generation, setGeneration] = useState(0);
    const [bellRinging, setBellRinging] = useState(false);
    const [duckDbDownload, setDuckDbDownload] = useState<DuckDbDownload>('ready');
    const [controlPressed, setControlPressed] = useState(false);

    useEffect(() => setPreferences(readPreferences()), []);

    useEffect(() => {
        const terminal = area.current;
        const viewport = window.visualViewport;
        if (!terminal || !viewport) return;
        const touch = matchMedia('(pointer: coarse)');
        const fitViewport = () => {
            if (touch.matches && Math.abs(viewport.scale - 1) < 0.01 && viewport.height > 0 && viewport.height < innerHeight - 1) {
                terminal.style.setProperty('--terminal-viewport-height', `${Math.floor(viewport.height)}px`);
                terminal.style.setProperty('--terminal-viewport-top', `${viewport.offsetTop}px`);
            } else {
                terminal.style.removeProperty('--terminal-viewport-height');
                terminal.style.removeProperty('--terminal-viewport-top');
            }
        };
        fitViewport();
        viewport.addEventListener('resize', fitViewport);
        viewport.addEventListener('scroll', fitViewport);
        window.addEventListener('resize', fitViewport);
        touch.addEventListener('change', fitViewport);
        return () => {
            viewport.removeEventListener('resize', fitViewport);
            viewport.removeEventListener('scroll', fitViewport);
            window.removeEventListener('resize', fitViewport);
            touch.removeEventListener('change', fitViewport);
        };
    }, []);

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
                    if (controlKey.current && (data.length === 1 || !data.startsWith('\x1b'))) {
                        updateControlKey(false);
                        data = controlInput(data);
                    }
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
        updateControlKey(false);
        setBellRinging(false);
        setDuckDbDownload('ready');
        setStatus({ phase: 'booting' });
        setGeneration(value => value + 1);
    }

    function updateControlKey(pressed: boolean) {
        controlKey.current = pressed;
        setControlPressed(pressed);
    }

    function sendTouchKey(data: string) {
        active.current?.terminal.input(data, true);
    }

    function sendArrow(code: typeof arrows[number]['code']) {
        const terminal = active.current?.terminal;
        if (!terminal) return;
        if (controlKey.current) {
            updateControlKey(false);
            terminal.input(`\x1b[1;5${code}`, true);
            return;
        }
        const prefix = terminal.modes.applicationCursorKeysMode ? '\x1bO' : '\x1b[';
        terminal.input(prefix + code, true);
    }

    const running = status.phase === 'running';
    let terminalStatus = '';
    if (status.phase === 'booting') terminalStatus = 'Starting Linux…';
    if (running) terminalStatus = downloadMessages[duckDbDownload] || (bellRinging ? 'Terminal bell' : '');

    return (
        <section ref={area} className={styles.terminal} data-theme={preferences.theme}
            data-cursor={preferences.cursor} aria-label="Linux terminal">
            <div className={styles.controls}>
                <div className={styles.toolbar}>
                    {(running || status.phase === 'booting') && (
                        <button className={styles.showKeyboard} type="button" disabled={!running}
                            onClick={() => active.current?.terminal.focus()}>Open keyboard</button>
                    )}
                    <button type="button" onClick={event => {
                        event.currentTarget.focus({ preventScroll: true });
                        settings.current?.showModal();
                    }}>Terminal settings</button>
                </div>
                {(running || status.phase === 'booting') && (
                    <div className={styles.touchKeys} role="group" aria-label="Terminal keys"
                        onPointerDown={event => event.preventDefault()}>
                        <button type="button" disabled={!running} aria-label="Esc (Escape)"
                            onClick={() => sendTouchKey('\x1b')}>Esc</button>
                        <button type="button" disabled={!running} aria-label="Send Tab"
                            onClick={() => sendTouchKey('\t')}>Tab</button>
                        <button type="button" disabled={!running} aria-pressed={controlPressed} onClick={() => {
                            updateControlKey(!controlKey.current);
                            active.current?.terminal.focus();
                        }}>Ctrl</button>
                        {arrows.map(({ label, name, code }) => (
                            <button key={code} type="button" disabled={!running} aria-label={name}
                                onClick={() => sendArrow(code)}>{label}</button>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.viewport}>
                <div className={styles.surface} ref={surface} aria-busy={status.phase === 'booting'}
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
                <span className={styles.status} role="status" aria-atomic="true">{terminalStatus}</span>
            </div>
            <dialog className={styles.settings} ref={settings} aria-labelledby="terminal-settings-title">
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
