import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LayoutProps } from '@/types';
import { Viewport } from 'next';

export const metadata = {
  title: 'Akash Gajjar Portfolio',
  description: 'A bash-style portfolio'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: false
}

export default function RootLayout({
  children,
}: LayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}