'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Laporan } from '@/types';
import { api } from '@/lib/api';
import LaporanTable from '@/components/LaporanTable';
import { Plus, Search, Filter, FileText, Star, X, Upload, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function LaporanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [filteredLaporan, setFilteredLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'belum_dinilai' | 'sudah_dinilai'>('semua');
  
  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);

  // Form Submit Laporan
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    deskripsi: '',
    file_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // 🔥 FIX: Gunakan useCallback untuk filterData
  const filterData = useCallback(() => {
    let filtered = laporan;

    if (filterStatus !== 'semua') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLaporan(filtered);
  }, [laporan, filterStatus, searchQuery]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLaporan(parsedUser);
    }
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadLaporan = async (userData: User) => {
    try {
      const data = await api.getLaporan(userData.email);
      setLaporan(data);
      setFilteredLaporan(data);
    } catch (error) {
      console.error('Error loading laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await api.submitLaporan({
        user_id: user.id,
        ...formData,
      });
      
      await loadLaporan(user);
      
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        judul: '',
        deskripsi: '',
        file_url: '',
      });
      setShowSubmitModal(false);
      
      alert('Laporan berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting laporan:', error);
      alert('Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={48} className="animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* ...existing code... Header Actions, Stats, Table */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-initial">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'semua' | 'belum_dinilai' | 'sudah_dinilai')}
              className="w-full lg:w-auto pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="belum_dinilai">Menunggu Penilaian</option>
              <option value="sudah_dinilai">Sudah Dinilai</option>
            </select>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah Laporan</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileText size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{laporan.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Star size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {laporan.filter(l => l.status === 'sudah_dinilai').length}
              </p>
              <p className="text-xs text-slate-500">Dinilai</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {laporan.filter(l => l.status === 'belum_dinilai').length}
              </p>
              <p className="text-xs text-slate-500">Menunggu</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Star size={20} className="text-purple-600 fill-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {(laporan
                  .filter(l => l.rating)
                  .reduce((acc, l) => acc + (l.rating || 0), 0) / laporan.filter(l => l.rating).length || 0
                ).toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">Rata-rata</p>
            </div>
          </div>
        </div>
      </div>

      <LaporanTable 
        data={filteredLaporan} 
        onViewDetail={(lap) => {
          setSelectedLaporan(lap);
          setShowDetailModal(true);
        }}
      />

      {/* 🔥 MODAL SUBMIT - FIXED Z-INDEX & POSITIONING */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-800">Tambah Laporan Baru</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Judul Laporan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Laporan Implementasi Fitur Login"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Jelaskan detail kegiatan yang telah dilakukan..."
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link File Pendukung <span className="text-slate-400">(opsional)</span>
                </label>
                <div className="relative">
                  <Upload size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Upload file ke Google Drive dan paste link share-nya di sini
                </p>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Mengirim...
                    </span>
                  ) : 'Kirim Laporan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 🔥 MODAL DETAIL - FIXED Z-INDEX */}
      {showDetailModal && selectedLaporan && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            <div className="bg-linear-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-white">Detail Laporan</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              <div className="flex items-center gap-3">
                {selectedLaporan.status === 'sudah_dinilai' ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700">
                    <Star size={16} className="fill-emerald-700" />
                    Sudah Dinilai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-700">
                    <FileText size={16} />
                    Menunggu Penilaian
                  </span>
                )}
                <span className="text-sm text-slate-500">
                  {formatDate(selectedLaporan.tanggal)}
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedLaporan.judul}
                </h4>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Deskripsi Kegiatan</p>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedLaporan.deskripsi}
                </p>
              </div>

              {selectedLaporan.file_url && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">File Pendukung</p>
                  <a
                    href={selectedLaporan.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
                  >
                    <FileText size={16} />
                    Buka File
                  </a>
                </div>
              )}

              {selectedLaporan.status === 'sudah_dinilai' && (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= (selectedLaporan.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-slate-800">
                      {selectedLaporan.rating?.toFixed(1)}
                    </span>
                  </div>
                  {selectedLaporan.komentar && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Komentar Penilai</p>
                      <p className="text-slate-600 italic">&quot;{selectedLaporan.komentar}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Tutup
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}