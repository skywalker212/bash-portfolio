import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Terminal from '@/components/Terminal';

export default async function Home() {
  const bin = join(process.cwd(), 'data/bin');
  const files = await Promise.all((await readdir(bin)).map(async name =>
    [name, await readFile(join(bin, name), 'utf8')] as const
  ));

  return (
    <main className="min-h-screen bg-black">
      <Terminal files={Object.fromEntries(files)} />
    </main>
  );
}
