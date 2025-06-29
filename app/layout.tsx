import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AST Logic Flow',
  description: 'A visual programming environment for building logic flows',
  generator: 'Created by Afterschool Tech',
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
