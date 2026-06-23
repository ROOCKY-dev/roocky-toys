'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PlaySquare, Download, Music, Video, Search, AlertCircle, Loader2 } from 'lucide-react';

type MediaMetadata = {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
};

export default function YTFetcher() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);

  const extractVideoId = (link: string) => {
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : null;
  };

  const handleFetch = async () => {
    if (!url) return;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL. Please provide a valid link.');
      return;
    }

    try {
      const res = await fetch(`/api/yt?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch video');
      
      setMetadata(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'audio' | 'video') => {
    window.location.href = `/api/yt/download?url=${encodeURIComponent(url)}&format=${format}`;
  };

  return (
    <div className="pt-24 px-6 md:px-12 max-w-4xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 font-mono text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </Link>

      <div className="flex-1 glass-card p-8 md:p-12 relative overflow-hidden flex flex-col items-center">
        <div className="w-20 h-20 bg-[#FF0000]/10 text-[#FF0000] rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-[#FF0000]/30 mb-8 animate-pulse-glow">
          <PlaySquare size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">YT Fetcher</h1>
        <p className="text-[var(--text-secondary)] mb-12 max-w-md mx-auto text-center">
          Extract high-quality video or audio directly from YouTube links. Fast, secure, and ad-free.
        </p>

        <div className="w-full max-w-2xl">
          <div className="relative group mb-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Paste YouTube link here... (e.g., https://youtube.com/watch?v=...)"
              className="w-full bg-white/5 border border-[var(--border-medium)] rounded-2xl pl-12 pr-32 py-5 focus:outline-none focus:border-[var(--accent-primary)] transition-all shadow-inner font-mono text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            />
            <button 
              onClick={handleFetch}
              disabled={loading || !url}
              className="absolute right-2 top-2 bottom-2 bg-[var(--accent-primary)] text-white font-bold px-6 rounded-xl hover:bg-[var(--accent-glow)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-[var(--color-wrong)]/10 border border-[var(--color-wrong)]/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-wrong)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-wrong)]">{error}</p>
            </motion.div>
          )}

          <AnimatePresence>
            {metadata && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card-elevated rounded-3xl overflow-hidden border border-[var(--border-medium)]"
              >
                <div className="relative aspect-video w-full bg-black">
                  <img 
                    src={metadata.thumbnail} 
                    alt={metadata.title}
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1280x720?text=No+Thumbnail+Available';
                    }}
                  />
                  <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded-md font-mono text-xs font-bold border border-white/10 backdrop-blur-md">
                    {metadata.duration}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2 leading-snug">{metadata.title}</h3>
                  <p className="text-[var(--text-secondary)] font-mono text-sm mb-8">{metadata.channel}</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => handleDownload('video')} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 shadow-lg shadow-[#FF0000]/20 hover:shadow-[#FF0000]/40 !bg-[#FF0000] !border-[#FF0000] !text-white">
                      <Video className="w-5 h-5" /> Download Video (MP4)
                    </button>
                    <button onClick={() => handleDownload('audio')} className="glass-card-elevated border hover:border-[var(--accent-primary)] hover:bg-white/5 flex-1 flex items-center justify-center gap-2 py-4 transition-all font-bold">
                      <Music className="w-5 h-5 text-[var(--accent-primary)]" /> Download Audio (MP3)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
