export interface User {
  id: string;
  name: string;
  nip: string;
  email: string;
  role: 'pegawai' | 'atasan' | 'sdm';
  position: string;
  unit: string;
  supervisor_email: string;
  is_active: boolean;
  created_at: string;
}

export interface Laporan {
  id: string;
  employee_email: string;
  employee_name: string;
  employee_nip: string;
  supervisor_email: string;
  plan_title: string;
  daily_description: string;
  output_result: string;
  report_date: string;
  drive_link: string;
  rating_label: string;
  rating_score: number;
  feedback_note: string;
  rated_by: string;
  rated_at: string;
  status: 'submitted' | 'reviewed';
  created_at: string;
}

export interface DashboardStats {
  totalLaporan: number;
  sudahDinilai: number;
  belumDinilai: number;
  rataRating: number;
}

export interface RatingData {
  rating_label: string;
  rating_score: number;
  feedback_note: string;
  rated_by: string;
}