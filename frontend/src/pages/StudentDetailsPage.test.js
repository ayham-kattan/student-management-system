import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiUrl, ayham, json, listOf, renderApp } from '../test-utils';

const location = () => screen.getByTestId('location').textContent;

beforeEach(() => {
  global.fetch = jest.fn();
});

test('shows the student details from the API', async () => {
  fetch.mockReturnValueOnce(json(200, { data: { ...ayham, phone: '+968 9123 4567' } }));
  renderApp('/students/1');

  expect(await screen.findByRole('heading', { name: 'Ayham Kattan' })).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(apiUrl('/students/1'), expect.any(Object));
  expect(screen.getByText('Student #1')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'ayham@example.com' })).toHaveAttribute('href', 'mailto:ayham@example.com');
  expect(screen.getByText('+968 9123 4567')).toBeInTheDocument();
  expect(screen.getByText('CS')).toBeInTheDocument();
});

test('shows "not found" for a missing student', async () => {
  fetch.mockReturnValueOnce(json(404, { error: { message: 'Student not found' } }));
  renderApp('/students/999');

  expect(await screen.findByRole('heading', { name: 'Student not found' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to students' })).toHaveAttribute('href', '/students');
});

test('edits the student in place', async () => {
  fetch
    .mockReturnValueOnce(json(200, { data: ayham }))
    .mockReturnValueOnce(json(200, { data: { ...ayham, name: 'Ayham K.' } }));
  renderApp('/students/1');

  userEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  const name = within(screen.getByRole('dialog')).getByLabelText(/Full name/);
  userEvent.clear(name);
  userEvent.type(name, 'Ayham K.');
  userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('heading', { name: 'Ayham K.' })).toBeInTheDocument();
  expect(screen.getByText('Student updated')).toBeInTheDocument();
  expect(fetch.mock.calls[1]).toEqual([apiUrl('/students/1'), expect.objectContaining({ method: 'PUT' })]);
});

test('deleting goes back to the list with a confirmation', async () => {
  fetch
    .mockReturnValueOnce(json(200, { data: ayham }))
    .mockReturnValueOnce(Promise.resolve({ ok: true, status: 204 }))
    .mockReturnValueOnce(listOf([]));
  renderApp('/students/1');

  userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
  userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(location()).toBe('/students'));
  expect(await screen.findByText('Student deleted')).toBeInTheDocument();
  expect(fetch.mock.calls[1]).toEqual([apiUrl('/students/1'), expect.objectContaining({ method: 'DELETE' })]);
});
