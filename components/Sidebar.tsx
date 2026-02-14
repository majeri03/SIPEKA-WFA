'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  Menu,
  Users
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface User {
  name: string;
  role: string;
  position: string;
  photo_url?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ FIX: State user dengan proper initialization
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load user dari localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Sidebar loaded user:', parsedUser);
          setUser(parsedUser);
        } else {
          console.log('⚠️ No user in localStorage');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const menuItems = [
    // SEMUA bisa lihat Dashboard (tapi isinya beda nanti)
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['sdm', 'supervisor', 'pegawai']
    },

    // PEGAWAI: Input Laporan
    // SUPERVISOR: Bisa lihat riwayat laporan bawahan (opsional, tapi biasanya di menu Penilaian)
    // SDM: Tidak perlu input laporan kerja teknis
    {
      href: '/laporan',
      label: 'Laporan Kerja',
      icon: FileText,
      roles: ['pegawai'] // Khusus Pegawai yang input
    },

    // SUPERVISOR: Penilaian (Approval/Rating)
    {
      href: '/penilaian',
      label: 'Penilaian Tim',
      icon: ClipboardCheck,
      roles: ['supervisor'] // Khusus Supervisor
    },

    // SDM: Rekap Data Global
    {
      href: '/rekap',
      label: 'Rekap & Monitor',
      icon: BarChart3,
      roles: ['sdm'] // Khusus SDM
    },

    // SDM: Manajemen User
    {
      href: '/pegawai',
      label: 'Data Pegawai',
      icon: Users,
      roles: ['sdm'] // Khusus SDM
    },

    // SEMUA: Profil
    {
      href: '/profile',
      label: 'Profil',
      icon: User,
      roles: ['sdm', 'supervisor', 'pegawai']
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      sessionStorage.clear(); // ✅ Clear cache juga
      console.log('✅ Logout berhasil');
      router.push('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      alert('Gagal logout. Silakan coba lagi.');
    }
  };

  // ✅ Show loading state
  if (isLoading) {
    return (
      <div className="w-64 bg-linear-to-b from-teal-600 to-emerald-600 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // ✅ Show fallback jika user null
  if (!user) {
    return (
      <div className="w-64 bg-linear-to-b from-teal-600 to-emerald-600 text-white flex items-center justify-center">
        <p className="text-sm">Loading user...</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-linear-to-b from-teal-600 to-emerald-600 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">SIPEKA</h1>
                <p className="text-xs text-white/80">Sistem Pelaporan Kinerja</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold">{user.name.charAt(0)}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-white/80 truncate">{user.position}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                  {user.role.toUpperCase() === 'SDM' ? 'Tim SDM' : user.role.toUpperCase() === 'SUPERVISOR' ? 'Supervisor' : 'Pegawai'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-white text-teal-600 font-semibold'
                  : 'hover:bg-white/10'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? 'justify-center' : ''
              }`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-teal-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-linear-to-b from-teal-600 to-emerald-600 text-white flex flex-col">
            {/* Same content as desktop sidebar */}
            <div className="p-4 flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">SIPEKA</h1>
                  <p className="text-xs text-white/80">Sistem Pelaporan Kinerja</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-white/80 truncate">{user.position}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded text-xs">
                    {user.role.toUpperCase() === 'SDM' ? 'Tim SDM' : user.role.toUpperCase() === 'SUPERVISOR' ? 'Supervisor' : 'Pegawai'}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.filter(item => item.roles.includes(user.role)).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-white text-teal-600 font-semibold'
                      : 'hover:bg-white/10'
                      }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}