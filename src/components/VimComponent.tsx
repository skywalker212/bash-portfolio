import { useVim } from "@/hooks";
import { VimProps } from "@/types";
import { useEffect, useState } from "react";

const INPUT_STYLE = {
    width: '1px',
    color: 'transparent',
    backgroundColor: 'transparent',
    padding: '0px',
    border: '0px',
    outline: 'none',
    position: 'relative',
    top: '0px',
    left: '0px',
} as const;

const VimComponent: React.FC<VimProps> = (props) => {
    const [canvasRef, inputRef, vim] = useVim(props);
    const [clipboardAPI, setClipboardAPI] = useState<Clipboard | null>(null);

    useEffect(() => {
        setClipboardAPI(navigator.clipboard);
    }, []);

    if (canvasRef === null || inputRef === null) {
        return null;
    }

    const {
        style,
        className,
        id,
        onVimExit,
        onVimInit,
        onFileExport,
        onWriteClipboard,
        onError,
        readClipboard,
    } = props;

    if (vim !== null) {
        vim.onVimExit = onVimExit;
        vim.onVimInit = onVimInit;
        vim.onFileExport = onFileExport;
        vim.onWriteClipboard = onWriteClipboard;
        vim.onError = onError;
        vim.readClipboard = readClipboard;
    }

    return (
        <>
            <canvas ref={canvasRef} style={style} className={className} id={id} />
            <input ref={inputRef} style={INPUT_STYLE} autoComplete="off" autoFocus />
        </>
    );
};

export default VimComponent;