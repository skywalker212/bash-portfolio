import '@/styles/globals.css';
import { LayoutProps } from '@/types';
import { Viewport } from 'next';
import newrelic from 'newrelic';
import Script from 'next/script';

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

export default async function RootLayout({
  children,
}: LayoutProps) {
  // @ts-expect-error new relic type error
  if (newrelic.agent.collector.isConnected() === false) {
    await new Promise((resolve) => {
      // @ts-expect-error new relic type error
      newrelic.agent.on("connected", resolve)
    })
  }

  const browserTimingHeader = newrelic.getBrowserTimingHeader({
    hasToRemoveScriptWrapper: true,
    // @ts-expect-error new relic type error
    allowTransactionlessInjection: true,
  })
  return (
    <html lang="en">
      <Script
        id="nr-browser-agent"
        dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
      />
      <body>
        {children}
      </body>
    </html>
  )
}