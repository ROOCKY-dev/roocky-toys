"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Gallery", href: "/" },
    { label: "Profile", href: "/profile" },
  ];

  // Using the green status dot equivalent from the original code
  const statusColor = "bg-emerald-400";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled
            ? "bg-[#050508]/80 backdrop-blur-2xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-[#050508] font-mono text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rounded-xl group-hover:scale-105">
              R
            </div>
            <span className="font-mono text-sm font-medium tracking-tight text-[var(--text-primary)]">
              toys<span className="text-[var(--text-tertiary)]">.roocky.dev</span>
            </span>
          </Link>

          {/* Center Nav - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-1.5 py-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-1.5 font-mono text-[11px] tracking-wide uppercase transition-colors duration-300 rounded-full ${
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 badge">
              <div className={`status-dot ${statusColor}`} />
              <span>PLATFORM</span>
            </div>

            {/* Main Site Link */}
            <Link
              href="https://roocky.dev"
              className="hidden md:flex btn-primary !py-2 !px-5 !text-[10px]"
            >
              Main Site
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="block w-4 h-[1.5px] bg-[var(--text-primary)] origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="block w-4 h-[1.5px] bg-[var(--text-primary)]"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="block w-4 h-[1.5px] bg-[var(--text-primary)] origin-center"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-[#050508]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
            onClick={() => setMenuOpen(false)}
          >
            {navItems.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <Link
                  href={item.href}
                  className="font-display text-4xl uppercase tracking-tight text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors duration-300"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.24, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <Link href="https://roocky.dev" className="btn-primary mt-4">
                Main Site
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
