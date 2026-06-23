export type ToyCategory = 'game' | 'tool' | 'experiment' | 'service';

export interface Toy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: ToyCategory;
  tags: string[];
  date: string;
  path: string;
  color: string;
  status?: 'live' | 'coming-soon';
}

export const TOYS: Toy[] = [
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Test your knowledge across Tech, Science, Pop Culture, Gaming & General Knowledge. Features difficulty modes, streak bonuses, timer, sound effects, and a leaderboard.',
    emoji: '🧠',
    category: 'game',
    tags: ['game', 'trivia', 'leaderboard'],
    date: '2026-06-23',
    path: '/toys/quiz-master',
    color: '#a78bfa',
    status: 'live',
  },
  {
    id: 'drop-share',
    name: 'Drop Share',
    description: 'Secure, ephemeral P2P file sharing. Drop files here and share the link. Files self-destruct after 24 hours to save VPS storage.',
    emoji: '📦',
    category: 'tool',
    tags: ['utility', 'files', 'p2p'],
    date: '2026-06-25',
    path: '/toys/drop-share',
    color: '#34d399',
    status: 'live',
  },
  {
    id: 'yt-fetcher',
    name: 'YT Fetcher',
    description: 'Fast YouTube video & audio downloader running on edge functions. Extracts streams without bloating the server memory.',
    emoji: '🎬',
    category: 'tool',
    tags: ['utility', 'media', 'downloader'],
    date: '2026-06-26',
    path: '/toys/yt-fetcher',
    color: '#f87171',
    status: 'live',
  },
  {
    id: 'bot-runner',
    name: 'Discord Bot Runner',
    description: 'Host and run your Discord bot scripts directly from the browser. Isolated secure sandboxes with strict memory limits.',
    emoji: '🤖',
    category: 'service',
    tags: ['server', 'bots', 'discord'],
    date: '2026-06-28',
    path: '#',
    color: '#60a5fa',
    status: 'coming-soon',
  }
];
