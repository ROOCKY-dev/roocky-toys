'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOYS } from '@/lib/toys';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Toys' },
    { id: 'game', label: 'Games' },
    { id: 'tool', label: 'Tools' },
    { id: 'service', label: 'Services' },
    { id: 'experiment', label: 'Experiments' },
  ];

  const filteredToys = activeFilter === 'all' 
    ? TOYS 
    : TOYS.filter(toy => toy.category === activeFilter);

  return (
    <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="py-20 mb-12 relative">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] rounded-[3rem] opacity-30 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="badge mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Platform Beta</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
            ROOCKY <span className="text-[var(--text-tertiary)]">/TOYS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-2xl">
            A scalable ecosystem for mini games, full-stack tools, and autonomous scripts. Built for performance.
          </p>
          
          <div className="flex flex-wrap gap-12 border-t border-[var(--border-subtle)] pt-8">
            <div>
              <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{TOYS.length}</div>
              <div className="label">Total Apps</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">{filters.length - 1}</div>
              <div className="label">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="mb-12 sticky top-24 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-md py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2.5 rounded-full font-mono text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] font-bold'
                  : 'bg-white/5 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredToys.map((toy, index) => {
          const isComingSoon = toy.status === 'coming-soon';
          
          const CardContent = (
            <div className={`glass-card h-full p-8 transition-all duration-500 flex flex-col relative overflow-hidden ${isComingSoon ? 'opacity-60 border-dashed hover:opacity-100' : 'hover:-translate-y-2 hover:border-[var(--accent-primary)]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'}`}>
              
              {!isComingSoon && (
                <div 
                  className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(800px circle at 50% 100%, ${toy.color}15, transparent 40%)` }}
                />
              )}

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10 transition-transform duration-500 ${!isComingSoon ? 'group-hover:scale-110' : ''}`}
                    style={{ backgroundColor: `${toy.color}20`, color: toy.color }}
                  >
                    {toy.emoji}
                  </div>
                  <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/10 text-[var(--text-secondary)]">
                    {toy.category}
                  </span>
                </div>

                <h3 className={`text-2xl font-bold mb-3 transition-colors ${!isComingSoon ? 'text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {toy.name}
                </h3>
                
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8 flex-grow">
                  {toy.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-wrap gap-2">
                    {toy.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">#{tag}</span>
                    ))}
                  </div>
                  
                  {isComingSoon ? (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" /> Coming Soon
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-[var(--border-medium)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:border-[var(--accent-primary)] group-hover:text-[var(--bg-primary)] transition-all duration-300">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <motion.div 
              key={toy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {isComingSoon ? (
                <div className="block h-full cursor-not-allowed">
                  {CardContent}
                </div>
              ) : (
                <Link href={toy.path} className="group block h-full">
                  {CardContent}
                </Link>
              )}
            </motion.div>
          );
        })}
      </section>

      {filteredToys.length === 0 && (
        <div className="text-center py-20 text-[var(--text-secondary)] font-mono">
          No apps found in this category.
        </div>
      )}
    </div>
  );
}
