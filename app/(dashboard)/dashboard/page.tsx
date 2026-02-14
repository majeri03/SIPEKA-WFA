'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import DashboardCard from '@/components/DashboardCard';
import {
  FileText,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';
import { User } from '@/types';
// Interface untuk data dari API
interface DashboardData {
  totalLaporan: number;
  totalDinilai: number;
  belumDinilai: number;
  rataRating: number;
  recentActivities: Array<{
    title: string;
    desc: string;
    time: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  // State Data Dashboard
  const [stats, setStats] = useState<DashboardData>({
    totalLaporan: 0,
    totalDinilai: 0,
    belumDinilai: 0,
    rataRating: 0,
    recentActivities: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    
    if (userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        if (parsedUser && parsedUser.email) {
            setUser(parsedUser);
            loadData(parsedUser.email);
        } else {
            router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    } else {
        router.replace('/login');
    }
  }, [router]);

  const loadData = async (email: string) => {
    try {
      // Panggil API getProfileSummary yang baru
      const data = await api.getProfileSummary(email);
      setStats(data as unknown as DashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk format tanggal Indonesia
  const getTodayDate = () => {
    return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getEndOfMonth = () => {
    const date = new Date();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  const getCardLabels = () => {
    if (user?.role === 'sdm') {
      return {
        card1: 'Total Laporan (Global)',
        card2: 'Total Terverifikasi',
        card3: 'Menunggu Review',
        card4: 'Rata-rata Kinerja Kantor'
      };
    } else if (user?.role === 'supervisor') {
      return {
        card1: 'Laporan Masuk (Tim)',
        card2: 'Sudah Saya Nilai',
        card3: 'Perlu Dinilai',
        card4: 'Rata-rata Rating Tim'
      };
    } else {
      return {
        card1: 'Laporan Saya',
        card2: 'Sudah Dinilai',
        card3: 'Menunggu Penilaian',
        card4: 'Rating Rata-rata Saya'
      };
    }
  };

  const labels = getCardLabels();
  return (
    <div className="space-y-8 animate-fade-up pb-10">

      {/* Welcome Card */}
      <div className="bg-linear-to-br from-teal-500 to-emerald-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Award size={32} className="text-white" />
            <h2 className="text-2xl font-bold">Selamat Datang, {user.name.split(' ')[0]}! 👋</h2>
          </div>
          <p className="text-teal-100 text-lg mb-2">{user.position}</p>
          <p className="text-teal-100 text-sm opacity-80">{user.unit}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title={labels.card1}
          value={stats.totalLaporan}
          icon={FileText}
          color="teal"
        />
        <DashboardCard
          title={labels.card2}
          value={stats.totalDinilai}
          icon={CheckCircle}
          color="emerald"
        />
        <DashboardCard
          title={labels.card3}
          value={stats.belumDinilai}
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title={labels.card4}
          value={Number(stats.rataRating).toFixed(1)}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Aktivitas Terkini (REAL DATA) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Aktivitas Terkini</h3>
          </div>

          <div className="space-y-4 flex-1">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  {/* Indikator Warna Status */}
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    item.status === 'reviewed' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs truncate">{item.desc}</p>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <Clock size={10} /> {item.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                <FileText size={32} className="mb-2 opacity-50" />
                <p>Belum ada aktivitas laporan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Deadline (SEMI-DYNAMIC) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} className="text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Agenda & Deadline</h3>
          </div>

          <div className="space-y-4">
            {/* Deadline Harian (Otomatis Tanggal Hari Ini) */}
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Laporan Kinerja Harian</p>
                  <p className="text-slate-500 text-xs">Wajib lapor sebelum 23:59</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-white px-2 py-1 rounded-md border border-orange-200">
                {getTodayDate()}
              </span>
            </div>

            {/* Deadline Bulanan (Otomatis Akhir Bulan) */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">Rekap Laporan Bulanan</p>
                  <p className="text-slate-500 text-xs">Periode bulan ini</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-200">
                {getEndOfMonth()}
              </span>
            </div>

            {/* Info Umum */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <AlertCircle size={18} className="text-slate-400 mt-0.5" />
                <div>
                    <p className="text-sm text-slate-600 font-medium">Informasi</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Pastikan mengisi laporan dengan bukti dukung yang valid. Penilaian dilakukan oleh atasan langsung secara berkala.
                    </p>
                </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}