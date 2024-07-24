import '@/styles/globals.css';
import { LayoutProps } from '@/types';
import { Viewport } from 'next';

export const metadata = {
  title: 'Akash Gajjar Portfolio',
  description: 'A bash-style portfolio'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: LayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}