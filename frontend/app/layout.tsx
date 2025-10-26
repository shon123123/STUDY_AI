import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Study AI - Your Learning Companion',
  description: 'AI-powered learning platform for students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}