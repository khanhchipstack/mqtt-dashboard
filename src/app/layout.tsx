import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FreeMQTT by Chipstack",
  description: "FreeMQTT by Chipstack",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
    <head>
      <link rel="icon" type="image/png" href="/images/logo.png" />
    </head>
    <body className={inter.className}>{children}</body>
  </html>
  )
}
