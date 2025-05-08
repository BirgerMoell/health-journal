import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import ClientNavigationGuard from '@/components/ClientNavigationGuard'
import SessionStatusBar from '@/components/SessionStatusBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Personal Health Record AI',
  description: 'A secure personal health record system with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientNavigationGuard>
            <SessionStatusBar />
            {children}
          </ClientNavigationGuard>
        </AuthProvider>
      </body>
    </html>
  )
}