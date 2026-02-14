'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // ✅ Import Portal
import { Laporan } from '@/types';
import { X, Star, Send, FileText, User, Calendar, Loader2, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewModalProps {
  laporan: Laporan;
  onClose: () => void;
  onSubmit: (data: { rating: number; komentar: string }) => Promise<void>;
}

export default function ReviewModal({ laporan, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false); // State untuk cek client-side

  // Pastikan Portal hanya jalan di browser (client-side)
  useEffect(() => {
    setMounted(true);
    // Disable scroll pada body saat modal terbuka
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Helper untuk convert link Google Drive jadi Direct Link gambar
  const getDirectImageLink = (url?: string) => {
    if (!url) return null;
    if (url.includes('drive.google.com') && url.includes('/file/d/')) {
      const idMatch = url.match(/\/d\/(.*?)\//);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      }
    }
    return url; 
  };

  const imageSrc = getDirectImageLink(laporan.file_url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Silakan pilih rating terlebih dahulu');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, komentar });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Gagal mengirim penilaian');
    } finally {
      setSubmitting(false);
    }
  };

  // Jika belum mounted (SSR), jangan render apa-apa
  if (!mounted) return null;

  // Gunakan Portal untuk memindahkan modal ke document.body
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      
      {/* Backdrop Gelap (Klik luar untuk tutup) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-zoom-in">
        
        {/* Header */}
        <div className="bg-linear-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-white">Beri Penilaian</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Laporan Info */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <FileText size={24} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-slate-800 mb-2 wrap-break-word">
                  {laporan.judul}
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    <span>{laporan.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{formatDate(laporan.tanggal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi & Bukti */}
          <div className="p-6 border-b border-slate-200 space-y-6">
            
            {/* Teks Deskripsi */}
            <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-3">Deskripsi Kegiatan</h5>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap wrap-break-word">
                {laporan.deskripsi}
                </p>
            </div>

            {/* Bukti Lampiran */}
            <div>
                <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <ImageIcon size={16} className="text-slate-500" />
                    Bukti Lampiran
                </h5>
                
                <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex justify-center items-center min-h-[200px] max-h-[400px]">
                    {imageSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                        src={imageSrc} 
                        alt="Bukti Laporan"
                        className="w-full h-full object-contain bg-black/5" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Gagal+Muat+Gambar";
                            (e.target as HTMLImageElement).className = "p-10 opacity-50";
                        }}
                        />
                    ) : (
                        <div className="text-slate-400 flex flex-col items-center gap-2 py-10">
                            <ImageIcon size={48} className="opacity-20" />
                            <p>Tidak ada lampiran gambar</p>
                        </div>
                    )}
                </div>

                {laporan.file_url && (
                    <a
                        href={laporan.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline"
                    >
                        <FileText size={16} />
                        Buka file asli di Google Drive ↗
                    </a>
                )}
            </div>
          </div>

          {/* Form Penilaian */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
            
            {/* Rating Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Berikan Rating <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                        size={40}
                        className={
                            star <= (hoveredRating || rating)
                            ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                            : 'text-slate-200 fill-slate-50'
                        }
                        />
                    </button>
                    ))}
                  </div>
                  
                  {rating > 0 && (
                    <div className="animate-fade-in text-sm font-medium text-slate-600">
                        {rating === 5 && <span className="text-emerald-600">Sangat Baik (5/5) ⭐</span>}
                        {rating === 4 && <span className="text-blue-600">Baik (4/5) 🙂</span>}
                        {rating === 3 && <span className="text-amber-600">Cukup (3/5) 😐</span>}
                        {rating === 2 && <span className="text-orange-600">Kurang (2/5) 😕</span>}
                        {rating === 1 && <span className="text-red-600">Perlu Perbaikan (1/5) 😞</span>}
                    </div>
                  )}
              </div>
            </div>

            {/* Komentar Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Komentar & Saran <span className="text-red-500">*</span>
              </label>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                placeholder="Berikan feedback, apresiasi, atau saran perbaikan..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Minimal 10 karakter</span>
                <span className={komentar.length >= 10 ? "text-teal-600" : "text-slate-400"}>
                    {komentar.length} karakter
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0 || komentar.length < 10}
                className="flex-1 px-6 py-3 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Kirim Penilaian
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>,
    document.body // ✅ Inilah kuncinya: Render modal langsung di body
  );
}