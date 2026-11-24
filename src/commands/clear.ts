import { ArgumentParser } from 'js-argparse';
import { defineCommand } from './command';

const name = 'clear';
const description = 'Clear the terminal screen';

export const clearCommand = defineCommand({
    name,
    description,
    args: new ArgumentParser(name, description),
    execute() {
        // The terminal handles bare clear. Keep the established error for redirected clear.
        throw new Error('command.execute is not a function');
    },
});
