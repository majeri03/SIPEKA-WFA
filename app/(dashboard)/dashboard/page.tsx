'use client';

import { useEffect, useState } from 'react';
import { User, DashboardStats } from '@/types';
import { api } from '@/lib/api';
import { FileText, CheckCircle, Clock, Star } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      loadStats(parsedUser);
    }
  }, []);

  const loadStats = async (userData: User) => {
    try {
      const statsData = await api.getDashboardStats(userData.email, userData.role);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>User tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang, <span className="font-semibold">{user.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Laporan */}
        <div className="card-ios">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Laporan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalLaporan || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText size={24} style={{ color: 'var(--color-ios-blue)' }} />
            </div>
          </div>
        </div>

        {/* Sudah Dinilai */}
        <div className="card-ios">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sudah Dinilai</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats?.sudahDinilai || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Belum Dinilai */}
        <div className="card-ios">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Dinilai</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats?.belumDinilai || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Rata-rata Rating */}
        <div className="card-ios">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Rating</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats?.rataRating ? stats.rataRating.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card-ios">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Akun</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">NIP</p>
            <p className="font-semibold text-gray-900">{user.nip}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Jabatan</p>
            <p className="font-semibold text-gray-900">{user.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Kerja</p>
            <p className="font-semibold text-gray-900">{user.unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}