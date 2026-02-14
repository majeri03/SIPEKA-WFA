'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Laporan } from '@/types';
import { api } from '@/lib/api';
import ReviewModal from '@/components/ReviewModal';
import {
  Search,
  FileText,
  Clock,
  Star,
  Loader2,
  ClipboardCheck,
  TrendingUp
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PenilaianPage() {
  const [user, setUser] = useState<User | null>(null);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [filteredLaporan, setFilteredLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);

  const filterData = useCallback(() => {
    let filtered = laporan;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLaporan(filtered);
  }, [laporan, searchQuery]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLaporan();
    }
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const loadLaporan = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const data = await api.getLaporanForReview(user.email);
      setLaporan(data);
      setFilteredLaporan(data);
    } catch (error) {
      console.error('Error loading laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (data: { rating: number; komentar: string }) => {
    if (!selectedLaporan || !user) return;

    try {
      await api.submitReview({
        laporan_id: selectedLaporan.id,
        reviewer_email: user.email,
        reviewer_name: user.name,
        rating: data.rating,
        komentar: data.komentar,
        created_at: new Date().toISOString(),
      });

      // Reload data
      await loadLaporan();
      setShowReviewModal(false);
      setSelectedLaporan(null);

      alert('Penilaian berhasil dikirim!');
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengirim penilaian';
      alert(errorMessage);
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

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari laporan atau pegawai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Stats Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <Clock size={18} className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            {laporan.length} Laporan Menunggu
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{laporan.length}</p>
              <p className="text-sm text-slate-500">Menunggu Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <ClipboardCheck size={24} className="text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">0</p>
              <p className="text-sm text-slate-500">Hari Ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">-</p>
              <p className="text-sm text-slate-500">Rata-rata Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Laporan List */}
      {filteredLaporan.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Tidak ada laporan yang perlu dinilai</p>
          <p className="text-slate-400 text-sm mt-2">Semua laporan sudah selesai direview</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Pegawai
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Judul Laporan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLaporan.map((lap) => (
                  <tr key={lap.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
                          {lap.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {lap.user_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <FileText size={18} className="text-teal-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {lap.judul}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {lap.deskripsi}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {formatDate(lap.tanggal)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedLaporan(lap);
                          setShowReviewModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      >
                        <Star size={16} />
                        Beri Nilai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-200">
            {filteredLaporan.map((lap) => (
              <div key={lap.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {lap.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">{lap.user_name}</p>
                    <p className="text-sm font-semibold text-slate-800 mb-1">
                      {lap.judul}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                      {lap.deskripsi}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(lap.tanggal)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedLaporan(lap);
                    setShowReviewModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg"
                >
                  <Star size={16} />
                  Beri Nilai
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedLaporan && (
        <ReviewModal
          laporan={selectedLaporan}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedLaporan(null);
          }}
          onSubmit={handleReview}
        />
      )}

    </div>
  );
}