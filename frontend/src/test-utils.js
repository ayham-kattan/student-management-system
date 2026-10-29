import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './context/ToastContext';

export const ayham = {
  studentId: 1,
  name: 'Ayham Kattan',
  email: 'ayham@example.com',
  phone: null,
  department: 'CS',
  createdDate: '2026-10-29T10:00:00.000Z',
};

export const apiUrl = (path) => `${process.env.REACT_APP_API_URL || ''}/api${path}`;

export const json = (status, body) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

export const listOf = (rows) =>
  json(200, { data: rows, meta: { page: 1, limit: 10, total: rows.length, totalPages: 1 } });

// Query params of the most recent GET /api/students list call.
export const listCalls = () => fetch.mock.calls.map(([u]) => u).filter((u) => u.includes('/api/students?'));
export const lastListParams = () => new URL(listCalls().at(-1), 'http://x').searchParams;

// Exposes the router's current URL to tests.
function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

export function renderApp(route = '/students') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <App />
        <LocationProbe />
      </ToastProvider>
    </MemoryRouter>
  );
}
