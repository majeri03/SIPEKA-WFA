// filepath: e:\projects\SIPEKA-WFA\components\Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Star, BarChart3, User, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  userRole: 'pegawai' | 'atasan' | 'sdm';
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', roles: ['pegawai', 'atasan', 'sdm'] },
    { icon: FileText, label: 'Laporan', href: '/laporan', roles: ['pegawai', 'atasan', 'sdm'] },
    { icon: Star, label: 'Penilaian', href: '/penilaian', roles: ['atasan'] },
    { icon: BarChart3, label: 'Rekap', href: '/rekap', roles: ['sdm'] },
    { icon: User, label: 'Profile', href: '/profile', roles: ['pegawai', 'atasan', 'sdm'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-ios-blue)' }}>
          SIPEKA
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-ios-gray-600)' }}>
          Sistem Pelaporan Kinerja
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-[16px] transition-all ${
                isActive
                  ? 'text-white shadow-ios'
                  : 'hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--color-ios-blue)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-ios-gray-600)',
              }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-[16px] text-red-600 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}