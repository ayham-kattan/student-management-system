import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const ayham = {
  studentId: 1,
  name: 'Ayham Kattan',
  email: 'ayham@example.com',
  phone: null,
  department: 'CS',
  createdDate: '2026-10-29T10:00:00.000Z',
};

const url = (path) => `${process.env.REACT_APP_API_URL || ''}/api${path}`;

const json = (status, body) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

const listOf = (rows) => json(200, { data: rows, meta: { page: 1, limit: 10, total: rows.length, totalPages: 1 } });

beforeEach(() => {
  global.fetch = jest.fn();
});

test('lists students from the API', async () => {
  fetch.mockReturnValueOnce(listOf([ayham]));
  render(<App />);

  expect(await screen.findByText('Ayham Kattan')).toBeInTheDocument();
  expect(screen.getByText('ayham@example.com')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(url('/students?page=1&limit=10'), expect.any(Object));
});

test('shows an empty state', async () => {
  fetch.mockReturnValueOnce(listOf([]));
  render(<App />);
  expect(await screen.findByText(/No students yet/)).toBeInTheDocument();
});

test('shows an error when the API is unreachable', async () => {
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server');
});

test('creates a student and reloads the list', async () => {
  fetch
    .mockReturnValueOnce(listOf([]))
    .mockReturnValueOnce(json(201, { data: ayham }))
    .mockReturnValueOnce(listOf([ayham]));
  render(<App />);
  await screen.findByText(/No students yet/);

  userEvent.click(screen.getByRole('button', { name: '+ Add student' }));
  userEvent.type(screen.getByLabelText(/Name/), 'Ayham Kattan');
  userEvent.type(screen.getByLabelText(/Email/), 'ayham@example.com');
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('Student added')).toBeInTheDocument();
  expect(screen.getByText('Ayham Kattan')).toBeInTheDocument();
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    name: 'Ayham Kattan',
    email: 'ayham@example.com',
    phone: '',
    department: '',
  });
});

test('shows server validation errors next to each field', async () => {
  fetch.mockReturnValueOnce(listOf([])).mockReturnValueOnce(
    json(400, {
      error: { message: 'Validation failed', details: { name: 'name is required', email: 'email is invalid' } },
    })
  );
  render(<App />);
  await screen.findByText(/No students yet/);

  userEvent.click(screen.getByRole('button', { name: '+ Add student' }));
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('name is required')).toBeInTheDocument();
  expect(screen.getByText('email is invalid')).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('shows a duplicate email (409) on the email field', async () => {
  fetch
    .mockReturnValueOnce(listOf([ayham]))
    .mockReturnValueOnce(json(409, { error: { message: 'A student with this email already exists' } }));
  render(<App />);

  userEvent.click(await screen.findByRole('button', { name: 'Edit Ayham Kattan' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByLabelText(/Name/)).toHaveValue('Ayham Kattan');

  userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('A student with this email already exists')).toBeInTheDocument();
  expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
  expect(fetch.mock.calls[1][0]).toBe(url('/students/1'));
  expect(fetch.mock.calls[1][1].method).toBe('PUT');
});

test('deletes a student after confirmation', async () => {
  fetch
    .mockReturnValueOnce(listOf([ayham]))
    .mockReturnValueOnce(Promise.resolve({ ok: true, status: 204 }))
    .mockReturnValueOnce(listOf([]));
  render(<App />);

  userEvent.click(await screen.findByRole('button', { name: 'Delete Ayham Kattan' }));
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  expect(await screen.findByText('Student deleted')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('Ayham Kattan')).not.toBeInTheDocument());
  expect(fetch.mock.calls[1]).toEqual([url('/students/1'), expect.objectContaining({ method: 'DELETE' })]);
});
