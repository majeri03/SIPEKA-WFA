'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { Mail, Lock, Loader2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { loginOrRegister } from '@/lib/firebase-helper';

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
      console.log('🔐 Starting login process...');
      
      // ✅ Login or register user
      const result = await loginOrRegister(email, password);

      if (!result.user.email) {
        throw new Error('Email tidak ditemukan');
      }

      // ✅ Get full user data from spreadsheet
      const userData = await api.getUser(result.user.email);
      console.log('✅ User Data:', userData);

      // ✅ Check if user is active
      if (!userData.is_active) {
        setError('Akun tidak aktif. Hubungi SDM.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      // ✅ Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User saved to localStorage');

      // ✅ Check if password needs to be changed
      if (result.needPasswordChange) {
        localStorage.setItem('mustChangePassword', 'true');
        alert('Login berhasil! Anda wajib mengganti password NIP di menu Profile.');
      }

      // ✅ Redirect to dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error('❌ Login error:', err);

      if (err instanceof Error) {
        if (err.message.includes('tidak terdaftar')) {
          setError('Email tidak terdaftar dalam sistem. Hubungi SDM.');
        } else if (err.message.includes('Password salah')) {
          setError('Password salah.');
        } else if (err.message.includes('too-many-requests')) {
          setError('Terlalu banyak percobaan. Coba lagi nanti.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Terjadi kesalahan. Coba lagi.');
      }

      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      if (!result.user.email) {
        throw new Error('Email tidak ditemukan dari Google');
      }

      // ✅ Check if user exists in spreadsheet
      const checkResult = await api.checkUserExists(result.user.email);

      if (!checkResult.exists) {
        throw new Error('Email Google Anda tidak terdaftar dalam sistem. Hubungi SDM.');
      }

      // ✅ Get full user data
      const userData = await api.getUser(result.user.email);
      console.log('✅ Google User Data:', userData);

      // ✅ Check if active
      if (!userData.is_active) {
        setError('Akun tidak aktif. Hubungi SDM.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      // ✅ Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User saved to localStorage');

      router.push('/dashboard');

    } catch (err) {
      console.error('❌ Google login error:', err);

      if (err instanceof Error) {
        if (err.message.includes('tidak terdaftar')) {
          setError('Email Google Anda tidak terdaftar dalam sistem. Hubungi SDM.');
        } else if (err.message.includes('popup-closed')) {
          setError('Login dibatalkan.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Login dengan Google gagal.');
      }

      await auth.signOut();
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
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setLoading(false);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Gagal mengirim email reset. Periksa email Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-24">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.15),transparent_60%)]" />

      <div className="relative w-full max-w-md my-10">

        {/* Floating Avatar */}
        <div className="absolute -top-14 md:-top-20 left-1/2 -translate-x-1/2">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-500 shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-8 ring-slate-900">
            <User size={60} className="text-white" strokeWidth={2.5} />
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

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-red-400 text-sm animate-fade-up">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {resetEmailSent && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-3 text-emerald-400 text-sm animate-fade-up">
              <CheckCircle size={18} className="shrink-0" />
              <span>Email reset terkirim! Cek inbox Anda.</span>
            </div>
          )}

          {!showForgotPassword ? (
            <div className="space-y-6">
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">

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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setResetEmailSent(false);
                    }}
                    className="text-xs text-slate-400 hover:text-teal-400 transition"
                  >
                    Lupa Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-teal-500 py-4 font-semibold text-white shadow-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-slate-400">Atau</span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full rounded-xl bg-white py-4 font-semibold text-slate-700 shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Masuk dengan Google
              </button>

            </div>
          ) : (
            // Forgot Password Form
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
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-500 py-4 font-semibold text-white shadow-lg hover:bg-teal-600 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="mx-auto animate-spin" />
                ) : (
                  'Kirim Link Reset'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setResetEmailSent(false);
                }}
                className="w-full text-sm text-slate-400 hover:text-white transition"
              >
                Kembali ke Login
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