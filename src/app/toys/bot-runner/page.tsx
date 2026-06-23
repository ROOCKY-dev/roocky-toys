'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Play, Square, Key, Code, AlertCircle, CheckCircle2 } from 'lucide-react';

const DEFAULT_CODE = `// client is already initialized and authenticated
client.on('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});
`;

export default function BotRunner() {
  const [token, setToken] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState<'stopped' | 'running'>('stopped');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const botId = 'my-custom-bot-1'; // Simplification for MVP

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/bot-runner', {
        method: 'POST',
        body: JSON.stringify({ action: 'status', id: botId })
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    if (!token) {
      setError('Bot token is required to start.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bot-runner', {
        method: 'POST',
        body: JSON.stringify({ action: 'start', id: botId, token, code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStatus('running');
    } catch (err: any) {
      setError(err.message || 'Failed to start bot');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot-runner', {
        method: 'POST',
        body: JSON.stringify({ action: 'stop', id: botId })
      });
      const data = await res.json();
      if (data.success) setStatus('stopped');
    } catch (err: any) {
      setError(err.message || 'Failed to stop bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 md:px-12 max-w-6xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col pb-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 font-mono text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Config */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="w-16 h-16 bg-[#5865F2]/10 text-[#5865F2] rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-[#5865F2]/30 mb-6">
              <Bot size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Bot Runner</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-6">Host and run your Discord.js scripts directly on the edge.</p>

            {status === 'running' ? (
              <div className="flex items-center gap-2 text-[var(--color-correct)] font-mono text-sm mb-8 bg-[var(--color-correct)]/10 px-4 py-2 rounded-lg border border-[var(--color-correct)]/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-[var(--color-correct)] animate-pulse" />
                Bot is Online
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[var(--text-secondary)] font-mono text-sm mb-8 bg-white/5 px-4 py-2 rounded-lg border border-[var(--border-subtle)] w-fit">
                <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]" />
                Bot is Offline
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                  <Key size={14} /> Bot Token
                </label>
                <input 
                  type="password" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your Discord Bot Token..."
                  className="w-full bg-black/40 border border-[var(--border-medium)] rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#5865F2] transition-colors"
                  disabled={status === 'running'}
                />
              </div>

              {error && (
                <div className="p-3 bg-[var(--color-wrong)]/10 border border-[var(--color-wrong)]/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[var(--color-wrong)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-wrong)]">{error}</p>
                </div>
              )}

              <div className="pt-4">
                {status === 'stopped' ? (
                  <button 
                    onClick={handleStart}
                    disabled={loading || !token}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Play size={18} fill="currentColor" /> Start Bot
                  </button>
                ) : (
                  <button 
                    onClick={handleStop}
                    disabled={loading}
                    className="w-full bg-[var(--color-wrong)] hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Square size={18} fill="currentColor" /> Stop Bot
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="lg:w-2/3 glass-card p-6 flex flex-col relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Code size={18} /> script.js</h3>
            <span className="text-xs font-mono text-[var(--text-secondary)] bg-white/5 px-2 py-1 rounded border border-[var(--border-subtle)]">Discord.js v14</span>
          </div>
          
          <div className="flex-1 relative rounded-xl overflow-hidden border border-[var(--border-medium)] focus-within:border-[#5865F2] transition-colors">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={status === 'running'}
              className="absolute inset-0 w-full h-full bg-black/60 text-[var(--text-primary)] font-mono p-4 text-sm focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
