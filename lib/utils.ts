import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMMM yyyy', { locale: id });
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy HH:mm', { locale: id });
}

export function getRatingColor(score: number): string {
  if (score >= 4.5) return 'var(--color-ios-green)';
  if (score >= 3.5) return 'var(--color-ios-blue)';
  if (score >= 2.5) return 'var(--color-ios-yellow)';
  return 'var(--color-ios-red)';
}

export function getRatingLabel(score: number): string {
  if (score === 5) return 'Sangat Baik';
  if (score === 4) return 'Baik';
  if (score === 3) return 'Butuh Perbaikan';
  if (score === 2) return 'Kurang';
  if (score === 1) return 'Sangat Kurang';
  return 'Belum Dinilai';
}

export function getStatusBadge(status: string): string {
  return status === 'reviewed' ? 'badge-success' : 'badge-warning';
}

export function getStatusLabel(status: string): string {
  return status === 'reviewed' ? 'Sudah Dinilai' : 'Belum Dinilai';
}

export function validateDriveLink(link: string): boolean {
  return link.includes('drive.google.com') && link.length > 0;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}