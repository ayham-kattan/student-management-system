import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiUrl as url, ayham, json, lastListParams, listCalls, listOf, renderApp } from '../test-utils';

beforeEach(() => {
  global.fetch = jest.fn();
});

test('lists students from the API', async () => {
  fetch.mockReturnValueOnce(listOf([ayham]));
  renderApp();

  expect(await screen.findByText('Ayham Kattan')).toBeInTheDocument();
  expect(screen.getByText('ayham@example.com')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(url('/students?page=1&limit=10&sortBy=studentId&sortOrder=desc'), expect.any(Object));
});

test('shows an empty state', async () => {
  fetch.mockReturnValueOnce(listOf([]));
  renderApp();
  expect(await screen.findByText(/No students yet/)).toBeInTheDocument();
});

test('shows an error when the API is unreachable', async () => {
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  renderApp();
  expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server');
});

test('creates a student and reloads the list', async () => {
  fetch
    .mockReturnValueOnce(listOf([]))
    .mockReturnValueOnce(json(201, { data: ayham }))
    .mockReturnValueOnce(listOf([ayham]));
  renderApp();
  await screen.findByText(/No students yet/);

  userEvent.click(screen.getAllByRole('button', { name: 'Add student' })[0]);
  userEvent.type(screen.getByLabelText(/Full name/), 'Ayham Kattan');
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
  renderApp();
  await screen.findByText(/No students yet/);

  userEvent.click(screen.getAllByRole('button', { name: 'Add student' })[0]);
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByText('name is required')).toBeInTheDocument();
  expect(screen.getByText('email is invalid')).toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('shows a duplicate email (409) on the email field', async () => {
  fetch
    .mockReturnValueOnce(listOf([ayham]))
    .mockReturnValueOnce(json(409, { error: { message: 'A student with this email already exists' } }));
  renderApp();

  userEvent.click(await screen.findByRole('button', { name: 'Edit Ayham Kattan' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByLabelText(/Full name/)).toHaveValue('Ayham Kattan');

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
  renderApp();

  userEvent.click(await screen.findByRole('button', { name: 'Delete Ayham Kattan' }));
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  expect(await screen.findByText('Student deleted')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('Ayham Kattan')).not.toBeInTheDocument());
  expect(fetch.mock.calls[1]).toEqual([url('/students/1'), expect.objectContaining({ method: 'DELETE' })]);
});

test('searches by name or email through the API', async () => {
  fetch.mockImplementation(() => listOf([ayham]));
  renderApp();
  await screen.findByText('Ayham Kattan');

  userEvent.type(screen.getByRole('searchbox', { name: /search students/i }), 'ayh');

  await waitFor(() => expect(lastListParams().get('search')).toBe('ayh'));
  expect(lastListParams().get('page')).toBe('1');
  // Debounced: typing 3 letters triggers one search request, not three
  expect(listCalls().filter((u) => u.includes('search='))).toHaveLength(1);
});

test('shows a no-results message for a search', async () => {
  fetch.mockImplementation((u) => listOf(u.includes('search=') ? [] : [ayham]));
  renderApp();
  await screen.findByText('Ayham Kattan');

  userEvent.type(screen.getByRole('searchbox'), 'zzz');
  expect(await screen.findByText(/No students match “zzz”/)).toBeInTheDocument();
});

test('sorts a column ascending, then descending, through the API', async () => {
  fetch.mockImplementation(() => listOf([ayham]));
  renderApp();
  await screen.findByText('Ayham Kattan');

  const nameHeader = () => screen.getByRole('columnheader', { name: /name/i });
  expect(screen.getByRole('columnheader', { name: /id/i })).toHaveAttribute('aria-sort', 'descending');

  userEvent.click(within(nameHeader()).getByRole('button'));
  await waitFor(() => expect(lastListParams().get('sortBy')).toBe('name'));
  expect(lastListParams().get('sortOrder')).toBe('asc');
  await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending'));

  userEvent.click(within(nameHeader()).getByRole('button'));
  await waitFor(() => expect(lastListParams().get('sortOrder')).toBe('desc'));
  expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');
});

test('every data column is sortable, actions is not', async () => {
  fetch.mockImplementation(() => listOf([ayham]));
  renderApp();
  await screen.findByText('Ayham Kattan');

  for (const name of ['ID', 'Name', 'Email', 'Phone', 'Department', 'Created']) {
    const header = screen.getByRole('columnheader', { name: new RegExp(`^${name}`, 'i') });
    expect(within(header).getByRole('button')).toBeInTheDocument();
  }
  expect(within(screen.getByRole('columnheader', { name: /actions/i })).queryByRole('button')).toBeNull();
});

describe('routing and URL state', () => {
  const location = () => screen.getByTestId('location').textContent;

  test('"/" opens the students page', async () => {
    fetch.mockImplementation(() => listOf([ayham]));
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Students' })).toBeInTheDocument();
    expect(location()).toBe('/students');
  });

  test('search, sort and page are restored from the URL', async () => {
    fetch.mockImplementation(() => listOf([ayham]));
    renderApp('/students?page=2&search=ali&sortBy=name&sortOrder=asc');
    await screen.findByText('Ayham Kattan');

    const params = lastListParams();
    expect(Object.fromEntries(params)).toMatchObject({ page: '2', search: 'ali', sortBy: 'name', sortOrder: 'asc' });
    expect(screen.getByRole('searchbox')).toHaveValue('ali');
    expect(screen.getByRole('columnheader', { name: /name/i })).toHaveAttribute('aria-sort', 'ascending');
  });

  test('searching and sorting are written to the URL', async () => {
    fetch.mockImplementation(() => listOf([ayham]));
    renderApp();
    await screen.findByText('Ayham Kattan');

    userEvent.type(screen.getByRole('searchbox'), 'ali');
    await waitFor(() => expect(location()).toBe('/students?search=ali'));

    userEvent.click(within(screen.getByRole('columnheader', { name: /email/i })).getByRole('button'));
    await waitFor(() => expect(location()).toBe('/students?search=ali&sortBy=email&sortOrder=asc'));
  });

  test('a student name links to the details page', async () => {
    fetch.mockImplementation((u) => (u.includes('/students?') ? listOf([ayham]) : json(200, { data: ayham })));
    renderApp();

    userEvent.click(await screen.findByRole('link', { name: /Ayham Kattan/ }));
    expect(await screen.findByRole('heading', { name: 'Ayham Kattan' })).toBeInTheDocument();
    expect(location()).toBe('/students/1');
  });

  test('unknown routes show a 404 page', async () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to students' })).toHaveAttribute('href', '/students');
  });
});
