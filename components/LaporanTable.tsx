'use client';

import { Laporan } from '@/types';
import { FileText, Star, Clock, CheckCircle, ExternalLink, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LaporanTableProps {
  data: Laporan[];
  onViewDetail: (laporan: Laporan) => void;
}

export default function LaporanTable({ data, onViewDetail }: LaporanTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Belum ada laporan</p>
        <p className="text-slate-400 text-sm mt-2">Klik tombol Tambah Laporan untuk membuat laporan baru</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Judul Laporan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((laporan) => (
              <tr key={laporan.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600">
                    {formatDate(laporan.tanggal)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-teal-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {laporan.judul}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {laporan.deskripsi}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {laporan.status === 'sudah_dinilai' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle size={14} />
                      Sudah Dinilai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock size={14} />
                      Menunggu
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {laporan.rating ? (
                    <div className="flex items-center gap-1 mt-2 bg-amber-50 w-fit px-2 py-1 rounded-lg border border-amber-100">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        {/* ✅ PERBAIKAN DISINI */}
                        {laporan.rating && !isNaN(Number(laporan.rating))
                          ? Number(laporan.rating).toFixed(1)
                          : '0.0'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetail(laporan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      Detail
                    </button>
                    {laporan.file_url && (
                      <a
                        href={laporan.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} />
                        File
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-slate-200">
        {data.map((laporan) => (
          <div key={laporan.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <FileText size={18} className="text-teal-500 mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {laporan.judul}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {laporan.deskripsi}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(laporan.tanggal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {laporan.status === 'sudah_dinilai' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle size={12} />
                    Dinilai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Clock size={12} />
                    Menunggu
                  </span>
                )}
                {laporan.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-slate-800">
                      {laporan.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onViewDetail(laporan)}
                className="text-xs font-medium text-teal-600 hover:text-teal-700"
              >
                Detail →
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}