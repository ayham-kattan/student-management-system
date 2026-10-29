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

export async function request(path, options = {}) {
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
