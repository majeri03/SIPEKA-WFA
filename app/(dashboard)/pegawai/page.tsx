'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Pakai router bawaan Next.js
import { api } from '@/lib/api'; // Import instance API class Anda
import { User } from '@/types'; // Import tipe User Anda

export default function PegawaiPage() {
  const router = useRouter();
  
  // State User yang sedang login (Admin/SDM)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State Data Pegawai
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<Partial<User>>({});

  // 1. Cek Login (Sama seperti di dashboard/page.tsx Anda)
  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        if (parsedUser && parsedUser.email) {
          setCurrentUser(parsedUser);
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  // 2. Fetch Data Pegawai
  const fetchUsers = useCallback(async () => {
    if (!currentUser?.email) return;

    setLoading(true);
    try {
      // Panggil method baru di class API
      const data = await api.getAllUsers(currentUser.email);
      // Backend GAS mengembalikan array user, kita simpan ke state
      setUsers(data);
    } catch (error) {
      console.error("Gagal load pegawai:", error);
      alert("Gagal memuat data pegawai. Pastikan Anda memiliki akses SDM.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Trigger fetch saat currentUser sudah siap
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // 3. Handle Submit (Add/Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    // Mulai Loading
    setIsSubmitting(true);

    const payload = modalMode === 'add' 
      ? formData 
      : { targetEmail: formData.email, updates: formData }; 

    try {
      // Update the type to include optional 'status'
      type ManageUserResult = { success: boolean; message: string; status?: string };
      const result: ManageUserResult = await api.manageUser(
        currentUser.email, 
        modalMode, 
        payload as Record<string, unknown>
      );
      
      if (result.success || result.status === 'success') {
        
        setIsModalOpen(false); 
        setFormData({}); 
        await fetchUsers(); 
        
        alert(modalMode === 'add' ? 'Pegawai berhasil ditambahkan!' : 'Data berhasil diperbarui!');
      } else {
        alert('Gagal: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      // Matikan Loading (Wajib di finally agar selalu mati walau error)
      setIsSubmitting(false);
    }
  };

  // 4. Handle Soft Delete
  const handleDelete = async (email: string) => {
    if (!confirm('Yakin ingin menonaktifkan pegawai ini?')) return;
    if (!currentUser?.email) return;

    try {
      await api.manageUser(currentUser.email, 'delete', { targetEmail: email });
      fetchUsers(); // Refresh tanpa alert agar cepat
    } catch (error) {
      console.error(error);
      alert("Gagal menonaktifkan user.");
    }
  };

  // --- Helper Form ---
  const openEdit = (user: User) => {
    setFormData(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setFormData({ role: 'pegawai', is_active: true });
    setModalMode('add');
    setIsModalOpen(true);
  };

  if (!currentUser) return null; // Tunggu auth check

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Manajemen Pegawai</h1>
           <p className="text-slate-500 text-sm">Kelola data karyawan dan hak akses aplikasi</p>
        </div>
        
        {/* Tombol Tambah hanya jika SDM */}
        {currentUser.role === 'sdm' && (
            <button 
              onClick={openAdd}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-2"
            >
              + Tambah Pegawai
            </button>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-6 py-4">Posisi & Unit</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Memuat data...
                    </td>
                 </tr>
              ) : users.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Belum ada data pegawai.
                    </td>
                 </tr>
              ) : (
                users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-slate-500 text-xs">NIP: {user.nip}</div>
                        <div className="text-slate-400 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-slate-800">{user.position}</div>
                        <div className="text-xs text-slate-500">{user.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'sdm' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {user.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {user.is_active ? 'Aktif' : 'Non-Aktif'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button 
                        onClick={() => openEdit(user)}
                        className="text-teal-600 hover:text-teal-800 font-medium text-xs border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition"
                        >
                        Edit
                        </button>
                        {user.is_active && (
                        <button 
                            onClick={() => handleDelete(user.email)}
                            className="text-rose-500 hover:text-rose-700 font-medium text-xs border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
                        >
                            Nonaktif
                        </button>
                        )}
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6 text-slate-800">
              {modalMode === 'add' ? 'Tambah Pegawai Baru' : 'Edit Data Pegawai'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">NIP</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    value={formData.nip || ''}
                    onChange={e => setFormData({...formData, nip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email (Google Account)</label>
                <input required type="email" 
                  disabled={modalMode === 'edit'} 
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Jabatan</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    value={formData.position || ''}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Unit Kerja</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    value={formData.unit || ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Role Aplikasi</label>
                  <select className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    value={formData.role || 'pegawai'}
                    onChange={e => setFormData({...formData, role: e.target.value as User['role']})}
                  >
                    <option value="pegawai">Pegawai</option>
                    <option value="supervisor">Supervisor (Atasan)</option>
                    <option value="sdm">SDM (Admin)</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Supervisor Email</label>
                  <input type="email" className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    placeholder="email.atasan@kantor.com"
                    value={formData.supervisor_email || ''}
                    onChange={e => setFormData({...formData, supervisor_email: e.target.value})}
                  />
                  {/* Tambahkan keterangan kecil biar user paham */}
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Kosongkan jika ini akun Supervisor/SDM
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting} // Disable saat loading
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition text-sm disabled:opacity-50">
                  Batal
                </button>
                
                <button type="submit" 
                  disabled={isSubmitting} // Disable saat loading
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium shadow-lg shadow-teal-600/20 transition transform active:scale-95 text-sm disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      {/* Spinner Sederhana */}
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}