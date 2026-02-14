import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPEKA - Sistem Pelaporan Kinerja",
  description: "Sistem Pelaporan Kinerja Pegawai Modern",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased bg-slate-950">
        {children}
        <div id="modal-root" className="relative z-9999"></div>
      </body>
    </html>
  );
}