import { useState, useEffect } from 'react';
import { MOTD, getLastLogin } from '@/config/terminalConfig';
import { CommandResult } from '@/types';

export const useInitialRender = () => {
    const [initialRender, setInitialRender] = useState<CommandResult[]>([]);

    useEffect(() => {
        const lastLogin = getLastLogin();

        setInitialRender([
            { content: `Last login: ${lastLogin}`, type: 'output' },
            { content: '', type: 'output' }, // Empty line for spacing
            { content: MOTD, type: 'output' },
            { content: '', type: 'output' }, // Empty line for spacing
            { content: "Type 'help' for available commands.", type: 'output' },
        ]);
    }, []);

    return initialRender;
};