import { Command } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "clear";
const description = "Clear the terminal screen";

type ClearCommand = Omit<Command, 'execute'>;

const clearArgs = new ArgumentParser(name, description);

export const clearCommand: ClearCommand = {
    name,
    description,
    args: clearArgs
};