'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { auth } from '@/lib/firebase';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setTimeout(() => {
        setUser(JSON.parse(userData));
      }, 0);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['pegawai', 'supervisor', 'sdm', 'admin'],
    },
    {
      label: 'Laporan Saya',
      href: '/laporan',
      icon: FileText,
      roles: ['pegawai', 'supervisor', 'sdm', 'admin'],
    },
    {
      label: 'Penilaian',
      href: '/penilaian',
      icon: ClipboardCheck,
      roles: ['supervisor', 'sdm', 'admin'],
    },
    {
      label: 'Rekap Data',
      href: '/rekap',
      icon: BarChart3,
      roles: ['sdm', 'admin'],
    },
    {
      label: 'Profil',
      href: '/profile',
      icon: UserCircle,
      roles: ['pegawai', 'supervisor', 'sdm', 'admin'],
    },
  ];

  // 🔥 FIX: Cek user dulu sebelum filter
  const filteredMenu = user 
    ? menuItems.filter(item => item.roles.includes(user.role))
    : [];

  if (!user) {
    return null; // atau loading skeleton
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-teal-500 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-slate-200
          flex flex-col shadow-xl lg:shadow-none
          transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-linear-to-brrom-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">SIPEKA</h1>
              <p className="text-xs text-slate-500">Sistem Pelaporan Kinerja</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white font-semibold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.position}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-teal-700 bg-teal-100 rounded-full">
                {user.role === 'pegawai' ? 'Pegawai' : 
                 user.role === 'supervisor' ? 'Supervisor' :
                 user.role === 'sdm' ? 'SDM' : 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-linear-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30' 
                        : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                      }
                    `}
                  >
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}
                    />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}