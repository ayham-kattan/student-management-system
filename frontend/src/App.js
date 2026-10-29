import { useCallback, useEffect, useRef, useState } from 'react';
import { studentsApi } from './api/students';
import Modal from './components/Modal';
import Pagination from './components/Pagination';
import SearchBox from './components/SearchBox';
import StudentForm from './components/StudentForm';
import StudentTable, { TableSkeleton } from './components/StudentTable';
import Toast from './components/Toast';
import { AcademicCapIcon, AlertIcon, PlusIcon, SearchIcon, TrashIcon, UsersIcon } from './components/icons';
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
  const openCreate = () => setDialog({ mode: 'create' });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <AcademicCapIcon className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold text-slate-900">Student Management</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Students</h1>
            <p className="mt-1 text-sm text-slate-500">
              {meta ? (
                <>
                  {meta.total} {meta.total === 1 ? 'student' : 'students'}
                  {debouncedSearch ? ` matching “${debouncedSearch}”` : ' enrolled'}
                </>
              ) : (
                'Manage student records'
              )}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-4 w-4" />
            Add student
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3 px-5 py-4">
            <SearchBox value={search} onChange={setSearch} />
          </div>

          {error ? (
            <div role="alert" className="flex flex-col items-center gap-3 border-t border-slate-200 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertIcon className="h-6 w-6" />
              </span>
              <p className="text-sm text-slate-700">{error}</p>
              <button
                onClick={load}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : firstLoad ? (
            <TableSkeleton />
          ) : students.length === 0 ? (
            <EmptyState search={debouncedSearch} onAdd={openCreate} onClear={() => setSearch('')} />
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
          )}
        </section>
      </main>

      <Toast message={notice} onClose={() => setNotice('')} />

      {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
        <Modal
          title={dialog.mode === 'edit' ? 'Edit student' : 'Add student'}
          description={dialog.mode === 'edit' ? 'Update the student’s details.' : 'Fill in the details of the new student.'}
          onClose={closeDialog}
        >
          <StudentForm initial={dialog.student} onSubmit={save} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog?.mode === 'delete' && (
        <Modal title="Delete student" onClose={closeDialog}>
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TrashIcon className="h-5 w-5" />
            </span>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{dialog.student.name}</span>? This
              action can’t be undone.
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={closeDialog}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmptyState({ search, onAdd, onClear }) {
  return (
    <div className="flex flex-col items-center border-t border-slate-200 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {search ? <SearchIcon className="h-6 w-6" /> : <UsersIcon className="h-6 w-6" />}
      </span>
      {search ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No students match “{search}”.</h3>
          <p className="mt-1 text-sm text-slate-500">Try a different name or email.</p>
          <button onClick={onClear} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Clear search
          </button>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No students yet.</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by adding the first student.</p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4" />
            Add student
          </button>
        </>
      )}
    </div>
  );
}

export default App;
