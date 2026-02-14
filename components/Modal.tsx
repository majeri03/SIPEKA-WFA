// components/Modal.tsx
'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react'; // Pastikan punya icon ini, atau ganti text "X"

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Opsional: jika ingin header standar
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    // Opsional: Kunci scroll body saat modal terbuka agar background tidak ikut scroll
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Jangan render apa-apa di server-side atau jika belum open
  if (typeof window === 'undefined' || !isOpen) return null;

  // Cari elemen 'modal-root' yang kita buat di Langkah 1
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  // Konten Modal dengan Styling yang Bagus (Backdrop + Container)
  const modalContent = (
    // Backdrop Gelap (Overlay)
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Container Putih Modal */}
      {/* Catan: max-w-lg bisa diubah sesuai kebutuhan lebar modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal (Opsional, jika title ada) */}
        {(title) && (
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
                {title && <h2 className="text-xl font-bold text-slate-800">{title}</h2>}
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition text-slate-500">
                    <X size={20} />
                </button>
            </div>
        )}

        {/* Area Konten (Scrollable jika panjang) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );

  // Fungsi ajaib 'createPortal' memindahkan modalContent ke dalam modalRoot
  return createPortal(modalContent, modalRoot);
}