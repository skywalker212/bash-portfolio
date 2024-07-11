module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'var(--terminal-bg)',
          text: 'var(--terminal-text)',
          prompt: 'var(--terminal-prompt)',
        },
      },
      fontFamily: {
        mono: ['Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [],
}