'use client';

import { useState } from 'react';
import { Laporan } from '@/types';
import { X, Star, Send, FileText, User, Calendar, Loader2 } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-linear-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-white">Beri Penilaian</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Laporan Info */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                <FileText size={24} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-slate-800 mb-2">
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

          {/* Deskripsi */}
          <div className="p-6 border-b border-slate-200">
            <h5 className="text-sm font-semibold text-slate-700 mb-3">Deskripsi Kegiatan</h5>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {laporan.deskripsi}
            </p>
            {laporan.file_url && (
              <a
                href={laporan.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                <FileText size={16} />
                Lihat File Pendukung
              </a>
            )}
          </div>

          {/* Form Penilaian */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Berikan Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  Rating: <span className="font-bold text-amber-600">{rating} / 5</span>
                  {rating === 5 && ' - Sangat Baik! ⭐'}
                  {rating === 4 && ' - Baik'}
                  {rating === 3 && ' - Cukup'}
                  {rating === 2 && ' - Kurang'}
                  {rating === 1 && ' - Perlu Perbaikan'}
                </p>
              )}
            </div>

            {/* Komentar */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Komentar & Saran <span className="text-red-500">*</span>
              </label>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                placeholder="Berikan feedback, apresiasi, atau saran perbaikan..."
                required
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Minimal 10 karakter
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 px-6 py-3 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send size={18} />
                    Kirim Penilaian
                  </span>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}