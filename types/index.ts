export interface User {
  phone: string;
  id: string;
  email: string;
  name: string;
  nip: string;
  position: string;
  unit: string;
  role: 'pegawai' | 'supervisor' | 'sdm' | 'admin';
  supervisor_email?: string;
  is_active: boolean;
  created_at: string;

  hone?: string;
  address?: string;
  birth_date?: string;
  gender?: 'L' | 'P';
  photo_url?: string;
}

export interface Laporan {
  id: string;
  user_id: string;
  user_name?: string;
  tanggal: string;
  judul: string;
  deskripsi: string;
  file_url?: string;
  status: 'belum_dinilai' | 'sudah_dinilai';
  rating?: number;
  komentar?: string;
  created_at: string;
}

export interface Review {
  id: string;
  laporan_id: string;
  reviewer_email: string;
  rating: number;
  komentar: string;
  created_at: string;
}

export interface DashboardStats {
  totalLaporan: number;
  sudahDinilai: number;
  belumDinilai: number;
  rataRating: number;
}