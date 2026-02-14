import { User, Laporan } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

class API {
  // Helper untuk build full URL
  private getFullURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    let baseURL = API_BASE_URL;
    if (baseURL.startsWith("/")) {
      if (typeof window !== "undefined") {
        baseURL = `${window.location.origin}${baseURL}`;
      } else {
        baseURL = `http://localhost:3000${baseURL}`;
      }
    }

    const url = new URL(baseURL);
    url.searchParams.append("endpoint", endpoint);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    return url.toString();
  }

  private async fetchAPI(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}, // Default empty object
  ): Promise<unknown> {
    if (!API_BASE_URL) {
      throw new Error("Apps Script URL belum dikonfigurasi");
    }

    // Pastikan params bukan null/undefined sebelum diproses
    const safeParams = params || {};
    const url = this.getFullURL(endpoint, safeParams);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store", // Tambahkan ini agar tidak cache error
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        // Cek apakah error message berupa string atau object
        const errorMessage = typeof result.data === 'string' 
            ? result.data 
            : JSON.stringify(result.data);
        throw new Error(errorMessage || "Terjadi kesalahan pada server");
      }

      return result.data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error instanceof Error ? error : new Error("Gagal terhubung ke server");
    }
  }

  private async postAPI(
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    if (!API_BASE_URL) {
      throw new Error("Apps Script URL belum dikonfigurasi");
    }

    const url = this.getFullURL(endpoint);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.data || "Terjadi kesalahan");
      }

      return result.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error instanceof Error ? error : new Error("Gagal terhubung");
    }
  }

  // ========================================
  // USER & AUTH METHODS
  // ========================================
  
  async getUser(userEmail: string): Promise<User> {
    const data = await this.fetchAPI("getUser", { email: userEmail });
    return data as User;
  }

  async updateProfile(userData: Partial<User> & { email: string }): Promise<User> {
    const data = await this.postAPI("updateProfile", userData as Record<string, unknown>);
    return data as User;
  }

  async changePassword(passwordData: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean }> {
    const data = await this.postAPI("changePassword", passwordData as Record<string, unknown>);
    return data as { success: boolean };
  }

  async getProfileSummary(userEmail: string): Promise<{
    totalLaporan: number;
    totalDinilai: number;
    belumDinilai: number;
    rataRating: number;
    // Tambahkan properti ini agar sesuai dengan output Apps Script terbaru
    recentActivities: Array<{
      title: string;
      desc: string;
      time: string;
      status: string;
    }>;
    lastReport: { judul: string; tanggal: string; status: string } | null;
  }> {
    if (!userEmail) throw new Error("Email diperlukan untuk mengambil data profil");
    
    const data = await this.fetchAPI("getProfileSummary", { email: userEmail });
    
    // Casting ke tipe yang lengkap
    return data as {
      totalLaporan: number;
      totalDinilai: number;
      belumDinilai: number;
      rataRating: number;
      recentActivities: Array<{
        title: string;
        desc: string;
        time: string;
        status: string;
      }>;
      lastReport: { judul: string; tanggal: string; status: string } | null;
    };
  }

  async checkUserExists(userEmail: string): Promise<{ exists: boolean; user: User | null }> {
    const data = await this.fetchAPI("checkUserExists", { email: userEmail });
    return data as { exists: boolean; user: User | null };
  }

  async registerUserToFirebase(userEmail: string): Promise<{
    email: string;
    password: string;
    name: string;
    needPasswordChange: boolean;
  }> {
    const data = await this.fetchAPI("registerUserToFirebase", { email: userEmail });
    return data as {
      email: string;
      password: string;
      name: string;
      needPasswordChange: boolean;
    };
  }

  // ========================================
  // LAPORAN METHODS
  // ========================================

  async getLaporan(userEmail: string): Promise<Laporan[]> {
    const data = await this.fetchAPI("getLaporan", { email: userEmail });
    return data as Laporan[];
  }

  async getLaporanForReview(userEmail: string): Promise<Laporan[]> {
    const data = await this.fetchAPI("getLaporanForReview", { email: userEmail });
    return data as Laporan[];
  }

  async submitLaporan(laporanData: {
    employee_email?: string;
    user_email?: string;
    tanggal: string;
    judul: string;
    deskripsi: string;
    output_result?: string;
    file_url?: string;
  }): Promise<{ success: boolean; id: string }> {
    const data = await this.postAPI("submitLaporan", laporanData as Record<string, unknown>);
    return data as { success: boolean; id: string };
  }

  async submitReview(reviewData: {
    laporan_id: string;
    reviewer_email: string;
    reviewer_name: string;
    rating: number;
    komentar: string;
    created_at: string;
  }): Promise<{ success: boolean }> {
    const data = await this.postAPI("submitReview", reviewData as Record<string, unknown>);
    return data as { success: boolean };
  }

  // ========================================
  // REKAP METHODS
  // ========================================

  async getRekapStats(userEmail: string): Promise<{
    totalPegawai: number;
    totalLaporan: number;
    rataKehadiran: number;
    laporanBulanIni: number;
  }> {
    const data = await this.fetchAPI("getRekapStats", { email: userEmail });
    return data as {
      totalPegawai: number;
      totalLaporan: number;
      rataKehadiran: number;
      laporanBulanIni: number;
    };
  }

  async getRekapByPegawai(userEmail: string): Promise<
    Array<{
      name: string;
      unit: string;
      total: number;
      dinilai: number;
      rata: number;
    }>
  > {
    const data = await this.fetchAPI("getRekapByPegawai", { email: userEmail });
    return data as Array<{
      name: string;
      unit: string;
      total: number;
      dinilai: number;
      rata: number;
    }>;
  }

  async getRekapByBulan(userEmail: string): Promise<
    Array<{
      bulan: string;
      laporan: number;
      dinilai: number;
      rata: number;
    }>
  > {
    const data = await this.fetchAPI("getRekapByBulan", { email: userEmail });
    return data as Array<{
      bulan: string;
      laporan: number;
      dinilai: number;
      rata: number;
    }>;
  }

  // ========================================
  // ARSIP METHODS
  // ========================================

  async getArsip(userEmail: string, year: number): Promise<Laporan[]> {
    const data = await this.fetchAPI("getArsip", { email: userEmail, year });
    return data as Laporan[];
  }

  // ========================================
  // SDM / PEGAWAI MANAGEMENT METHODS
  // ========================================

  async getAllUsers(requesterEmail: string): Promise<User[]> {
    if (!requesterEmail) throw new Error("Email admin diperlukan");
    // Menggunakan fetchAPI yang sudah ada di class Anda
    const data = await this.fetchAPI("getAllUsers", { email: requesterEmail });
    return data as User[];
  }

  async manageUser(
    adminEmail: string, 
    action: 'add' | 'edit' | 'delete', 
    payload: Record<string, unknown>
  ): Promise<{ success: boolean; message: string }> {
    
    // Bungkus payload agar sesuai struktur yang diharapkan Backend GAS
    const body = {
      adminEmail,
      action,
      payload
    };

    // Menggunakan postAPI yang sudah ada (otomatis handle endpoint 'manageUser')
    const data = await this.postAPI("manageUser", body);
    return data as { success: boolean; message: string };
  }
}

export const api = new API();