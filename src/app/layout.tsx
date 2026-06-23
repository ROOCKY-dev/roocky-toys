import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import MouseGlow from '@/components/layout/MouseGlow';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'ROOCKY TOYS | Platform',
  description: 'A platform for mini games, tools, and creative experiments by ROOCKY.DEV.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans`}>
        <div className="grain-overlay" />
        <MouseGlow />
        
        <Navbar />
        
        <main className="relative z-10 w-full mx-auto pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
