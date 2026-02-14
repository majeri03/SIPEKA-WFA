'use client';

import { useState, useEffect } from 'react';
import { User, DashboardStats } from '@/types';
import { api } from '@/lib/api';
import DashboardCard from '@/components/DashboardCard';
import {
  FileText,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    // ✅ Load dari sessionStorage dulu (cache)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('dashboardStats');
      if (cached) {
        return JSON.parse(cached);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadData(parsedUser); // ✅ BENAR
    }
  }, []);

  const loadData = async (userData: User) => {
    try {
      console.log('📊 Loading dashboard for:', userData.email);

      const summaryData = await api.getProfileSummary(userData.email);
      console.log('✅ Summary data:', summaryData);

      const newStats = {
        totalLaporan: summaryData.totalLaporan,
        sudahDinilai: summaryData.totalDinilai,
        belumDinilai: summaryData.belumDinilai,
        rataRating: summaryData.rataRating,
      };

      setStats(newStats);

      // ✅ Simpan ke sessionStorage (cache 1 sesi)
      sessionStorage.setItem('dashboardStats', JSON.stringify(newStats));

    } catch (error) {
      console.error('Error loading dashboard:', error);

      // Set default jika error
      setStats({
        totalLaporan: 0,
        sudahDinilai: 0,
        belumDinilai: 0,
        rataRating: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !stats) return null;

  return (
    <div className="space-y-8 animate-fade-up">

      {/* Welcome Card */}
      <div className="bg-linear-to-br from-teal-500 to-emerald-500 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Award size={32} className="text-white" />
            <h2 className="text-2xl font-bold">Selamat Datang Kembali! 👋</h2>
          </div>
          <p className="text-teal-100 text-lg mb-2">{user.name}</p>
          <p className="text-teal-100 text-sm">{user.position} • {user.unit}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Laporan"
          value={stats.totalLaporan}
          icon={FileText}
          color="teal"
          trend={{ value: '+12% bulan ini', isPositive: true }}
        />

        <DashboardCard
          title="Sudah Dinilai"
          value={stats.sudahDinilai}
          icon={CheckCircle}
          color="emerald"
          trend={{ value: `${Math.round((stats.sudahDinilai / stats.totalLaporan) * 100)}% selesai`, isPositive: true }}
        />

        <DashboardCard
          title="Menunggu Penilaian"
          value={stats.belumDinilai}
          icon={Clock}
          color="amber"
        />

        <DashboardCard
          title="Rata-rata Rating"
          value={stats.rataRating.toFixed(1)}
          icon={Star}
          color="purple"
          trend={{ value: '+0.3 dari bulan lalu', isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Aktivitas Terkini */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Aktivitas Terkini</h3>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Laporan disetujui', desc: 'Laporan Implementasi SIPEKA', time: '2 jam lalu', color: 'emerald' },
              { title: 'Menunggu review', desc: 'Laporan Maintenance Server', time: '1 hari lalu', color: 'amber' },
              { title: 'Laporan dikirim', desc: 'Laporan Pengembangan Fitur', time: '3 hari lalu', color: 'blue' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className={`w-2 h-2 rounded-full bg-${item.color}-500 mt-2 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs truncate">{item.desc}</p>
                  <p className="text-slate-400 text-xs mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Deadline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={24} className="text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Deadline Terdekat</h3>
          </div>

          <div className="space-y-4">
            {[
              { task: 'Laporan Bulanan Februari', date: '28 Feb 2025', priority: 'high' },
              { task: 'Evaluasi Kinerja Q1', date: '31 Mar 2025', priority: 'medium' },
              { task: 'Rencana Kerja Tahunan', date: '15 Apr 2025', priority: 'low' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.priority === 'high' ? 'bg-rose-500' :
                    item.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{item.task}</p>
                    <p className="text-slate-500 text-xs">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}