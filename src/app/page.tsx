import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Terminal from '@/components/Terminal';

async function readFiles(directory: string) {
  const path = join(process.cwd(), 'data', directory);
  const files = await Promise.all((await readdir(path)).map(async name =>
    [name, await readFile(join(path, name), 'utf8')] as const
  ));
  return Object.fromEntries(files);
}

export default async function Home() {
  const [bin, commands, runtime] = await Promise.all([readFiles('bin'), readFiles('commands'), readFiles('runtime')]);

  return (
    <main className="min-h-screen bg-black">
      <Terminal files={{ bin, commands, runtime }} />
    </main>
  );
}
