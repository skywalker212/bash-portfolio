import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Terminal from '@/components/Terminal';

export default async function Home() {
  const motd = await readFile(join(process.cwd(), 'data/linux/motd'), 'utf8');

  return (
    <main className="min-h-screen bg-black">
      <Terminal motd={motd} />
    </main>
  );
}
