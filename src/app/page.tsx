import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Terminal from '@/components/Terminal';
import styles from '@/styles/Terminal.module.css';

export default async function Home() {
  const guest = join(process.cwd(), 'data/linux');
  const [motd, contacts, experience, internships] = await Promise.all(
    ['motd', 'share/contacts.tsv', 'share/experience.tsv', 'share/internships.tsv']
      .map(file => readFile(join(guest, file), 'utf8')),
  );
  const rows = (text: string) => text.trim().split('\n').map(line => line.split('\t'));
  const fallback = (
    <article>
      <h1>Akash Gajjar</h1>
      <h2>Links</h2>
      <ul>
        {rows(contacts).map(([label, , href]) => <li key={href}><a href={href}>{label}</a></li>)}
      </ul>
      <h2>Experience</h2>
      <ul>
        {[...rows(experience).slice(1), ...rows(internships).slice(1)].map(([company, period, title]) => (
          <li key={period}>{title} at {company}<br />{period}</li>
        ))}
      </ul>
    </article>
  );

  return (
    <main className="min-h-screen bg-black">
      <noscript>
        <style>{`.${styles.terminal} { display: none; }`}</style>
        <div className={`${styles.fallback} ${styles.staticFallback}`}>
          <p>The Linux terminal needs JavaScript.</p>
          {fallback}
        </div>
      </noscript>
      <Terminal motd={motd} fallback={fallback} />
    </main>
  );
}
