'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api'; // Import interface baru
import { User, ArsipData } from '@/types';
import { FileSpreadsheet, Download, AlertCircle, Search } from 'lucide-react';
import * as XLSX from 'xlsx'; // ✅ Import Library Excel

export default function ArsipPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Gunakan tipe data ArsipData[]
  const [dataArsip, setDataArsip] = useState<ArsipData[]>([]);
  const [filteredData, setFilteredData] = useState<ArsipData[]>([]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Cek User
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'sdm') {
        alert('Akses Ditolak');
        router.replace('/dashboard');
        return;
      }
      setUser(parsedUser);
      fetchArsip(parsedUser.email, selectedYear);
    }
  }, [router, selectedYear]);

  // 2. Fetch Data
  const fetchArsip = async (email: string, year: number) => {
    setLoading(true);
    try {
      const result = await api.getArsip(email, year);
      setDataArsip(result);
    } catch (error) {
      console.error(error);
      setDataArsip([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Filter Data
  useEffect(() => {
    let result = dataArsip;

    if (selectedMonth !== 'all') {
      result = result.filter(item => {
        const date = new Date(item.tanggal); // ✅ Pakai 'item.tanggal'
        return date.getMonth() === parseInt(selectedMonth);
      });
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.user_name.toLowerCase().includes(lower) || // ✅ Pakai 'item.user_name'
        item.judul.toLowerCase().includes(lower)
      );
    }

    setFilteredData(result);
  }, [dataArsip, selectedMonth, searchQuery]);

  // 4. ✅ FUNGSI EXPORT EXCEL (.xlsx) YANG BARU
  const handleExport = () => {
    if (filteredData.length === 0) return alert('Tidak ada data');

    const dataToExport = filteredData.map(item => ({
      ID: item.id,
      'Nama Pegawai': item.user_name, // ✅ Mapping key
      'NIP': item.employee_nip || '-',
      'Tanggal Laporan': item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '',
      'Judul': item.judul,
      'Deskripsi': item.deskripsi,
      'Link File': item.drive_link || '-',
      'Status': item.status === 'sudah_dinilai' ? 'Sudah Dinilai' : 'Belum Dinilai',
      'Rating': item.rating || '-',
      'Feedback': item.feedback_note || '-',
      'Waktu Submit': item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Arsip");
    XLSX.writeFile(workbook, `Laporan_Arsip_${selectedYear}.xlsx`);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="text-teal-600" />
            Arsip Laporan (Database View)
          </h1>
          <p className="text-sm text-slate-500">Akses data mentah laporan bulanan & tahunan</p>
        </div>

        <button
          onClick={handleExport}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Download Excel (.xlsx)
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-32">
          <label className="text-xs font-bold text-slate-500 mb-1 block">Tahun</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
          >
            {[currentYear, currentYear - 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="w-full md:w-40">
          <label className="text-xs font-bold text-slate-500 mb-1 block">Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-2 bg-slate-50 border rounded-lg text-sm"
          >
            <option value="all">Semua</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-slate-500 mb-1 block">Cari</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Nama Pegawai / Judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 p-2 bg-slate-50 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-blue-600 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p><strong>Info Database:</strong> Data yang ditampilkan di sini adalah data mentah (Raw Data) sesuai struktur database.</p>
          <p className="text-xs mt-1 text-blue-600">Gunakan tombol &quot;Download Excel&quot; untuk analisa lebih lanjut menggunakan Microsoft Excel.</p>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Employee Name</th>
              <th className="px-4 py-3">Report Date</th>
              <th className="px-4 py-3">Plan Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">Data kosong</td></tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">{row.id.substring(0, 8)}...</td>
                  <td className="px-4 py-3 font-medium">{row.user_name}</td>
                  <td className="px-4 py-3">{row.tanggal ? new Date(row.tanggal).toLocaleDateString() : '-'}</td> {/* ✅ tanggal */}
                  <td className="px-4 py-3">{row.judul}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === 'sudah_dinilai'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                      {row.status === 'sudah_dinilai' ? 'Sudah Dinilai' : 'Belum Dinilai'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{row.rating || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}