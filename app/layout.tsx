import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPEKA - Sistem Pelaporan Kinerja",
  description: "Sistem Pelaporan Kinerja Pegawai Modern",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}