import type { Metadata } from 'next'
import { Montserrat, Raleway } from 'next/font/google'
import './globals.css'
import { RootLayoutClient } from './RootLayoutClient'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
})

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway'
})

export const metadata: Metadata = {
  title: 'StarTarot - O direcionamento que você precisa',
  description: 'Portal de consulta de tarot assistido por IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${raleway.variable}`}>
      <RootLayoutClient className={montserrat.className}>
        {children}
      </RootLayoutClient>
    </html>
  )
}
