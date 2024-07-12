export const MOTD = `Welcome to akash.is!`;

export const getLastLogin = (): string => {
    const lastLogin = localStorage.getItem('lastLogin');
    const currentLogin = new Date().toISOString();
    localStorage.setItem('lastLogin', currentLogin);
    return lastLogin || 'No previous login recorded';
};

export const getPrompt = (currentDirectory: string) : string => (`${terminalConfig.user}@${terminalConfig.host}:${currentDirectory}$ `)

export const terminalTheme = {
    backgroundColor: 'var(--terminal-bg)',
    textColor: 'var(--terminal-text)',
    promptColor: 'var(--terminal-prompt)',
    errorColor: '#ff6b6b',
};

export const terminalConfig = {
    user: 'skywalker212',
    host: 'akash.is',
    initialDirectory: '~',
};