'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MonthlyStatsChart, RatingTrendChart, UnitDistributionChart } from '@/components/ChartComponents';
import {
    Download,
    FileText,
    Users,
    TrendingUp,
    Loader2,
    BarChart3,
    Filter,
    Award,
    ClipboardCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
export default function RekapPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{
        totalPegawai: number;
        totalLaporan: number;
        rataKehadiran: number;
        laporanBulanIni: number;
    } | null>(null);

    const [pegawaiData, setPegawaiData] = useState<Array<{
        name: string;
        unit: string;
        total: number;
        dinilai: number;
        rata: number;
    }>>([]);

    const [monthlyData, setMonthlyData] = useState<Array<{
        bulan: string;
        laporan: number;
        dinilai: number;
        rata: number;
    }>>([]);
    const [unitData, setUnitData] = useState<Array<{
        name: string;
        value: number;
    }>>([]);
    const [filterPeriode, setFilterPeriode] = useState('7hari');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            loadData();
        }
    }, []);

    const loadData = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return;

            const user = JSON.parse(userData);

            const [statsData, pegawaiList, monthlyStats] = await Promise.all([
                api.getRekapStats(user.email),
                api.getRekapByPegawai(user.email),
                api.getRekapByBulan(user.email),
            ]);

            setStats(statsData);
            setPegawaiData(pegawaiList);
            setMonthlyData(monthlyStats);

            // ✅ Generate unit distribution dari pegawaiData
            const unitMap = new Map<string, number>();
            pegawaiList.forEach(p => {
                unitMap.set(p.unit, (unitMap.get(p.unit) || 0) + 1);
            });

            const unitDistribution = Array.from(unitMap.entries()).map(([name, value]) => ({
                name,
                value
            }));

            setUnitData(unitDistribution);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!pegawaiData.length) {
            alert('Belum ada data pegawai untuk diekspor.');
            return;
        }

        try {
            // 1. Buat Workbook Baru
            const workbook = XLSX.utils.book_new();
            const timestamp = new Date().toISOString().split('T')[0];

            // --- SHEET 1: RINGKASAN GLOBAL ---
            // Siapkan data ringkasan dari state 'stats'
            const summaryData = [
                ["LAPORAN REKAPITULASI KINERJA PEGAWAI (SIPEKA)"],
                ["Tanggal Download", timestamp],
                [""],
                ["RINGKASAN GLOBAL"],
                ["Total Pegawai", stats?.totalPegawai || 0],
                ["Total Laporan", stats?.totalLaporan || 0],
                ["Laporan Bulan Ini", stats?.laporanBulanIni || 0],
                ["Rata-rata Kehadiran", `${stats?.rataKehadiran || 0}%`],
                [""],
                ["Note:", "Data ini di-generate otomatis oleh sistem SIPEKA"]
            ];
            
            const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, wsSummary, "Ringkasan Global");

            // --- SHEET 2: DETAIL PEGAWAI ---
            // Mapping data pegawai agar rapi di Excel
            const pegawaiFormatted = pegawaiData.map((p, index) => ({
                "No": index + 1,
                "Nama Pegawai": p.name,
                "Unit Kerja": p.unit,
                "Total Laporan": p.total,
                "Sudah Dinilai": p.dinilai,
                "Belum Dinilai": p.total - p.dinilai,
                "Rata-rata Rating": p.rata ? Number(p.rata).toFixed(2) : "0.00",
                "Predikat": p.rata >= 4.5 ? 'Sangat Baik' :
                           p.rata >= 4.0 ? 'Baik' :
                           p.rata >= 3.0 ? 'Cukup' : 'Kurang'
            }));

            const wsPegawai = XLSX.utils.json_to_sheet(pegawaiFormatted);

            // Atur lebar kolom agar rapi
            const wscols = [
                { wch: 5 },  // No
                { wch: 30 }, // Nama
                { wch: 25 }, // Unit
                { wch: 15 }, // Total
                { wch: 15 }, // Dinilai
                { wch: 15 }, // Belum Dinilai
                { wch: 15 }, // Rata-rata
                { wch: 15 }  // Predikat
            ];
            wsPegawai['!cols'] = wscols;

            XLSX.utils.book_append_sheet(workbook, wsPegawai, "Data Pegawai");

            // --- SHEET 3: STATISTIK BULANAN ---
            if (monthlyData.length > 0) {
                const bulanFormatted = monthlyData.map(m => ({
                    "Bulan": m.bulan,
                    "Jumlah Laporan": m.laporan,
                    "Jumlah Dinilai": m.dinilai,
                    "Rata-rata Rating": m.rata
                }));
                const wsBulanan = XLSX.utils.json_to_sheet(bulanFormatted);
                XLSX.utils.book_append_sheet(workbook, wsBulanan, "Statistik Bulanan");
            }

            // 4. Download File
            XLSX.writeFile(workbook, `Rekap_Kinerja_SIPEKA_${timestamp}.xlsx`);

        } catch (error) {
            console.error('Gagal export excel:', error);
            alert('Terjadi kesalahan saat mengunduh file Excel.');
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

                {/* Filter Periode */}
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={filterPeriode}
                        onChange={(e) => setFilterPeriode(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                    >
                        <option value="7hari">7 Hari Terakhir</option>
                        <option value="30hari">30 Hari Terakhir</option>
                        <option value="bulanini">Bulan Ini</option>
                        <option value="tahunini">Tahun Ini</option>
                    </select>
                </div>

                {/* Button Export */}
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <Download size={18} />
                    Export Excel
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                            <Users size={20} className="text-teal-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.totalPegawai ?? 0}</p>
                            <p className="text-xs text-slate-500">Total Pegawai</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.totalLaporan ?? 0}</p>
                            <p className="text-xs text-slate-500">Total Laporan</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <ClipboardCheck size={20} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.laporanBulanIni ?? 0}</p>
                            <p className="text-xs text-slate-500">Bulan Ini</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <TrendingUp size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.rataKehadiran ?? 0}%</p>
                            <p className="text-xs text-slate-500">Kehadiran WFA</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Statistik Bulanan */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 size={24} className="text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-800">Statistik Laporan Bulanan</h3>
                    </div>
                    <MonthlyStatsChart data={monthlyData} />
                </div>

                {/* Trend Rating */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp size={24} className="text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">Trend Penilaian Kinerja</h3>
                    </div>
                    <RatingTrendChart data={monthlyData} />
                </div>

            </div>

            {/* Distribusi per Unit */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Award size={24} className="text-teal-600" />
                    <h3 className="text-lg font-bold text-slate-800">Distribusi Pegawai per Unit Kerja</h3>
                </div>
                <UnitDistributionChart data={unitData} />
            </div>

            {/* Tabel Rekap per Pegawai */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Rekap Kinerja per Pegawai</h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Nama Pegawai
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Unit Kerja
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Total Laporan
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Sudah Dinilai
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Rata-rata
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Predikat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {pegawaiData.map((pegawai, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
                                                {pegawai.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-800">
                                                {pegawai.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{pegawai.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-slate-800">{pegawai.total}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-slate-600">{pegawai.dinilai}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Award size={16} className="text-amber-500" />
                                            <span className="text-sm font-bold text-slate-800">
                                                {pegawai.rata.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${pegawai.rata >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                                            pegawai.rata >= 4.0 ? 'bg-blue-100 text-blue-700' :
                                                pegawai.rata >= 3.5 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {pegawai.rata >= 4.5 ? 'Sangat Baik' :
                                                pegawai.rata >= 4.0 ? 'Baik' :
                                                    pegawai.rata >= 3.5 ? 'Cukup' : 'Kurang'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-slate-200">
                    {pegawaiData.map((pegawai, index) => (
                        <div key={index} className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                                    {pegawai.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{pegawai.name}</p>
                                    <p className="text-xs text-slate-500">{pegawai.unit}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs">Total Laporan</p>
                                    <p className="font-semibold text-slate-800">{pegawai.total}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Sudah Dinilai</p>
                                    <p className="font-semibold text-slate-800">{pegawai.dinilai}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Rata-rata</p>
                                    <p className="font-semibold text-slate-800">{pegawai.rata.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Predikat</p>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pegawai.rata >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                                        pegawai.rata >= 4.0 ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {pegawai.rata >= 4.5 ? 'Sangat Baik' :
                                            pegawai.rata >= 4.0 ? 'Baik' : 'Cukup'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}