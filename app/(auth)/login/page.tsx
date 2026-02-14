'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { Mail, Lock, Loader2, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await api.getUser(userCredential.user.email || '');

      if (!userData || !userData.is_active) {
        setError('Akun tidak valid atau tidak aktif.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
    } catch {
      setError('Email atau password salah.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan email terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch {
      setError('Gagal mengirim email reset.');
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-24">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.15),transparent_60%)]" />

      <div className="relative w-full max-w-md my-10">

        {/* Floating Avatar */}
        <div className="absolute -top-14 md:-top-20 left-1/2 -translate-x-1/2">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-500 shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-8 ring-slate-900">
            <User size={60} className="text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="mt-16 md:mt-24 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl px-8 md:px-10 py-10 md:py-12 animate-fade-up">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              SIPEKA
            </h1>
            <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
              Sistem Pelaporan Kinerja Pegawai
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {resetEmailSent && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-3 text-emerald-400 text-sm">
              <CheckCircle size={18} />
              Email reset terkirim!
            </div>
          )}

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Email */}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none transition"
                  required
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-slate-400 hover:text-teal-400 transition"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-500 py-4 font-semibold text-white shadow-lg hover:bg-teal-600 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Masuk'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-500 py-4 font-semibold text-white shadow-lg hover:bg-teal-600 transition"
              >
                Kirim Link Reset
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-sm text-slate-400 hover:text-white transition"
              >
                Kembali
              </button>

            </form>
          )}

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            Hubungi <span className="text-white font-semibold">SDM</span> untuk akses akun
          </div>

        </div>
      </div>
    </div>
  );
}