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
    params?: Record<string, string | number | boolean>,
  ): Promise<unknown> {
    if (!API_BASE_URL) {
      throw new Error("Apps Script URL belum dikonfigurasi");
    }

    const url = this.getFullURL(endpoint, params);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
    lastReport: { judul: string; tanggal: string; status: string } | null;
  }> {
    const data = await this.fetchAPI("getProfileSummary", { email: userEmail });
    return data as {
      totalLaporan: number;
      totalDinilai: number;
      belumDinilai: number;
      rataRating: number;
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
}

export const api = new API();