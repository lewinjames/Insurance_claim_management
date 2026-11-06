// API helper module for College Mini-Project (Project 29)
// Uses standard fetch with simple error handling and JWT Bearer token

const API_BASE = '/api';

// Helper function to make HTTP requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('insurance_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. Authentication APIs
export const authAPI = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getMe: () => request('/auth/me'),
  resetDemoDb: () => request('/auth/reset-demo-db', { method: 'POST' })
};

// 2. User Management APIs
export const usersAPI = {
  getAll: (params = '') => request(`/users${params ? `?${params}` : ''}`),
  getOfficers: () => request('/users/officers'),
  getById: (id) => request(`/users/${id}`),
  create: (userData) => request('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  update: (id, userData) => request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
};

// 3. Policyholder APIs
export const policyholdersAPI = {
  getAll: (params = '') => request(`/policyholders${params ? `?${params}` : ''}`),
  getById: (id) => request(`/policyholders/${id}`),
  create: (data) => request('/policyholders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/policyholders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/policyholders/${id}`, { method: 'DELETE' })
};

// 4. Policy APIs
export const policiesAPI = {
  getAll: (params = '') => request(`/policies${params ? `?${params}` : ''}`),
  getById: (id) => request(`/policies/${id}`),
  create: (data) => request('/policies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/policies/${id}`, { method: 'DELETE' })
};

// 5. Claim APIs
export const claimsAPI = {
  getAll: (params = '') => request(`/claims${params ? `?${params}` : ''}`),
  getById: (id) => request(`/claims/${id}`),
  create: (data) => request('/claims', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  assignOfficer: (id, officerId) => request(`/claims/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ officerId })
  }),
  updateStatus: (id, statusData) => request(`/claims/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),
  update: (id, data) => request(`/claims/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/claims/${id}`, { method: 'DELETE' })
};

// 6. Claim Documents APIs
export const documentsAPI = {
  getAll: (params = '') => request(`/documents${params ? `?${params}` : ''}`),
  create: (data) => request('/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/documents/${id}`, { method: 'DELETE' })
};

// 7. Review APIs
export const reviewsAPI = {
  getAll: (params = '') => request(`/reviews${params ? `?${params}` : ''}`),
  create: (data) => request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' })
};

// 8. Settlement APIs
export const settlementsAPI = {
  getAll: (params = '') => request(`/settlements${params ? `?${params}` : ''}`),
  create: (data) => request('/settlements', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/settlements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/settlements/${id}`, { method: 'DELETE' })
};

// 9. Report APIs
export const reportsAPI = {
  getSummary: () => request('/reports/summary')
};
