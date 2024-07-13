import { VimProps } from "@/types";
import { useEffect, useRef, useState } from "react";
import { VimWasm } from "vim-wasm";

export function useVim({
    worker,
    drawer,
    debug,
    perf,
    clipboard,
    onVimExit,
    onVimInit,
    onFileExport,
    readClipboard,
    onWriteClipboard,
    onError,
    onTitleUpdate,
    files,
    fetchFiles,
    dirs,
    persistentDirs,
    cmdArgs,
    onVimCreated,
}: VimProps): [
        React.MutableRefObject<HTMLCanvasElement | null> | null,
        React.MutableRefObject<HTMLInputElement | null> | null,
        VimWasm | null,
    ] {
    const canvas = useRef<HTMLCanvasElement | null>(null);
    const input = useRef<HTMLInputElement | null>(null);
    const [vim, setVim] = useState(null as null | VimWasm);

    useEffect(() => {

        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const opts =
            drawer !== undefined
                ? {
                    workerScriptPath: worker,
                    screen: drawer,
                }
                : {
                    workerScriptPath: worker,
                    canvas: canvas.current!,
                    input: input.current!,
                };
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
        const v = new VimWasm(opts);

        v.onVimInit = onVimInit;
        v.onVimExit = onVimExit;
        v.onFileExport = onFileExport;
        v.readClipboard = readClipboard;
        v.onWriteClipboard = onWriteClipboard;
        v.onTitleUpdate = onTitleUpdate;
        v.onError = onError;

        if (canvas.current !== null) {
            canvas.current.addEventListener(
                'dragover',
                (e: DragEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                },
                false,
            );
            canvas.current.addEventListener(
                'drop',
                (e: DragEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (e.dataTransfer) {
                        v.dropFiles(e.dataTransfer.files).catch(onError);
                    }
                },
                false,
            );
        }

        if (onVimCreated !== undefined) {
            onVimCreated(v);
        }

        v.start({ debug, perf, clipboard, files, fetchFiles, dirs, persistentDirs, cmdArgs });
        setVim(v);

        return () => {
            if (v.isRunning()) {
                v.cmdline('qall!');
            }
        };
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [worker, debug, perf, clipboard, files, dirs, persistentDirs, cmdArgs]);
    /* eslint-enable react-hooks/exhaustive-deps */

    if (drawer !== undefined) {
        return [null, null, vim];
    }

    return [canvas, input, vim];
}