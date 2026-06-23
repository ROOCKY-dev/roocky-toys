'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Share2, AlertCircle, Globe, Users, Copy, Loader2, LogOut } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizCategory, Question, Language } from '@/lib/quiz-data';
import { account, databases, client, ID, APPWRITE_CONFIG } from '@/lib/appwrite';
import { Query } from 'appwrite';

type Difficulty = 'easy' | 'medium' | 'hard';
type Screen = 'start' | 'playing' | 'results' | 'multiplayer-setup' | 'multiplayer-lobby' | 'multiplayer-playing' | 'multiplayer-results';

const DIFFICULTIES = {
  easy: { time: 10, multi: 1 },
  medium: { time: 7, multi: 1.5 },
  hard: { time: 5, multi: 2 }
};

type Player = { id: string; name: string; score: number; finished: boolean };
type Lobby = {
  $id: string;
  roomCode: string;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: string; // JSON string of Player[]
  questions: string; // JSON string of indices
};

export default function QuizMaster() {
  const [screen, setScreen] = useState<Screen>('start');
  const [category, setCategory] = useState<QuizCategory>('All');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [lang, setLang] = useState<Language>('en');
  
  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  
  // Audio Context (created on first interaction)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  
  // Multiplayer State
  const [roomCode, setRoomCode] = useState('');
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [parsedPlayers, setParsedPlayers] = useState<Player[]>([]);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState('');

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await account.get();
        setUser(u);
        setPlayerName(u.name);
        setPlayerId(u.$id);
      } catch (e) {
        let savedId = localStorage.getItem('guestId');
        if (!savedId) {
          savedId = 'guest-' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('guestId', savedId);
        }
        setPlayerId(savedId);
        setPlayerName('Guest ' + savedId.substr(6, 4).toUpperCase());
      }
    };
    initAuth();
  }, []);

  const playSound = useCallback((type: 'tick' | 'correct' | 'wrong' | 'streak' | 'finish') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === 'tick') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'correct') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(600, now + 0.1); osc.frequency.setValueAtTime(1000, now + 0.2);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 0.4); osc.start(now); osc.stop(now + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      }
    } catch (e) {}
  }, []);

  // Timer Effect
  useEffect(() => {
    if ((screen !== 'playing' && screen !== 'multiplayer-playing') || timeLeft <= 0 || feedback !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAnswer(-1); return 0; }
        if (prev <= 4) playSound('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, timeLeft, feedback, playSound]);

  // Real-time Lobby Subscription
  useEffect(() => {
    if (!lobby || !APPWRITE_CONFIG.dbId || !APPWRITE_CONFIG.lobbiesCollId) return;
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.dbId}.collections.${APPWRITE_CONFIG.lobbiesCollId}.documents.${lobby.$id}`,
      (response: any) => {
        const updated = response.payload as Lobby;
        setLobby(updated);
        try {
          const pl = JSON.parse(updated.players);
          setParsedPlayers(pl.sort((a:any, b:any) => b.score - a.score));
          
          if (screen === 'multiplayer-lobby' && updated.status === 'playing') {
            const qIds = JSON.parse(updated.questions);
            setQuestions(qIds.map((idx: number) => QUIZ_QUESTIONS[idx]));
            resetGameState();
            setScreen('multiplayer-playing');
          }
          if (screen === 'multiplayer-playing' && updated.status === 'finished') {
            setScreen('multiplayer-results');
          }
        } catch (e) {}
      }
    );
    return () => unsubscribe();
  }, [lobby?.$id, screen]);

  const resetGameState = () => {
    setQIndex(0); setScore(0); setStreak(0); setBestStreak(0); setCorrectCount(0); setFeedback(null);
    setTimeLeft(DIFFICULTIES[difficulty].time);
  };

  const startGame = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    let pool = category === 'All' ? [...QUIZ_QUESTIONS] : QUIZ_QUESTIONS.filter(q => q.category === category);
    pool.sort(() => Math.random() - 0.5);
    setQuestions(pool.slice(0, 10));
    resetGameState();
    setScreen('playing');
  };

  const updateMultiplayerScore = async (newScore: number, finished: boolean) => {
    if (!lobby) return;
    try {
      const pl = JSON.parse(lobby.players) as Player[];
      const meIdx = pl.findIndex(p => p.id === playerId);
      if (meIdx > -1) {
        pl[meIdx].score = newScore;
        pl[meIdx].finished = finished;
        
        const allFinished = pl.every(p => p.finished);
        
        await databases.updateDocument(
          APPWRITE_CONFIG.dbId,
          APPWRITE_CONFIG.lobbiesCollId,
          lobby.$id,
          {
            players: JSON.stringify(pl),
            status: allFinished ? 'finished' : lobby.status
          }
        );
      }
    } catch (e) {
      console.error('Failed to sync score', e);
    }
  };

  const handleAnswer = (index: number) => {
    if (feedback !== null) return;
    const q = questions[qIndex];
    const isCorrect = index === q.correct;
    
    let earned = 0;
    if (isCorrect) {
      playSound('correct'); setFeedback('correct');
      const timeBonus = timeLeft * 10;
      const streakBonus = streak >= 3 ? 50 : 0;
      earned = Math.round((100 + timeBonus + streakBonus) * DIFFICULTIES[difficulty].multi);
      setScore(s => s + earned); setCorrectCount(c => c + 1);
      setStreak(s => { const ns = s + 1; if (ns > bestStreak) setBestStreak(ns); return ns; });
    } else {
      playSound('wrong'); setFeedback('wrong'); setStreak(0);
    }

    setTimeout(() => {
      const isMulti = screen === 'multiplayer-playing';
      if (qIndex < questions.length - 1) {
        setQIndex(q => q + 1); setFeedback(null); setTimeLeft(DIFFICULTIES[difficulty].time);
        if (isMulti) updateMultiplayerScore(score + earned, false);
      } else {
        if (isMulti) {
          updateMultiplayerScore(score + earned, true);
          setScreen('multiplayer-results');
        } else {
          setScreen('results');
        }
        playSound('correct');
      }
    }, 1500);
  };

  // MULTIPLAYER ACTIONS
  const createLobby = async () => {
    if (!playerName.trim()) return setMpError('Name required');
    setMpLoading(true); setMpError('');
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      let poolIndices = Array.from(QUIZ_QUESTIONS.keys());
      poolIndices.sort(() => Math.random() - 0.5);
      const selected = poolIndices.slice(0, 10);

      const pl: Player[] = [{ id: playerId, name: playerName, score: 0, finished: false }];

      const doc = await databases.createDocument(
        APPWRITE_CONFIG.dbId, APPWRITE_CONFIG.lobbiesCollId, ID.unique(),
        {
          roomCode: code,
          hostId: playerId,
          status: 'waiting',
          players: JSON.stringify(pl),
          questions: JSON.stringify(selected)
        }
      );
      setLobby(doc as any);
      setParsedPlayers(pl);
      setRoomCode(code);
      setScreen('multiplayer-lobby');
    } catch (e:any) {
      setMpError(e.message || 'Failed to create lobby');
    }
    setMpLoading(false);
  };

  const joinLobby = async () => {
    if (!playerName.trim() || !roomCode.trim()) return setMpError('Name and Code required');
    setMpLoading(true); setMpError('');
    try {
      const search = await databases.listDocuments(APPWRITE_CONFIG.dbId, APPWRITE_CONFIG.lobbiesCollId, [
        Query.equal('roomCode', roomCode.toUpperCase())
      ]);
      if (search.documents.length === 0) throw new Error('Room not found');
      
      const doc = search.documents[0];
      if (doc.status !== 'waiting') throw new Error('Game already started');

      const pl: Player[] = JSON.parse(doc.players);
      if (!pl.find(p => p.id === playerId)) {
        pl.push({ id: playerId, name: playerName, score: 0, finished: false });
        await databases.updateDocument(APPWRITE_CONFIG.dbId, APPWRITE_CONFIG.lobbiesCollId, doc.$id, {
          players: JSON.stringify(pl)
        });
      }

      setLobby(doc as any);
      setParsedPlayers(pl.sort((a,b)=>b.score-a.score));
      setScreen('multiplayer-lobby');
    } catch (e:any) {
      setMpError(e.message || 'Failed to join lobby');
    }
    setMpLoading(false);
  };

  const startMultiplayerGame = async () => {
    if (!lobby || lobby.hostId !== playerId) return;
    setMpLoading(true);
    try {
      await databases.updateDocument(APPWRITE_CONFIG.dbId, APPWRITE_CONFIG.lobbiesCollId, lobby.$id, { status: 'playing' });
      // The listener will transition everyone
    } catch (e) {
      console.error('Failed to start', e);
    }
    setMpLoading(false);
  };

  const leaveLobby = () => {
    setLobby(null);
    setScreen('start');
  };

  const currentQ = questions[qIndex];
  const isRTL = lang === 'ar';
  
  const translations = {
    en: {
      title: 'Quiz Master', subtitle: 'Test your knowledge across deep topics.', category: 'Category', difficulty: 'Difficulty',
      start: 'Solo Quiz', multiplayer: 'Multiplayer', question: 'Question', pts: 'pts', streak: 'Streak x',
      complete: 'Quiz Complete!', scored: 'You scored', correct: 'Correct', accuracy: 'Accuracy', bestStreak: 'Best Streak',
      playAgain: 'Play Again', share: 'Share Score', loginRequired: 'Log in to save score.', back: 'Back',
      multiplayerSetup: 'Multiplayer Room', createRoom: 'Create Room', joinRoom: 'Join Room', namePlaceholder: 'Enter your nickname',
      roomCodePlaceholder: 'Enter 6-digit Code', waiting: 'Waiting for Host...', startMp: 'Start Game', players: 'Players',
      leave: 'Leave Room', finishWaiting: 'Waiting for others to finish...', leaderboard: 'Final Leaderboard'
    },
    ar: {
      title: 'سيد المسابقات', subtitle: 'اختبر معلوماتك في مواضيع عميقة.', category: 'التصنيف', difficulty: 'الصعوبة',
      start: 'لعب فردي', multiplayer: 'لعب جماعي', question: 'سؤال', pts: 'نقطة', streak: 'متتالية x',
      complete: 'انتهى الاختبار!', scored: 'لقد سجلت', correct: 'إجابة صحيحة', accuracy: 'الدقة', bestStreak: 'أفضل متتالية',
      playAgain: 'العب مرة أخرى', share: 'شارك النتيجة', loginRequired: 'سجل دخول لحفظ النتيجة.', back: 'رجوع',
      multiplayerSetup: 'غرفة اللعب الجماعي', createRoom: 'إنشاء غرفة', joinRoom: 'الانضمام لغرفة', namePlaceholder: 'أدخل اسمك',
      roomCodePlaceholder: 'رمز الغرفة (6 أحرف)', waiting: 'في انتظار المضيف...', startMp: 'ابدأ اللعبة', players: 'اللاعبين',
      leave: 'مغادرة الغرفة', finishWaiting: 'في انتظار إنهاء الآخرين...', leaderboard: 'لوحة الصدارة النهائية'
    }
  };
  const t = translations[lang];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="pt-24 px-6 md:px-12 max-w-5xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col pb-12">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-sm transition-colors w-fit">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} /> {t.back}
        </Link>
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="btn-ghost !px-4 !py-2 !text-[10px]">
          <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Main Area */}
        <div className={`glass-card p-8 md:p-12 relative overflow-hidden flex flex-col ${screen.includes('multiplayer-playing') ? 'lg:w-2/3' : 'w-full'}`}>
          {screen === 'start' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-[var(--accent-primary)]/30 mb-8 animate-pulse-glow">
                ☪️
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t.title}</h1>
              <p className="text-[var(--text-secondary)] mb-12 max-w-md mx-auto leading-relaxed">{t.subtitle}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mb-12 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div>
                  <label className="label block mb-3">{t.category}</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Tech', 'Science', 'Islamic History', 'Arab Culture', 'General', 'Gaming'].map(c => (
                      <button key={c} onClick={() => setCategory(c as QuizCategory)} className={`px-4 py-2 rounded-full text-xs font-mono border transition-all ${category === c ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--bg-primary)] font-bold' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/5'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label block mb-3">{t.difficulty}</label>
                  <div className="flex flex-wrap gap-2">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                      <button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2 rounded-full text-xs font-mono uppercase border transition-all ${difficulty === d ? 'bg-white text-black font-bold border-white' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/5'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button onClick={startGame} className="btn-primary flex-1 py-4 shadow-[0_0_40px_var(--accent-glow)]">
                  <Play className="w-5 h-5" fill="currentColor" /> {t.start}
                </button>
                <button onClick={() => setScreen('multiplayer-setup')} className="btn-ghost flex-1 py-4 border-[var(--border-medium)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]">
                  <Users className="w-5 h-5" /> {t.multiplayer}
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'multiplayer-setup' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[var(--text-tertiary)]/20 text-[var(--text-primary)] rounded-2xl flex items-center justify-center text-4xl mb-8 border border-[var(--border-medium)]">
                👥
              </div>
              <h2 className="text-3xl font-bold mb-8">{t.multiplayerSetup}</h2>

              <div className="w-full max-w-sm space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>Nickname</label>
                  <input 
                    type="text" 
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full bg-black/40 border border-[var(--border-medium)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                {mpError && <div className="text-red-400 text-sm">{mpError}</div>}

                <button onClick={createLobby} disabled={mpLoading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  {mpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />} {t.createRoom}
                </button>
                
                <div className="relative mt-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-subtle)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--bg-glass)] text-[var(--text-secondary)]">OR</span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <input 
                    type="text" 
                    placeholder={t.roomCodePlaceholder}
                    className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-4 text-center font-mono tracking-widest uppercase text-xl focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <button onClick={joinLobby} disabled={mpLoading || !roomCode} className="btn-ghost w-full py-4 border-[var(--border-medium)] flex items-center justify-center gap-2 text-white hover:bg-white/10">
                    {mpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null} {t.joinRoom}
                  </button>
                </div>
              </div>

              <button onClick={() => setScreen('start')} className="mt-12 text-sm font-mono text-[var(--text-secondary)] hover:text-white transition-colors">
                {t.back}
              </button>
            </motion.div>
          )}

          {screen === 'multiplayer-lobby' && lobby && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center">
              <div className="flex w-full justify-between items-start mb-12">
                <button onClick={leaveLobby} className="text-sm text-[var(--text-secondary)] hover:text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> {t.leave}
                </button>
                <div className="text-center">
                  <div className="label mb-2">Room Code</div>
                  <div className="bg-black/60 border border-[var(--border-medium)] rounded-xl px-6 py-3 font-mono text-4xl tracking-[0.2em] font-bold text-[var(--accent-primary)] flex items-center gap-4">
                    {lobby.roomCode}
                    <button onClick={() => navigator.clipboard.writeText(lobby.roomCode)} className="text-[var(--text-secondary)] hover:text-white">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="w-20"></div>
              </div>

              <div className="w-full max-w-md bg-white/5 border border-[var(--border-subtle)] rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                  {t.players} <span className="badge">{parsedPlayers.length}/10</span>
                </h3>
                <div className="space-y-3">
                  {parsedPlayers.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-black/40 px-4 py-3 rounded-xl border border-[var(--border-medium)]">
                      <span className="font-medium flex items-center gap-2">
                        {p.id === lobby.hostId && <Trophy className="w-4 h-4 text-[var(--color-warning)]" />}
                        {p.name} {p.id === playerId && <span className="text-xs text-[var(--text-secondary)]">(You)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {lobby.hostId === playerId ? (
                <button onClick={startMultiplayerGame} disabled={mpLoading} className="btn-primary py-4 px-12 shadow-[0_0_30px_var(--accent-glow)] flex items-center gap-2">
                  {mpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" fill="currentColor" />}
                  {t.startMp}
                </button>
              ) : (
                <div className="text-[var(--text-secondary)] animate-pulse flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> {t.waiting}
                </div>
              )}
            </motion.div>
          )}

          {(screen === 'playing' || screen === 'multiplayer-playing') && currentQ && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b border-[var(--border-subtle)] pb-6">
                <div>
                  <div className="label">{t.question} {qIndex + 1}/{questions.length}</div>
                  <div className="text-[var(--accent-primary)] font-mono text-xl mt-1 font-bold">{score.toLocaleString()} {t.pts}</div>
                </div>
                <div className="flex gap-4 items-center">
                  {streak >= 3 && (
                    <div className="badge border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning)]/10 animate-streak-flash">
                      🔥 {t.streak}{streak}
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono text-2xl font-bold transition-colors ${timeLeft <= 3 ? 'border-[var(--color-wrong)] text-[var(--color-wrong)] animate-timer-pulse-danger' : 'border-[var(--border-medium)] text-[var(--text-primary)]'}`}>
                    {timeLeft}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={qIndex} initial={{ x: isRTL ? -50 : 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: isRTL ? 50 : -50, opacity: 0 }} className="flex-1 flex flex-col justify-center">
                  <div className="badge mb-4 w-fit">{currentQ.category}</div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight">{currentQ[lang].question}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ[lang].options.map((opt, i) => {
                      let btnClass = 'glass-card-elevated px-6 py-5 text-left font-medium text-lg hover:border-[var(--accent-primary)] hover:bg-white/5 transition-all text-[var(--text-primary)]';
                      if (isRTL) btnClass = btnClass.replace('text-left', 'text-right');

                      if (feedback) {
                        if (i === currentQ.correct) btnClass = `glass-card-elevated px-6 py-5 ${isRTL ? 'text-right' : 'text-left'} font-bold text-lg bg-[var(--color-correct)]/20 border-[var(--color-correct)] text-[var(--color-correct)]`;
                        else if (feedback === 'wrong') btnClass = `glass-card-elevated px-6 py-5 ${isRTL ? 'text-right' : 'text-left'} font-medium text-lg opacity-50 border-[var(--color-wrong)]/50 text-[var(--color-wrong)]`;
                        else btnClass = `glass-card-elevated px-6 py-5 ${isRTL ? 'text-right' : 'text-left'} font-medium text-lg opacity-50`;
                      }
                      
                      return (
                        <button key={i} disabled={feedback !== null} onClick={() => handleAnswer(i)} className={btnClass}>
                          <span className={`font-mono text-sm opacity-50 ${isRTL ? 'ml-4' : 'mr-4'}`}>{['A','B','C','D'][i]}</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {screen === 'results' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <Trophy className="w-24 h-24 text-[var(--color-warning)] mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
              <h2 className="text-4xl font-bold mb-2">{t.complete}</h2>
              <p className="text-[var(--text-secondary)] mb-8">{t.scored} <span className="text-[var(--accent-primary)] font-bold">{score.toLocaleString()}</span> {t.pts}.</p>
              
              <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-lg mb-12">
                <div className="glass-card-elevated p-4 text-center">
                  <div className="text-2xl font-bold">{correctCount}/{questions.length}</div>
                  <div className="label mt-1">{t.correct}</div>
                </div>
                <div className="glass-card-elevated p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--color-warning)]">{Math.round((correctCount/questions.length)*100)}%</div>
                  <div className="label mt-1">{t.accuracy}</div>
                </div>
                <div className="glass-card-elevated p-4 text-center">
                  <div className="text-2xl font-bold text-[var(--accent-primary)]">{bestStreak}</div>
                  <div className="label mt-1">{t.bestStreak}</div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={startGame} className="btn-primary">
                  <RefreshCw className="w-4 h-4" /> {t.playAgain}
                </button>
                <button onClick={() => setScreen('start')} className="btn-ghost">
                  {t.back}
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'multiplayer-results' && lobby && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center text-center">
              {lobby.status !== 'finished' ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <Loader2 className="w-16 h-16 text-[var(--accent-primary)] animate-spin mb-6" />
                  <h2 className="text-2xl font-bold">{t.finishWaiting}</h2>
                  <p className="text-[var(--text-secondary)] mt-2">Your Score: {score.toLocaleString()}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 w-full">
                  <Trophy className="w-20 h-20 text-[var(--color-warning)] mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
                  <h2 className="text-4xl font-bold mb-8">{t.leaderboard}</h2>
                  
                  <div className="w-full max-w-md space-y-4 mb-8">
                    {parsedPlayers.map((p, i) => (
                      <div key={p.id} className={`flex items-center justify-between px-6 py-4 rounded-xl border ${p.id === playerId ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]' : 'bg-white/5 border-[var(--border-subtle)]'}`}>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold ${i === 0 ? 'text-[var(--color-warning)] text-xl' : 'text-[var(--text-secondary)]'}`}>#{i + 1}</span>
                          <span className="font-bold text-lg">{p.name} {p.id === playerId && '(You)'}</span>
                        </div>
                        <span className="font-mono font-bold">{p.score.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={leaveLobby} className="btn-ghost border-[var(--border-medium)]">
                    {t.leave}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Live Multiplayer Sidebar */}
        {screen === 'multiplayer-playing' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-1/3 glass-card p-6 h-fit">
             <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
               Live Leaderboard <div className="w-2 h-2 rounded-full bg-[var(--color-correct)] animate-pulse" />
             </h3>
             <div className="space-y-4">
               {parsedPlayers.map((p, i) => (
                 <div key={p.id} className="relative bg-white/5 border border-[var(--border-subtle)] rounded-xl p-4 overflow-hidden">
                   <div className="relative z-10 flex justify-between items-center">
                     <div className="flex flex-col">
                       <span className="font-bold text-sm truncate max-w-[120px]">{p.name} {p.id === playerId && '(You)'}</span>
                       <span className="text-xs text-[var(--text-secondary)]">{p.finished ? 'Finished' : 'Playing...'}</span>
                     </div>
                     <span className="font-mono font-bold text-[var(--accent-primary)]">{p.score.toLocaleString()}</span>
                   </div>
                   {/* Score Bar Background */}
                   <div 
                     className="absolute left-0 top-0 bottom-0 bg-[var(--accent-primary)]/10 transition-all duration-500 ease-out" 
                     style={{ width: `${Math.min((p.score / (10 * 300)) * 100, 100)}%` }} 
                   />
                 </div>
               ))}
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
