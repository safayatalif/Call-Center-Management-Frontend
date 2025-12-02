// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API Client for making HTTP requests
 */
class ApiClient {
    private baseURL: string;
    private token: string | null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.token = null;

        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    /**
     * Set authentication token
     */
    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    /**
     * Remove authentication token
     */
    removeToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Make HTTP request
     */
    private async request(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error: any) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    async put(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create API client instance
const api = new ApiClient(API_BASE_URL);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (name: string, email: string, password: string, role?: string) =>
        api.post('/auth/register', { name, email, password, role }),

    getProfile: () => api.get('/auth/profile'),

    logout: () => api.removeToken(),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getAgents: () => api.get('/dashboard/agents'),
    getProjects: () => api.get('/dashboard/projects'),
    getCalls: (filters?: { status?: string; agent_id?: number; project_id?: number }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
        if (filters?.project_id) params.append('project_id', filters.project_id.toString());

        const query = params.toString();
        return api.get(`/dashboard/calls${query ? `?${query}` : ''}`);
    },
};

// User Management API (deprecated - use employeeAPI)
export const userAPI = {
    getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        return api.get(`/employees${query ? `?${query}` : ''}`);
    },
    getById: (id: number) => api.get(`/employees/${id}`),
    create: (data: any) => api.post('/employees', data),
    update: (id: number, data: any) => api.put(`/employees/${id}`, data),
    delete: (id: number) => api.delete(`/employees/${id}`),
    inactivate: (id: number) => api.patch(`/employees/${id}/inactivate`, {}),
};

// Employee Management API
export const employeeAPI = {
    getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);

        const query = queryParams.toString();
        return api.get(`/employees${query ? `?${query}` : ''}`);
    },
    getById: (id: number) => api.get(`/employees/${id}`),
    create: (data: any) => api.post('/employees', data),
    update: (id: number, data: any) => api.put(`/employees/${id}`, data),
    delete: (id: number) => api.delete(`/employees/${id}`),
};

// Team Management API
export const teamAPI = {
    getAll: (params?: { page?: number; limit?: number; search?: string; teamtype?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.teamtype) queryParams.append('teamtype', params.teamtype);

        const query = queryParams.toString();
        return api.get(`/teams${query ? `?${query}` : ''}`);
    },
    getById: (id: number) => api.get(`/teams/${id}`),
    create: (data: any) => api.post('/teams', data),
    update: (id: number, data: any) => api.put(`/teams/${id}`, data),
    delete: (id: number) => api.delete(`/teams/${id}`),
    addMember: (teamId: number, employeeId: number, remarks?: string) =>
        api.post(`/teams/${teamId}/members`, { employee_id: employeeId, remarks }),
    removeMember: (teamId: number, memberId: number) =>
        api.delete(`/teams/${teamId}/members/${memberId}`),
    getAvailableEmployees: (teamId: number, search?: string) => {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return api.get(`/teams/${teamId}/available-employees${query}`);
    }
};

export { api };
export default api;
