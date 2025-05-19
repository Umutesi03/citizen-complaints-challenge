import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ICT chamber challenges',
  description: 'Created by Umutesi Kelia',
  generator: 'vs Code',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
