'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, UserCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center px-6 md:px-12 backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        <Link href="/" className="flex flex-col gap-1 group">
          <div className="flex items-center gap-2 text-xl font-bold tracking-widest text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
            <Gamepad2 className="w-6 h-6 text-[var(--accent-primary)]" />
            <span>ROOCKY<span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]">/TOYS</span></span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase">Platform Beta</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="https://roocky.dev" target="_blank" className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Main Site
          </Link>
          
          {/* Profile Auth Button - Will later be updated to actual auth state */}
          <Link href="/profile" className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--border-subtle)] bg-white/5 hover:bg-white/10 hover:border-[var(--border-medium)] transition-all font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-white">
            <UserCircle2 className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
