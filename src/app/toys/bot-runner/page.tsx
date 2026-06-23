'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Square, Save, Activity, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Bot = {
  id: string;
  name: string;
  token: string;
  script: string;
  status: 'offline' | 'online' | 'starting';
};

const DEFAULT_SCRIPT = `import discord
import os

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    if message.content.startswith('!ping'):
        await message.channel.send('Pong!')

# Token is automatically injected by the runner
client.run(os.environ['DISCORD_TOKEN'])
`;

export default function BotRunner() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [activeBotId, setActiveBotId] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('discord_bots');
    if (saved) {
      setBots(JSON.parse(saved).map((b: any) => ({ ...b, status: 'offline' })));
    } else {
      const initial: Bot = { id: Date.now().toString(), name: 'My First Bot', token: '', script: DEFAULT_SCRIPT, status: 'offline' };
      setBots([initial]);
      setActiveBotId(initial.id);
    }
  }, []);

  useEffect(() => {
    if (bots.length > 0) {
      localStorage.setItem('discord_bots', JSON.stringify(bots.map(b => ({ ...b, status: 'offline' }))));
    }
    if (!activeBotId && bots.length > 0) {
      setActiveBotId(bots[0].id);
    }
  }, [bots]);

  const activeBot = bots.find(b => b.id === activeBotId) || bots[0];

  const updateBot = (id: string, updates: Partial<Bot>) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addBot = () => {
    const newBot: Bot = { id: Date.now().toString(), name: 'New Bot', token: '', script: DEFAULT_SCRIPT, status: 'offline' };
    setBots(prev => [...prev, newBot]);
    setActiveBotId(newBot.id);
  };

  const deleteBot = (id: string) => {
    setBots(prev => prev.filter(b => b.id !== id));
  };

  const toggleBot = async (bot: Bot) => {
    if (bot.status === 'offline') {
      if (!bot.token) return alert('Please enter a bot token');
      updateBot(bot.id, { status: 'starting' });
      try {
        const res = await fetch('/api/bot-runner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start', id: bot.id, token: bot.token, script: bot.script })
        });
        if (!res.ok) throw new Error(await res.text());
        updateBot(bot.id, { status: 'online' });
      } catch (err) {
        alert('Failed to start: ' + err);
        updateBot(bot.id, { status: 'offline' });
      }
    } else {
      try {
        await fetch('/api/bot-runner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop', id: bot.id })
        });
      } finally {
        updateBot(bot.id, { status: 'offline' });
      }
    }
  };

  if (!bots.length) return null;

  return (
    <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col pb-12">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar */}
        <div className="lg:w-1/4 glass-card p-6 flex flex-col h-[70vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-[var(--accent-primary)]"/> Your Bots</h2>
            <button onClick={addBot} className="text-[var(--text-secondary)] hover:text-white bg-white/5 p-2 rounded-lg border border-[var(--border-subtle)]">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {bots.map(b => (
              <div 
                key={b.id} 
                onClick={() => setActiveBotId(b.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group ${activeBotId === b.id ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' : 'bg-black/40 border-[var(--border-medium)] hover:border-[var(--border-subtle)]'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold truncate">{b.name}</span>
                  {activeBotId === b.id && bots.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteBot(b.id); }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <div className={`w-2 h-2 rounded-full ${b.status === 'online' ? 'bg-[var(--color-correct)] animate-pulse' : b.status === 'starting' ? 'bg-[var(--color-warning)] animate-pulse' : 'bg-red-500'}`} />
                  {b.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        {activeBot && (
          <div className="lg:w-3/4 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label block mb-2">Bot Name</label>
                  <input 
                    type="text" value={activeBot.name} 
                    onChange={e => updateBot(activeBot.id, { name: e.target.value })}
                    className="w-full bg-black/40 border border-[var(--border-medium)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="label block mb-2">Discord Token</label>
                  <input 
                    type="password" value={activeBot.token} 
                    onChange={e => updateBot(activeBot.id, { token: e.target.value })}
                    placeholder="Enter your Discord Bot Token..."
                    className="w-full bg-black/40 border border-[var(--border-medium)] rounded-xl px-4 py-3 focus:border-[var(--accent-primary)] outline-none font-mono text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => toggleBot(activeBot)} 
                    disabled={activeBot.status === 'starting'}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeBot.status === 'online' ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : 'btn-primary'}`}
                  >
                    {activeBot.status === 'online' ? <Square className="w-5 h-5 fill-current" /> : activeBot.status === 'starting' ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    {activeBot.status === 'online' ? 'Stop Bot' : activeBot.status === 'starting' ? 'Starting...' : 'Start Bot'}
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card flex-1 p-6 flex flex-col min-h-[50vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  {'</>'} script.py
                </h3>
                <span className="badge">discord.py</span>
              </div>
              <textarea
                value={activeBot.script}
                onChange={e => updateBot(activeBot.id, { script: e.target.value })}
                className="w-full flex-1 bg-black/40 border border-[var(--border-medium)] rounded-xl p-6 font-mono text-sm text-[var(--accent-primary)] focus:outline-none focus:border-[var(--border-subtle)] resize-none custom-scrollbar"
                spellCheck="false"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
