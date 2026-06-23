'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Share2, AlertCircle, Globe, Users } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizCategory, Question, Language } from '@/lib/quiz-data';
import { account, databases, ID, APPWRITE_CONFIG } from '@/lib/appwrite';

type Difficulty = 'easy' | 'medium' | 'hard';
type Screen = 'start' | 'playing' | 'results' | 'multiplayer-setup';

const DIFFICULTIES = {
  easy: { time: 10, multi: 1 },
  medium: { time: 7, multi: 1.5 },
  hard: { time: 5, multi: 2 }
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
  const [savingScore, setSavingScore] = useState(false);

  // Multiplayer State
  const [roomCode, setRoomCode] = useState('');

  // Initialize Auth
  useEffect(() => {
    account.get().then(u => setUser(u)).catch(() => setUser(null));
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        osc.frequency.setValueAtTime(1000, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Audio disabled or failed", e);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (screen !== 'playing' || timeLeft <= 0 || feedback !== null) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1); // timeout
          return 0;
        }
        if (prev <= 4) playSound('tick');
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, timeLeft, feedback, playSound]);

  const startGame = () => {
    // initialize audio on user interaction
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    let pool = category === 'All' ? [...QUIZ_QUESTIONS] : QUIZ_QUESTIONS.filter(q => q.category === category);
    pool.sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, 10); // play 10 questions max
    
    setQuestions(selected);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setFeedback(null);
    setTimeLeft(DIFFICULTIES[difficulty].time);
    setScreen('playing');
  };

  const handleAnswer = (index: number) => {
    if (feedback !== null) return; // already answered
    
    const q = questions[qIndex];
    const isCorrect = index === q.correct;
    
    if (isCorrect) {
      playSound('correct');
      setFeedback('correct');
      const timeBonus = timeLeft * 10;
      const streakBonus = streak >= 3 ? 50 : 0;
      const earned = Math.round((100 + timeBonus + streakBonus) * DIFFICULTIES[difficulty].multi);
      
      setScore(s => s + earned);
      setCorrectCount(c => c + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      playSound('wrong');
      setFeedback('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex(q => q + 1);
        setFeedback(null);
        setTimeLeft(DIFFICULTIES[difficulty].time);
      } else {
        endGame();
      }
    }, 1500);
  };

  const endGame = async () => {
    setScreen('results');
    playSound('correct'); // simple finish sound
    
    if (user && score > 0) {
      setSavingScore(true);
      try {
        await databases.createDocument(
          APPWRITE_CONFIG.dbId,
          APPWRITE_CONFIG.scoresCollId,
          ID.unique(),
          {
            userId: user.$id,
            userName: user.name || 'Anonymous',
            toyId: 'quiz-master',
            score: score,
            difficulty: difficulty,
            date: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error("Failed to save score:", error);
      } finally {
        setSavingScore(false);
      }
    }
  };

  const currentQ = questions[qIndex];
  const isRTL = lang === 'ar';
  
  const translations = {
    en: {
      title: 'Quiz Master',
      subtitle: 'Test your knowledge across deep topics including Islamic History and Arab Culture.',
      category: 'Category',
      difficulty: 'Difficulty',
      start: 'Start Solo Quiz',
      multiplayer: 'Multiplayer (Beta)',
      question: 'Question',
      pts: 'pts',
      streak: 'Streak x',
      complete: 'Quiz Complete!',
      scored: 'You scored',
      correct: 'Correct',
      accuracy: 'Accuracy',
      bestStreak: 'Best Streak',
      playAgain: 'Play Again',
      share: 'Share Score',
      loginRequired: 'Log in to save your score to the global leaderboard.',
      saving: 'Saving score to Appwrite...',
      saved: '✓ Score saved successfully!',
      multiplayerSetup: 'Multiplayer Room Setup',
      createRoom: 'Create New Room',
      joinRoom: 'Join Room',
      roomCode: 'Enter 6-digit Room Code',
      back: 'Back to Menu'
    },
    ar: {
      title: 'سيد المسابقات',
      subtitle: 'اختبر معلوماتك في مواضيع عميقة تشمل التاريخ الإسلامي والثقافة العربية.',
      category: 'التصنيف',
      difficulty: 'الصعوبة',
      start: 'ابدأ اللعب الفردي',
      multiplayer: 'لعب جماعي (تجريبي)',
      question: 'سؤال',
      pts: 'نقطة',
      streak: 'متتالية x',
      complete: 'انتهى الاختبار!',
      scored: 'لقد سجلت',
      correct: 'إجابة صحيحة',
      accuracy: 'الدقة',
      bestStreak: 'أفضل متتالية',
      playAgain: 'العب مرة أخرى',
      share: 'شارك النتيجة',
      loginRequired: 'قم بتسجيل الدخول لحفظ نتيجتك في قائمة الصدارة العالمية.',
      saving: 'جاري حفظ النتيجة في Appwrite...',
      saved: '✓ تم حفظ النتيجة بنجاح!',
      multiplayerSetup: 'إعداد غرفة اللعب الجماعي',
      createRoom: 'إنشاء غرفة جديدة',
      joinRoom: 'الانضمام لغرفة',
      roomCode: 'أدخل رمز الغرفة المكون من 6 أرقام',
      back: 'العودة للقائمة'
    }
  };

  const t = translations[lang];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="pt-24 px-6 md:px-12 max-w-4xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono text-sm transition-colors w-fit">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} /> {lang === 'en' ? 'Back to Gallery' : 'العودة للمعرض'}
        </Link>
        
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="btn-ghost !px-4 !py-2 !text-[10px]"
        >
          <Globe className="w-3.5 h-3.5" /> {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <div className="flex-1 glass-card p-8 md:p-12 relative overflow-hidden flex flex-col">
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
              <button onClick={() => setScreen('multiplayer-setup')} className="btn-ghost flex-1 py-4 border-[var(--border-medium)]">
                <Users className="w-5 h-5" /> {t.multiplayer}
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'multiplayer-setup' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-[var(--text-tertiary)]/20 text-[var(--text-primary)] rounded-2xl flex items-center justify-center text-4xl mb-8">
              👥
            </div>
            <h2 className="text-3xl font-bold mb-4">{t.multiplayerSetup}</h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm text-sm">
              Note: Multiplayer requires configuring the "Lobbies" collection in Appwrite. Currently in UI Beta.
            </p>

            <div className="w-full max-w-sm space-y-4">
              <button className="btn-primary w-full py-4 opacity-50 cursor-not-allowed">
                {t.createRoom}
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
                  placeholder={t.roomCode}
                  className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-4 text-center font-mono tracking-widest uppercase text-xl focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button className="btn-ghost w-full py-4 border-[var(--border-medium)] opacity-50 cursor-not-allowed">
                  {t.joinRoom}
                </button>
              </div>
            </div>

            <button onClick={() => setScreen('start')} className="mt-12 text-sm font-mono text-[var(--text-secondary)] hover:text-white transition-colors">
              {t.back}
            </button>
          </motion.div>
        )}

        {screen === 'playing' && currentQ && (
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

            {!user && (
              <div className="mb-8 p-4 bg-white/5 border border-[var(--border-subtle)] rounded-xl flex items-start gap-3 max-w-md text-left" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <AlertCircle className={`w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                <p className="text-sm text-[var(--text-secondary)]">
                  {t.loginRequired}
                </p>
              </div>
            )}
            {user && savingScore && (
              <p className="text-sm text-[var(--text-tertiary)] mb-8 animate-pulse">{t.saving}</p>
            )}
            {user && !savingScore && score > 0 && (
              <p className="text-sm text-[var(--color-correct)] mb-8">{t.saved}</p>
            )}

            <div className="flex gap-4">
              <button onClick={startGame} className="btn-primary">
                <RefreshCw className="w-4 h-4" /> {t.playAgain}
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(`🧠 Quiz Master [${difficulty}]\nScore: ${score.toLocaleString()}\nAccuracy: ${Math.round((correctCount/questions.length)*100)}%\nPlay at: toys.roocky.dev`);
                alert('Copied to clipboard!');
              }} className="btn-ghost">
                <Share2 className="w-4 h-4" /> {t.share}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
