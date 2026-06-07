const API_BASE_URL = 'http://localhost:5000/api';

const getUserId = () => localStorage.getItem('userId');

export const projectService = {
  // Fetch all projects for the dashboard (Isolated per User)
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': getUserId() 
      }
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json(); 
  },

  // Create a new project workspace (Tied to creator)
  create: async (projectData) => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': getUserId() 
      },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return await res.json(); 
  },

  // Get aggregated operational metrics for the summary row (Isolated per User)
  getMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/projects/metrics`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': getUserId() 
      }
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return await res.json(); 
  },

  // --- WORKSPACE TASK METHODS ---
  getOne: async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`);
    if (!res.ok) throw new Error('Failed to load workspace data');
    return await res.json();
  },

  getTasks: async (projectId) => {
    const res = await fetch(`${API_BASE_URL}/projects/tasks/project/${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch workspace tasks');
    return await res.json();
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/projects/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to generate task');
    return await res.json();
  },

  updateTaskStatus: async (taskId, status) => {
    const res = await fetch(`${API_BASE_URL}/projects/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to sync state update');
    return await res.json();
  },
  
  // --- USER AUTHENTICATION INTEGRATION ---
  auth: {
    register: async (userData) => {
      const res = await fetch(`${API_BASE_URL}/projects/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    },
    login: async (credentials) => {
      const res = await fetch(`${API_BASE_URL}/projects/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    }
  }
};