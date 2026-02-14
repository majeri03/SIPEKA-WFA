'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth'; // ✅ Import Firebase Auth
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Building2, 
  Save, 
  Loader2, 
  KeyRound,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nip: '',
    position: '',
    unit: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        nip: userData.nip || '',
        position: userData.position || '',
        unit: userData.unit || ''
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Panggil API updateProfile (Hanya Nama, Jabatan, Unit)
      const updatedUser = await api.updateProfile({
        email: formData.email, // Key untuk cari user
        name: formData.name,
        // position: formData.position, // Uncomment jika boleh ganti jabatan
        // unit: formData.unit          // Uncomment jika boleh ganti unit
      });

      // Update local storage & state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil. Pastikan data valid.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    const confirm = window.confirm(`Kirim link reset password ke ${user.email}?`);
    if (!confirm) return;

    try {
      await sendPasswordResetEmail(auth, user.email);
      alert(`Link reset password telah dikirim ke ${user.email}.\nSilakan cek inbox/spam email Anda.`);
    } catch (error: unknown) { // ✅ Ganti 'any' ke 'unknown'
      console.error("Reset password error:", error);
      
      // ✅ Type Assertion yang aman untuk membaca properti .code
      const firebaseError = error as { code?: string };
      
      if (firebaseError.code === 'auth/user-not-found') {
         alert('Email tidak terdaftar di sistem autentikasi.');
      } else {
         alert('Gagal mengirim email reset. Coba lagi nanti.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up pb-10">
      
      {/* Header Profile */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-linear-to-r from-teal-500 to-emerald-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-teal-600 uppercase">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-slate-800">{user?.name}</h1>
                <p className="text-slate-500 flex items-center gap-1">
                   <BadgeCheck size={16} className="text-teal-500" />
                   {user?.nip}
                </p>
              </div>
            </div>
          </div>

          {/* Form Data Diri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Email (Tidak dapat diubah)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Jabatan</label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.position}
                  disabled // Biasanya jabatan diatur admin
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Unit Kerja</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.unit}
                  disabled // Biasanya unit diatur admin
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {/* Bagian Keamanan (Password) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Keamanan Akun</h3>
            <p className="text-slate-500 mb-6">
              Kelola keamanan akun Anda. Jika Anda merasa password Anda tidak aman, silakan lakukan reset password.
            </p>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <KeyRound size={20} className="text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-700">Password Login</p>
                  <p className="text-sm text-slate-500">Terakhir diubah: -</p>
                </div>
              </div>
              
              <button 
                onClick={handleResetPassword}
                className="whitespace-nowrap px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
              >
                Kirim Email Reset Password
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-3 italic">
              *Link untuk mengubah password baru akan dikirimkan ke email <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}