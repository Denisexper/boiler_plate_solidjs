const API_URL = 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msj || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(name, email, password, role = 'user') {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Logs
  async getLogs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/logs${params ? `?${params}` : ''}`);
  }

  async deleteLog(id) {
    return this.request(`/logs/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();