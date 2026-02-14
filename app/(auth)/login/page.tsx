'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { Mail, Lock, AlertCircle, Loader2, User, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = await api.getUser(user.email || '');

      if (!userData) {
        setError('Email tidak terdaftar dalam sistem. Hubungi SDM.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (!userData.is_active) {
        setError('Akun Anda tidak aktif. Hubungi SDM.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if (err.message.includes('invalid-credential') || err.message.includes('wrong-password')) {
          setError('Email atau password salah');
        } else if (err.message.includes('user-not-found')) {
          setError('Email tidak terdaftar');
        } else {
          setError('Terjadi kesalahan. Coba lagi.');
        }
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Masukkan email Anda terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError('Gagal mengirim email reset password. Periksa email Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-teal-300 via-teal-500 to-teal-700">
      
      <div className="w-full max-w-md space-y-8">
        {/* AVATAR */}
        <div className="flex justify-center animate-fade-in">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-slate-800 to-blue-900 shadow-xl ring-4 ring-white/20">
            <User size={56} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* CARD LOGIN */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-teal-600/90 backdrop-blur-md shadow-2xl animate-fade-in ring-1 ring-white/20">
          
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">SIPEKA</h1>
            <p className="text-sm text-teal-100 font-medium">Sistem Pelaporan Kinerja Pegawai</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-500/90 shadow-lg animate-fade-in">
              <AlertCircle size={18} className="text-white shrink-0 mt-0.5" />
              <p className="text-sm text-white font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {resetEmailSent && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-500/90 shadow-lg animate-fade-in">
              <CheckCircle size={18} className="text-white shrink-0 mt-0.5" />
              <p className="text-sm text-white font-medium">Email reset terkirim! Cek inbox Anda.</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Input Email */}
              <div className="relative group">
                <Mail size={20} className="absolute left-0 top-3.5 text-teal-200 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ID"
                  className="w-full py-3 pl-8 pr-3 text-white bg-transparent border-b-2 border-teal-300/50 outline-none placeholder:text-teal-200/70 focus:border-white transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Input Password */}
              <div className="relative group">
                <Lock size={20} className="absolute left-0 top-3.5 text-teal-200 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full py-3 pl-8 pr-3 text-white bg-transparent border-b-2 border-teal-300/50 outline-none placeholder:text-teal-200/70 focus:border-white transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Lupa Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { 
                    setShowForgotPassword(true); 
                    setError(''); 
                    setResetEmailSent(false);
                  }}
                  className="text-xs font-semibold text-teal-100 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Lupa Password?
                </button>
              </div>

              {/* Tombol Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-bold text-white uppercase tracking-wider rounded-xl bg-gradient-to-r from-slate-800 to-blue-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    MEMPROSES...
                  </span>
                ) : 'MASUK'}
              </button>
            </form>
          ) : (
            // FORGOT PASSWORD FORM
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <p className="text-sm text-teal-100 mb-4 text-center font-medium">
                Masukkan email Anda untuk menerima link reset password
              </p>
              
              <div className="relative group">
                <Mail size={20} className="absolute left-0 top-3.5 text-teal-200 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ID"
                  className="w-full py-3 pl-8 pr-3 text-white bg-transparent border-b-2 border-teal-300/50 outline-none placeholder:text-teal-200/70 focus:border-white transition-all"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 font-bold text-white uppercase tracking-wider rounded-xl bg-gradient-to-r from-slate-800 to-blue-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    MENGIRIM...
                  </span>
                ) : 'KIRIM RESET LINK'}
              </button>

              <button
                type="button"
                onClick={() => { 
                  setShowForgotPassword(false); 
                  setError(''); 
                  setResetEmailSent(false);
                }}
                className="w-full py-3 text-sm font-medium text-teal-100 hover:text-white transition-colors"
              >
                Kembali ke Login
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center pt-6 mt-8 border-t border-teal-400/30">
            <p className="text-xs text-teal-100">
              Tidak punya akun? Hubungi <span className="font-bold text-white">SDM</span> untuk pendaftaran
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}