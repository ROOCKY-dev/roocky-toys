'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, ID, APPWRITE_CONFIG } from '@/lib/appwrite';
import { LogIn, UserPlus, LogOut, Loader2, UserCircle2, Trophy, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);
  
  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentSession = await account.get();
      setUser(currentSession);
      fetchScores(currentSession.$id);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async (userId: string) => {
    try {
      // Import Query locally here to keep it clean
      const { Query } = await import('appwrite');
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.dbId,
        APPWRITE_CONFIG.scoresCollId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('score'),
          Query.limit(10)
        ]
      );
      setScores(response.documents);
    } catch (error) {
      console.warn("Could not fetch scores. Check your Database settings.", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      }
      await checkUser();
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setScores([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="pt-32 px-6 md:px-12 max-w-4xl mx-auto min-h-[calc(100vh-6rem)]">
      
      {!user ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-glow)] rounded-full blur-[60px]" />
            
            <div className="relative z-10 text-center mb-8">
              <div className="w-16 h-16 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-subtle)]">
                {isLogin ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Platform'}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {isLogin 
                  ? 'Log in to sync your tools, games, and high scores.' 
                  : 'Create an account to track your progress across all toys.'}
              </p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-[var(--color-wrong)]/10 border border-[var(--color-wrong)]/30 rounded-lg flex items-center gap-3 text-[var(--color-wrong)] text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              {!isLogin && (
                <div>
                  <label className="label block mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    placeholder="E.g. Roocky"
                  />
                </div>
              )}
              <div>
                <label className="label block mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  placeholder="you@domain.com"
                />
              </div>
              <div>
                <label className="label block mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn-primary w-full mt-6"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center relative z-10">
              <p className="text-sm text-[var(--text-secondary)]">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-[var(--accent-primary)] font-medium hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          
          {/* Profile Header */}
          <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full flex items-center justify-center border border-[var(--accent-primary)]/40 shadow-[0_0_40px_rgba(167,139,250,0.2)]">
              <UserCircle2 className="w-12 h-12" />
            </div>
            
            <div className="flex-1">
              <div className="badge mb-3">Verified Player</div>
              <h1 className="text-3xl font-bold mb-1 text-[var(--text-primary)]">{user.name || 'Anonymous User'}</h1>
              <p className="font-mono text-sm text-[var(--text-secondary)]">{user.email}</p>
            </div>
            
            <button onClick={handleLogout} className="btn-ghost !px-6 !py-2.5">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Activity / Dashboard */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[var(--color-warning)]" />
              High Scores & Activity
            </h2>

            {scores.length === 0 ? (
              <div className="glass-card-elevated p-12 text-center border-dashed border-[var(--border-medium)]">
                <p className="text-[var(--text-secondary)] font-mono mb-4">No activity found yet.</p>
                <button onClick={() => router.push('/')} className="btn-ghost border border-[var(--border-medium)]">
                  Go Play Games
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {scores.map((score, index) => (
                  <div key={score.$id} className="glass-card-elevated p-6 flex items-center justify-between transition-all hover:bg-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl font-bold text-[var(--text-secondary)]">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)] capitalize">{score.toyId?.replace('-', ' ')}</h3>
                        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-1 font-mono">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(score.date).toLocaleDateString()}</span>
                          <span className="uppercase text-[10px] tracking-widest border border-white/10 px-2 py-0.5 rounded-full">{score.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono">{score.score.toLocaleString()}</div>
                      <div className="label">Points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </motion.div>
      )}
    </div>
  );
}
