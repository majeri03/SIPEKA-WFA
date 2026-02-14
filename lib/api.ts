import { User, DashboardStats, Laporan, Review } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

// 🔥 MOCK DATA untuk testing
const MOCK_USERS: Record<string, User> = {
  "admin@example.com": {
    id: "user_001",
    email: "admin@example.com",
    name: "Admin SIPEKA",
    nip: "199001012020121001",
    position: "Kepala Bagian SDM",
    unit: "Bagian SDM",
    role: "sdm",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  "kirinxe00@gmail.com": {
    id: "user_002",
    email: "kirinxe00@gmail.com",
    name: "Kirin Developer",
    nip: "199505152021011002",
    position: "Staff IT",
    unit: "Divisi Teknologi",
    role: "pegawai",
    supervisor_email: "admin@example.com",
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
};

class API {
  private async fetchAPI(endpoint: string, params?: Record<string, string>) {
    // 🔥 MODE TESTING: Gunakan mock data jika Apps Script belum ready
    if (!API_BASE_URL || API_BASE_URL === "") {
      console.warn(
        "⚠️ Apps Script URL belum dikonfigurasi. Menggunakan MOCK DATA.",
      );
      return this.getMockData(endpoint, params);
    }

    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `/api/proxy?endpoint=${endpoint}&${queryParams}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error("❌ API Error:", response.status);
        // Fallback ke mock data
        return this.getMockData(endpoint, params);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Fetch Error:", error);
      // Fallback ke mock data
      return this.getMockData(endpoint, params);
    }
  }

  // 🔥 Mock Data Handler
  private async getMockData(endpoint: string, params?: Record<string, string>) {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulasi delay

    switch (endpoint) {
      case "getUser": {
        const email = params?.email || "";
        const user = MOCK_USERS[email];
        console.log("✅ Mock User Data:", user);
        return user || null;
      }

      case "getDashboardStats": {
        return {
          totalLaporan: 24,
          sudahDinilai: 18,
          belumDinilai: 6,
          rataRating: 4.2,
        } as DashboardStats;
      }

      case "getLaporan": {
        const email = params?.email || "";
        const allLaporan = [
          {
            id: "lap_001",
            user_id: "user_002",
            user_name: "Kirin Developer",
            tanggal: "2025-02-01",
            judul: "Laporan Implementasi Sistem SIPEKA",
            deskripsi:
              "Mengembangkan sistem pelaporan kinerja pegawai berbasis web dengan Next.js dan Firebase. Menambahkan fitur autentikasi, dashboard interaktif, dan sistem penilaian.",
            file_url: "https://example.com/laporan1.pdf",
            status: "sudah_dinilai" as const,
            rating: 4.5,
            komentar: "Pekerjaan sangat baik dan sesuai deadline",
            created_at: "2025-02-01T08:00:00Z",
          },
          {
            id: "lap_002",
            user_id: "user_002",
            user_name: "Kirin Developer",
            tanggal: "2025-02-10",
            judul: "Laporan Maintenance Server",
            deskripsi:
              "Melakukan maintenance rutin server produksi termasuk update keamanan, backup database, dan optimasi performa.",
            file_url: "https://example.com/laporan2.pdf",
            status: "belum_dinilai" as const,
            created_at: "2025-02-10T08:00:00Z",
          },
          {
            id: "lap_003",
            user_id: "user_002",
            user_name: "Kirin Developer",
            tanggal: "2025-02-12",
            judul: "Integrasi API Google Sheets",
            deskripsi:
              "Mengintegrasikan sistem dengan Google Sheets menggunakan Apps Script untuk penyimpanan data.",
            file_url: "https://example.com/laporan3.pdf",
            status: "sudah_dinilai" as const,
            rating: 4.0,
            komentar: "Bagus, dokumentasi bisa diperbaiki",
            created_at: "2025-02-12T08:00:00Z",
          },
        ];

        // Filter by email if provided
        if (email) {
          return allLaporan.filter((lap) => {
            const user = Object.values(MOCK_USERS).find(
              (u) => u.id === lap.user_id,
            );
            return user?.email === email;
          });
        }

        return allLaporan;
      }
      case "getLaporanForReview": {
        // Tampilkan semua laporan yang belum dinilai
        return [
          {
            id: "lap_002",
            user_id: "user_002",
            user_name: "Kirin Developer",
            tanggal: "2025-02-10",
            judul: "Laporan Maintenance Server",
            deskripsi:
              "Melakukan maintenance rutin server produksi termasuk update keamanan, backup database, dan optimasi performa.",
            file_url: "https://example.com/laporan2.pdf",
            status: "belum_dinilai" as const,
            created_at: "2025-02-10T08:00:00Z",
          },
          {
            id: "lap_004",
            user_id: "user_002",
            user_name: "Kirin Developer",
            tanggal: "2025-02-13",
            judul: "Implementasi Dark Mode",
            deskripsi:
              "Menambahkan fitur dark mode pada aplikasi untuk meningkatkan user experience.",
            file_url: "https://example.com/laporan4.pdf",
            status: "belum_dinilai" as const,
            created_at: "2025-02-13T08:00:00Z",
          },
        ] as Laporan[];
      }

      case "getRekapStats": {
        return {
          totalPegawai: 45,
          totalLaporan: 324,
          rataKehadiran: 92.5,
          laporanBulanIni: 67,
        };
      }

      case "getRekapByPegawai": {
        return [
          {
            name: "Ahmad Dahlan",
            unit: "Bagian Umum",
            total: 24,
            dinilai: 22,
            rata: 4.3,
          },
          {
            name: "Siti Nurhaliza",
            unit: "Bagian Kepegawaian",
            total: 22,
            dinilai: 20,
            rata: 4.5,
          },
          {
            name: "Budi Santoso",
            unit: "Bagian Keuangan",
            total: 20,
            dinilai: 18,
            rata: 4.1,
          },
          {
            name: "Dewi Lestari",
            unit: "Bagian Humas",
            total: 19,
            dinilai: 19,
            rata: 4.6,
          },
          {
            name: "Eko Prasetyo",
            unit: "Bagian Perencanaan",
            total: 18,
            dinilai: 16,
            rata: 3.9,
          },
          {
            name: "Fatimah Zahra",
            unit: "Bagian SDM",
            total: 17,
            dinilai: 17,
            rata: 4.4,
          },
          {
            name: "Gunawan Wijaya",
            unit: "Bagian Umum",
            total: 16,
            dinilai: 14,
            rata: 4.0,
          },
          {
            name: "Hani Setiawan",
            unit: "Bagian Keuangan",
            total: 15,
            dinilai: 15,
            rata: 4.2,
          },
        ];
      }

      case "getRekapByBulan": {
        return [
          { bulan: "Agu", laporan: 45, dinilai: 42, rata: 4.1 },
          { bulan: "Sep", laporan: 52, dinilai: 50, rata: 4.2 },
          { bulan: "Oct", laporan: 48, dinilai: 45, rata: 4.0 },
          { bulan: "Nov", laporan: 55, dinilai: 53, rata: 4.3 },
          { bulan: "Des", laporan: 50, dinilai: 48, rata: 4.2 },
          { bulan: "Jan", laporan: 57, dinilai: 55, rata: 4.4 },
          { bulan: "Feb", laporan: 67, dinilai: 63, rata: 4.5 },
        ];
      }
      case "updateProfile": {
        // Simulasi update profil
        return {
          ...MOCK_USERS["kirinxe00@gmail.com"],
          ...params,
        };
      }

      case "changePassword": {
        // Simulasi change password
        return { success: true };
      }

      case "getActivityLog": {
        return [
          {
            id: "log_001",
            action: "Kirim Laporan",
            description: 'Mengirim laporan "Koordinasi Rapat Bulanan"',
            timestamp: "2025-02-14T10:30:00Z",
          },
          {
            id: "log_002",
            action: "Login",
            description: "Login ke sistem SIPEKA",
            timestamp: "2025-02-14T08:00:00Z",
          },
          {
            id: "log_003",
            action: "Kirim Laporan",
            description: 'Mengirim laporan "Penyusunan Dokumen Perencanaan"',
            timestamp: "2025-02-13T14:15:00Z",
          },
          {
            id: "log_004",
            action: "Update Profil",
            description: "Memperbarui nomor telepon",
            timestamp: "2025-02-12T09:20:00Z",
          },
          {
            id: "log_005",
            action: "Login",
            description: "Login ke sistem SIPEKA",
            timestamp: "2025-02-12T08:00:00Z",
          },
        ];
      }
      default:
        return null;
    }
  }

  async getUser(email: string): Promise<User | null> {
    return this.fetchAPI("getUser", { email });
  }

  async getDashboardStats(
    email: string,
    role: string,
  ): Promise<DashboardStats> {
    return this.fetchAPI("getDashboardStats", { email, role });
  }

  async getLaporan(email?: string): Promise<Laporan[]> {
    return this.fetchAPI("getLaporan", email ? { email } : {});
  }
  async getRekapStats(): Promise<{
    totalPegawai: number;
    totalLaporan: number;
    rataKehadiran: number;
    laporanBulanIni: number;
  }> {
    return this.fetchAPI("getRekapStats");
  }

  async getRekapByPegawai(): Promise<
    Array<{
      name: string;
      unit: string;
      total: number;
      dinilai: number;
      rata: number;
    }>
  > {
    return this.fetchAPI("getRekapByPegawai");
  }

  async getRekapByBulan(): Promise<
    Array<{
      bulan: string;
      laporan: number;
      dinilai: number;
      rata: number;
    }>
  > {
    return this.fetchAPI("getRekapByBulan");
  }
  async updateProfile(data: Partial<User>): Promise<User> {
    // Convert all values to string for fetchAPI compatibility
    const params: Record<string, string> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) params[key] = String(value);
    });
    return this.fetchAPI("updateProfile", params);
  }

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    return this.fetchAPI("changePassword", data);
  }

  async getActivityLog(): Promise<
    Array<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
    }>
  > {
    return this.fetchAPI("getActivityLog");
  }
  async submitLaporan(
    data: Omit<Laporan, "id" | "status" | "created_at">,
  ): Promise<{ success: boolean; message: string }> {
    console.log("📤 Submit Laporan:", data);
    return { success: true, message: "Laporan berhasil dikirim (mock)" };
  }
  async getLaporanForReview(): Promise<Laporan[]> {
    return this.fetchAPI("getLaporanForReview");
  }
  async submitReview(
    data: Review,
  ): Promise<{ success: boolean; message: string }> {
    console.log("📤 Submit Review:", data);
    return { success: true, message: "Review berhasil dikirim (mock)" };
  }
}

export const api = new API();
