import { readFile, writeFile } from 'node:fs/promises';

const packages = {
    '@xterm/xterm': ['LICENSE'],
    '@xterm/addon-fit': ['LICENSE'],
    '@xterm/addon-web-links': ['LICENSE'],
    next: ['license.md'],
    react: ['LICENSE'],
    'react-dom': ['LICENSE'],
    tailwindcss: ['LICENSE'],
    '@vercel/analytics': ['LICENSE'],
    '@vercel/speed-insights': ['LICENSE'],
};

async function readPackageNotices(name, files) {
    const manifest = new URL(import.meta.resolve(`${name}/package.json`));
    const { version } = JSON.parse(await readFile(manifest, 'utf8'));
    const notices = await Promise.all(files.map(async file => {
        const contents = await readFile(new URL(file, manifest), 'utf8');
        return `${file}\n\n${contents}`;
    }));
    return { version, text: [`${name} ${version}`, ...notices].join('\n\n') };
}

export async function writeThirdPartyNotices(output, duckdb) {
    const [unkernel, dependencies, catsay] = await Promise.all([
        readPackageNotices('unkernel', ['THIRD-PARTY.md', 'LICENSE', 'LICENSE-MIT']),
        Promise.all(Object.entries(packages).map(([name, files]) => readPackageNotices(name, files))),
        readFile(new URL('../data/linux/share/catsay-NOTICES', import.meta.url), 'utf8'),
    ]);
    const sections = [
        'Third-party credits and notices for akash.is',
        'Project credits: https://github.com/skywalker212/bash-portfolio#credits',
        `Source for the bundled Linux kernel and guest: https://github.com/pithings/unkernel/tree/v${unkernel.version}`,
        'The portfolio build adds its own files to the unkernel release initramfs.',
        unkernel.text,
        ...dependencies.map(notice => notice.text),
        catsay,
        duckdb,
    ];
    await writeFile(output, sections.join('\n\n') + '\n');
}
