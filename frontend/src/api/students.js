import { request } from './client';

export const studentsApi = {
  list: ({ page = 1, limit = 10, search = '', sortBy, sortOrder } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    return request(`/students?${params}`);
  },
  get: (id) => request(`/students/${id}`).then((b) => b.data),
  create: (student) =>
    request('/students', { method: 'POST', body: JSON.stringify(student) }).then((b) => b.data),
  update: (id, student) =>
    request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }).then((b) => b.data),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
};
