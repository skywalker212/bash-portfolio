import { CommandResultType, type CommandResult } from "@/types/terminal";

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

export const initialRender: CommandResult[] = [
    { content: MOTD, type: CommandResultType.TEXT },
    { content: "Type 'help' for available commands.", type: CommandResultType.TEXT },
]

export const terminalConfig = {
    user: 'skywalker212',
    host: 'akash.is',
};
