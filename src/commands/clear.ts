import { Command } from '@/types';
import { ArgumentParser } from 'js-argparse';

const name = "clear";

type ClearCommand = Omit<Command, 'execute'>;

const clearArgs = new ArgumentParser(name, "Clear the terminal screen");

export const clearCommand: ClearCommand = {
    name,
    args: clearArgs
};