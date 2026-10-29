import { useCallback, useEffect, useState } from 'react';
import { studentsApi } from './api/students';
import Modal from './components/Modal';
import Pagination from './components/Pagination';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';

const PAGE_SIZE = 10;

function App() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // { mode: 'create' } | { mode: 'edit', student } | { mode: 'delete', student } | null
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError('');
    try {
      const res = await studentsApi.list(p, PAGE_SIZE);
      // Deleting the last row of a page leaves it empty: step back one page.
      if (res.data.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setStudents(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

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
      await load(page);
    } else {
      await studentsApi.create(values);
      setNotice('Student added');
      // Newest students are listed first
      if (page === 1) await load(1);
      else setPage(1);
    }
    setDialog(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await studentsApi.remove(dialog.student.studentId);
      setNotice('Student deleted');
      setDialog(null);
      await load(page);
    } catch (err) {
      setError(err.message);
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  };

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
        {notice && (
          <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => load(page)} className="font-medium underline">
              Retry
            </button>
          </div>
        )}

        {loading && students.length === 0 ? (
          <p className="py-16 text-center text-slate-500">Loading students…</p>
        ) : (
          !error && (
            <>
              <StudentTable
                students={students}
                onEdit={(student) => setDialog({ mode: 'edit', student })}
                onDelete={(student) => setDialog({ mode: 'delete', student })}
              />
              <Pagination meta={meta} onPage={setPage} />
            </>
          )
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
