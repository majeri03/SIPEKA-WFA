import { User, Laporan } from '@/types';

export async function apiRequest(
  endpoint: string, 
  method: string = 'GET', 
  data?: Record<string, unknown>
) {
  const url = `/api/proxy?endpoint=${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // User
  async getUser(email: string): Promise<User | null> {
    return apiRequest(`getUser&email=${email}`);
  },

  // Laporan
  async getLaporan(email: string, role: string) {
    return apiRequest(`getLaporan&email=${email}&role=${role}`);
  },

  async createLaporan(data: Partial<Laporan>) {
    return apiRequest('createLaporan', 'POST', data as Record<string, unknown>);
  },

  async updateRating(id: string, rating: Record<string, unknown>) {
    return apiRequest('updateRating', 'POST', { id, ...rating });
  },

  // Dashboard Stats
  async getDashboardStats(email: string, role: string) {
    return apiRequest(`getDashboardStats&email=${email}&role=${role}`);
  },

  async getAllUsers() {
    return apiRequest('getAllUsers');
  }
};