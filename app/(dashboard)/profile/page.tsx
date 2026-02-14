'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';
import { 
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Shield,
  Edit2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Clock,
  FileText,
  LogIn,
  Loader2,
  Camera,
  CheckCircle
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Activity Log
  const [activityLog, setActivityLog] = useState<any[]>([]);
  
  // Edit Profile Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: 'L' as 'L' | 'P',
  });

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || '',
        birth_date: parsedUser.birth_date || '',
        gender: parsedUser.gender || 'L',
      });
      loadActivityLog();
    }
  }, []);

  const loadActivityLog = async () => {
    try {
      const logs = await api.getActivityLog();
      setActivityLog(logs);
    } catch (error) {
      console.error('Error loading activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = await api.updateProfile({
        ...user,
        ...formData,
      });

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setShowPasswordModal(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Password berhasil diubah!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Gagal mengubah password. Pastikan password lama benar.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={48} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* Header Card */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-4xl font-bold">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white text-teal-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-teal-50">
              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                <span className="text-sm">{user.position}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                <span className="text-sm">{user.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span className="text-sm font-medium px-3 py-1 bg-white/20 rounded-full">
                  {user.role === 'pegawai' ? 'Pegawai' : 
                   user.role === 'supervisor' ? 'Supervisor' : 
                   user.role === 'sdm' ? 'SDM' : 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-600 rounded-xl font-medium hover:bg-white/90 transition-colors"
                >
                  <Edit2 size={18} />
                  Edit Profil
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
                >
                  <Lock size={18} />
                  Ubah Password
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-teal-600 rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      birth_date: user.birth_date || '',
                      gender: user.gender || 'L',
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Informasi Pribadi */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Informasi Pribadi</h3>
            
            <div className="space-y-4">
              {/* Nama Lengkap */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <UserIcon size={20} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Nama Lengkap
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">{user.name}</p>
                  )}
                </div>
              </div>

              {/* NIP */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    NIP
                  </label>
                  <p className="text-slate-800 font-medium">{user.nip}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <p className="text-slate-800 font-medium">{user.email}</p>
                </div>
              </div>

              {/* No. Telepon */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    No. Telepon
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">{user.phone || '-'}</p>
                  )}
                </div>
              </div>

              {/* Tanggal Lahir */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Tanggal Lahir
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">{user.birth_date || '-'}</p>
                  )}
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <UserIcon size={20} className="text-pink-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Jenis Kelamin
                  </label>
                  {editMode ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  ) : (
                    <p className="text-slate-800 font-medium">
                      {user.gender === 'L' ? 'Laki-laki' : user.gender === 'P' ? 'Perempuan' : '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Alamat */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Alamat
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Alamat lengkap..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium">{user.address || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Activity Log */}
        <div className="space-y-6">
          
          {/* Informasi Jabatan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Informasi Jabatan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Jabatan
                </label>
                <p className="text-slate-800 font-medium">{user.position}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Unit Kerja
                </label>
                <p className="text-slate-800 font-medium">{user.unit}</p>
              </div>

              {user.supervisor_email && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Atasan Langsung
                  </label>
                  <p className="text-slate-800 font-medium">{user.supervisor_email}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Status
                </label>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <CheckCircle size={14} />
                  Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800">Aktivitas Terakhir</h3>
            </div>
            
            <div className="space-y-4">
              {activityLog.slice(0, 5).map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {log.action === 'Login' ? (
                      <LogIn size={16} className="text-slate-600" />
                    ) : (
                      <FileText size={16} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{log.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODAL: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Ubah Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              
              {/* Password Lama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password Lama <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    required
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter</p>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {changingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Menyimpan...
                    </span>
                  ) : 'Simpan Password'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}