import { useCallback, useEffect, useRef, useState } from 'react';
import { studentsApi } from './api/students';
import Modal from './components/Modal';
import Pagination from './components/Pagination';
import SearchBox from './components/SearchBox';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import useDebouncedValue from './hooks/useDebouncedValue';

const PAGE_SIZE = 10;
const DEFAULT_SORT = [{ id: 'studentId', desc: true }];

function App() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState(DEFAULT_SORT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // { mode: 'create' } | { mode: 'edit', student } | { mode: 'delete', student } | null
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const latestRequest = useRef(0);

  // A new search starts again from page 1. Adjusting state during render (instead of in an
  // effect) avoids fetching the old page with the new search first.
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  const changeSorting = (updater) => {
    setSorting(updater);
    setPage(1);
  };

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const [{ id: sortBy, desc }] = sorting;
      const res = await studentsApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        sortBy,
        sortOrder: desc ? 'desc' : 'asc',
      });
      // A newer request (faster typing, another click) has started: drop this stale response.
      if (requestId !== latestRequest.current) return;
      // Deleting the last row of a page leaves it empty: step back one page.
      if (res.data.length === 0 && page > 1) {
        setPage(page - 1);
        return;
      }
      setStudents(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (requestId === latestRequest.current) setError(err.message);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, debouncedSearch, sorting]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const closeDialog = useCallback(() => setDialog(null), []);

  const save = async (values) => {
    if (dialog.mode === 'edit') {
      await studentsApi.update(dialog.student.studentId, values);
      setNotice('Student updated');
    } else {
      await studentsApi.create(values);
      setNotice('Student added');
    }
    setDialog(null);
    await load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await studentsApi.remove(dialog.student.studentId);
      setNotice('Student deleted');
      setDialog(null);
      await load();
    } catch (err) {
      setError(err.message);
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  };

  const firstLoad = loading && meta === null;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">Student Management</h1>
          <button
            onClick={() => setDialog({ mode: 'create' })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + Add student
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <SearchBox value={search} onChange={setSearch} />
        </div>

        {notice && (
          <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={load} className="font-medium underline">
              Retry
            </button>
          </div>
        )}

        {firstLoad ? (
          <p className="py-16 text-center text-slate-500">Loading students…</p>
        ) : (
          !error &&
          (students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
              {debouncedSearch ? (
                <>No students match “{debouncedSearch}”.</>
              ) : (
                <>
                  No students yet. Click <span className="font-medium">Add student</span> to create one.
                </>
              )}
            </div>
          ) : (
            <>
              <StudentTable
                students={students}
                sorting={sorting}
                onSortingChange={changeSorting}
                busy={loading}
                onEdit={(student) => setDialog({ mode: 'edit', student })}
                onDelete={(student) => setDialog({ mode: 'delete', student })}
              />
              <Pagination meta={meta} onPage={setPage} />
            </>
          ))
        )}
      </main>

      {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
        <Modal title={dialog.mode === 'edit' ? 'Edit student' : 'Add student'} onClose={closeDialog}>
          <StudentForm initial={dialog.student} onSubmit={save} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog?.mode === 'delete' && (
        <Modal title="Delete student" onClose={closeDialog}>
          <p className="text-sm text-slate-600">
            Delete <span className="font-semibold text-slate-800">{dialog.student.name}</span>? This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={closeDialog}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
