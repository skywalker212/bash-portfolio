import { CommandResult, CommandResultType } from "@/types";

export const HOME_DIR = '/home/skywalker212';

export const MOTD = `
                     /\\_/\\
                    ( o.o )
                     > ^ <
     █████╗ ██╗  ██╗ █████╗ ███████╗██╗  ██╗         
    ██╔══██╗██║ ██╔╝██╔══██╗██╔════╝██║  ██║         
    ███████║█████╔╝ ███████║███████╗███████║         
    ██╔══██║██╔═██╗ ██╔══██║╚════██║██╔══██║         
    ██║  ██║██║  ██╗██║  ██║███████║██║  ██║         
    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝         
 ██████╗  █████╗      ██╗     ██╗ █████╗ ██████╗ 
██╔════╝ ██╔══██╗     ██║     ██║██╔══██╗██╔══██╗
██║  ███╗███████║     ██║     ██║███████║██████╔╝
██║   ██║██╔══██║██   ██║██   ██║██╔══██║██╔══██╗
╚██████╔╝██║  ██║╚█████╔╝╚█████╔╝██║  ██║██║  ██║
 ╚═════╝ ╚═╝  ╚═╝ ╚════╝  ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`;

// export const getLastLogin = (): string => {
//     const lastLogin = localStorage.getItem('lastLogin');
//     const currentLogin = new Date().toISOString();
//     localStorage.setItem('lastLogin', currentLogin);
//     return lastLogin || 'No previous login recorded';
// };

export const initialRender: CommandResult[] = [
    // { content: `Last login: ${getLastLogin()}`, type: CommandResultType.TEXT },
    { content: MOTD, type: CommandResultType.TEXT },
    { content: "Type 'help' for available commands.", type: CommandResultType.TEXT },
]

export const terminalTheme = {
    backgroundColor: 'var(--terminal-bg)',
    textColor: 'var(--terminal-text)',
    promptColor: 'var(--terminal-prompt)',
    errorColor: '#ff6b6b',
};

export const terminalConfig = {
    user: 'skywalker212',
    host: 'akash.is',
    initialDirectory: HOME_DIR,
};