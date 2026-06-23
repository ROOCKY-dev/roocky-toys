import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        style={{ background: '#050508', color: '#f0f0f5' }}
        suppressHydrationWarning
      >
        {/* Film Grain Overlay */}
        <div className="grain-overlay" aria-hidden="true" />

        {/* Mouse-following Glow */}
        <div id="mouse-glow" className="mouse-glow" aria-hidden="true" suppressHydrationWarning />

        <Navbar />
        
        {/* Main layout container ensuring content is below navbar */}
        <div className="relative z-10 w-full pt-20">
          {children}
        </div>

        {/* Mouse Glow Tracker Script from roocky.dev */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const glow = document.getElementById('mouse-glow');
                if (!glow) return;
                let rAF;
                window.addEventListener('mousemove', (e) => {
                  if (rAF) return;
                  rAF = requestAnimationFrame(() => {
                    glow.style.left = e.clientX + 'px';
                    glow.style.top = e.clientY + 'px';
                    rAF = null;
                  });
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
