import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, BarChart3, Star, TrendingUp, Users, FolderOpen, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative">
        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logosipeka.png"
                alt="Logo SIPEKA"
                width={100}
                height={100}
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">SIPEKA</h1>
                <p className="text-xs text-slate-400">Sistem Pelaporan Kinerja</p>
              </div>
            </div>

            <Link
              href="/login"
              className="px-5 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors text-sm"
            >
              Masuk
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium mb-6">
                <CheckCircle size={16} />
                Sistem Modern & Terintegrasi
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Kelola Kinerja <br />
                <span className="bg-linear-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                  Pegawai Modern
                </span>
              </h1>

              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Platform digital untuk pelaporan dan monitoring kinerja pegawai secara real-time dengan sistem yang mudah dan efisien.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
                >
                  Mulai Sekarang
                  <ArrowRight size={20} />
                </Link>

                <a
                  href="#fitur"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/10"
                >
                  Lihat Fitur
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">100%</div>
                  <div className="text-sm text-slate-400">Digital</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">Real-time</div>
                  <div className="text-sm text-slate-400">Update</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">Aman</div>
                  <div className="text-sm text-slate-400">& Terpercaya</div>
                </div>
              </div>
            </div>

            {/* Right Image/Logo */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-teal-500/20 blur-[100px] rounded-full" />

                {/* Logo Container */}
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl">
                  <Image
                    src="/logosipeka.png"
                    alt="Logo SIPEKA"
                    width={300}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                    priority
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-teal-500 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse delay-75" />
              </div>
            </div>

          </div>
        </div>

        {/* Features Section */}
        <div id="fitur" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-slate-400 text-lg">
              Solusi lengkap untuk manajemen kinerja pegawai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Pelaporan Real-time',
                desc: 'Input dan pantau laporan kinerja secara langsung',
                icon: BarChart3
              },
              {
                title: 'Penilaian Digital',
                desc: 'Sistem penilaian terstruktur dan transparan',
                icon: Star
              },
              {
                title: 'Rekap Otomatis',
                desc: 'Generate laporan dan rekap dengan mudah',
                icon: TrendingUp
              },
              {
                title: 'Multi-User',
                desc: 'Akses berbasis role untuk berbagai pengguna',
                icon: Users
              },
              {
                title: 'Arsip Terpusat',
                desc: 'Simpan dan kelola semua dokumen di satu tempat',
                icon: FolderOpen
              },
              {
                title: 'Keamanan Tinggi',
                desc: 'Data terenkripsi dan sistem keamanan berlapis',
                icon: Lock
              }
            ].map((feature, i) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="mb-4">
                    <IconComponent size={48} className="text-teal-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="bg-linear-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Memulai?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan sistem pelaporan kinerja modern dan tingkatkan produktivitas pegawai Anda.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg"
            >
              Masuk ke Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logosipeka.png"
                alt="Logo SIPEKA"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <span className="text-slate-400 text-sm">
                © 2026 SIPEKA. Developed by{" "}
                <a
                  href="https://jeri-artadigital.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-semibold hover:text-teal-400 transition-colors"
                >
                  JERI ARTA DIGITAL
                </a>
              </span>
            </div>
            <div className="text-slate-500 text-sm">
              Hubungi <span className="text-white font-semibold">SDM</span> untuk bantuan
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}