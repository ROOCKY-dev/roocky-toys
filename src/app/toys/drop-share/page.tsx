'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UploadCloud, File, Link as LinkIcon, CheckCircle2, XCircle, FileText, FileImage, FileAudio, FileVideo, FileArchive } from 'lucide-react';
import { storage, ID, APPWRITE_CONFIG } from '@/lib/appwrite';

export default function DropShare() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-12 h-12 text-[var(--accent-primary)]" />;
    if (type.startsWith('video/')) return <FileVideo className="w-12 h-12 text-[var(--accent-primary)]" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-12 h-12 text-[var(--accent-primary)]" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <FileArchive className="w-12 h-12 text-[var(--accent-primary)]" />;
    return <FileText className="w-12 h-12 text-[var(--accent-primary)]" />;
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!APPWRITE_CONFIG.bucketId) {
      setError('Storage Bucket is not configured. Please add NEXT_PUBLIC_APPWRITE_BUCKET_ID to your environment variables.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress for smooth UI, since Appwrite upload might be very fast for small files
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + Math.random() * 15, 90));
      }, 200);

      const result = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        ID.unique(),
        file
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Generate Download URL
      const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${result.$id}/download?project=${APPWRITE_CONFIG.projectId}`;
      
      setTimeout(() => {
        setShareUrl(fileUrl);
        setUploading(false);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
      setUploading(false);
      setProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setShareUrl('');
    setError('');
    setProgress(0);
  };

  return (
    <div className="pt-24 px-6 md:px-12 max-w-4xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col">
      <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 font-mono text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </Link>

      <div className="flex-1 glass-card p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[var(--text-primary)]/10 text-[var(--text-primary)] rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/10 mb-8 animate-pulse-glow">
          📦
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Drop Share</h1>
        <p className="text-[var(--text-secondary)] mb-12 max-w-md mx-auto text-center">Securely share files up to 50MB. Files are uploaded directly to your Appwrite Storage and expire automatically if configured.</p>

        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!file && !shareUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${isDragging ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-[var(--border-medium)] hover:border-[var(--text-secondary)] bg-white/5'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
                <UploadCloud className={`w-16 h-16 mx-auto mb-6 transition-colors ${isDragging ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`} />
                <h3 className="text-xl font-bold mb-2">Drag & Drop file here</h3>
                <p className="text-[var(--text-secondary)] font-mono text-sm">or click to browse</p>
              </motion.div>
            )}

            {file && !shareUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-elevated p-8 rounded-3xl w-full">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-xl font-bold truncate mb-1">{file.name}</h3>
                    <p className="text-[var(--text-secondary)] font-mono text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown type'}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-[var(--color-wrong)]/10 border border-[var(--color-wrong)]/30 rounded-xl flex items-start gap-3 text-left">
                    <XCircle className="w-5 h-5 text-[var(--color-wrong)] shrink-0 mt-0.5" />
                    <p className="text-sm text-[var(--color-wrong)]">{error}</p>
                  </div>
                )}

                {uploading ? (
                  <div>
                    <div className="flex justify-between font-mono text-sm mb-3">
                      <span className="text-[var(--text-secondary)]">Uploading...</span>
                      <span className="font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={reset} className="btn-ghost flex-1 border-[var(--border-medium)]">Cancel</button>
                    <button onClick={handleUpload} className="btn-primary flex-1">Upload File</button>
                  </div>
                )}
              </motion.div>
            )}

            {shareUrl && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-8 rounded-3xl w-full text-center">
                <div className="w-20 h-20 bg-[var(--color-correct)]/20 text-[var(--color-correct)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Upload Complete!</h3>
                <p className="text-[var(--text-secondary)] mb-8">Your file is ready to share.</p>

                <div className="relative group mb-8">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl}
                    className="w-full bg-white/5 border border-[var(--border-medium)] rounded-xl px-4 py-4 pr-32 text-sm font-mono focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className={`absolute right-2 top-2 bottom-2 px-4 rounded-lg font-mono text-xs uppercase font-bold transition-all ${copied ? 'bg-[var(--color-correct)] text-white' : 'bg-white/10 hover:bg-[var(--accent-primary)] hover:text-white'}`}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>

                <div className="flex gap-4 justify-center">
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost border-[var(--border-medium)]">
                    <LinkIcon className="w-4 h-4" /> Open Link
                  </a>
                  <button onClick={reset} className="btn-primary">
                    Share Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
