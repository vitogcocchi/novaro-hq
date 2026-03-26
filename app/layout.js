import './globals.css'

export const metadata = {
  title: 'Novaro HQ | Command Center',
  description: 'Real-time dashboard for Novaro AI operations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}