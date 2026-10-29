// Empty by default: requests go to /api on the same origin
// (CRA dev proxy locally, nginx in Docker). Set REACT_APP_API_URL to call another host.
const API_URL = process.env.REACT_APP_API_URL || '';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API running?');
  }

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error?.message || `Request failed (${res.status})`, body.error?.details);
  }
  return body;
}

export const studentsApi = {
  list: (page = 1, limit = 10) => request(`/students?page=${page}&limit=${limit}`),
  get: (id) => request(`/students/${id}`).then((b) => b.data),
  create: (student) =>
    request('/students', { method: 'POST', body: JSON.stringify(student) }).then((b) => b.data),
  update: (id, student) =>
    request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }).then((b) => b.data),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
};
