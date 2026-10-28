import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://todo-list-backend-eta.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const toggleTaskCompleted = async (id) => {
  const response = await api.patch(`/tasks/${id}/toggle`);
  return response.data;
};

export const getWeather = async (city = 'San Francisco') => {
  const response = await api.get('/external/weather', { params: { city } });
  return response.data;
};

export const getGitHubIssues = async (repo = 'facebook/react') => {
  const response = await api.get('/external/github/issues', { params: { repo } });
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
