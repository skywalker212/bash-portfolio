import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Terminal from '@/components/Terminal';
import type { GuestFiles } from '@/linux/session';

async function readGuestFiles(path: string): Promise<GuestFiles> {
  const entries = await readdir(path, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const file = join(path, entry.name);
    return [entry.name, entry.isDirectory() ? await readGuestFiles(file) : await readFile(file, 'utf8')] as const;
  }));
  return Object.fromEntries(files);
}

export default async function Home() {
  const files = await readGuestFiles(join(process.cwd(), 'data/linux'));

  return (
    <main className="min-h-screen bg-black">
      <Terminal files={files} motd={typeof files.motd === 'string' ? files.motd : ''} />
    </main>
  );
}
