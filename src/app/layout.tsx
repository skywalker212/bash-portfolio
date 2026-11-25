import '@xterm/xterm/css/xterm.css';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { ReactNode } from 'react';
import { Viewport } from 'next';

export const metadata = {
  title: 'Akash Gajjar Portfolio',
  description: 'A bash-style portfolio'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content'
}

export default function RootLayout({
  children,
}: { children: ReactNode }) {
  const onVercel = process.env.VERCEL === '1';
  return (
    <html lang="en">
      <body>
        {children}
        {onVercel && <Analytics />}
        {onVercel && <SpeedInsights />}
      </body>
    </html>
  )
}
