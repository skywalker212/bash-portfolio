import { useState, useEffect } from 'react';
import { MOTD, getLastLogin } from '@/config/terminalConfig';
import { CommandResult, CommandResultType } from '@/types';

export const useInitialRender = () => {
    const [initialRender, setInitialRender] = useState<CommandResult[]>([]);

    useEffect(() => {
        const lastLogin = getLastLogin();

        setInitialRender([
            { content: `Last login: ${lastLogin}`, type: CommandResultType.OUTPUT },
            { content: MOTD, type: CommandResultType.OUTPUT },
            { content: "Type 'help' for available commands.", type: CommandResultType.OUTPUT },
        ]);
    }, []);

    return initialRender;
};