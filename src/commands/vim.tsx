import { Command, CommandResultType } from '@/types';
import { Vim } from '@/components';

export const vimCommand: Command = {
    name: 'vim',
    description: 'Vim Editor',
    execute: () => {
        const fun = (...args: unknown[]) => {
            console.log(args);
        };

        return {
            content: (
                <Vim
                    worker="/static/vim-wasm/vim.js"
                    onVimExit={fun}
                    onFileExport={fun}
                    readClipboard={() => navigator.clipboard?.readText()}
                    onWriteClipboard={(text) => navigator.clipboard?.writeText(text)}
                    onError={fun}
                />
            ),
            type: CommandResultType.CUSTOM
        };
    }
};