import { useEffect, useRef, useState } from 'react';
import { studentsApi } from '../api/students';
import PageHeader from '../components/layout/PageHeader';
import DeleteStudentDialog from '../components/students/DeleteStudentDialog';
import StudentFormModal from '../components/students/StudentFormModal';
import StudentsEmptyState from '../components/students/StudentsEmptyState';
import StudentTable, { TableSkeleton } from '../components/students/StudentTable';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/ui/Pagination';
import SearchBox from '../components/ui/SearchBox';
import { PlusIcon } from '../components/ui/icons';
import { useToast } from '../context/ToastContext';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useStudentListParams from '../hooks/useStudentListParams';
import useStudents from '../hooks/useStudents';

const PAGE_SIZE = 10;

export default function StudentsPage() {
  const { page, search, sortBy, sortOrder, setPage, setSearch, setSort } = useStudentListParams();
  const { students, meta, loading, error, reload } = useStudents({ page, limit: PAGE_SIZE, search, sortBy, sortOrder });
  const { notify } = useToast();
  // { mode: 'create' } | { mode: 'edit', student } | { mode: 'delete', student } | null
  const [dialog, setDialog] = useState(null);

  // The input updates on every keystroke; the URL (and the API call) only after typing pauses.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const lastDebounced = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === lastDebounced.current) return;
    lastDebounced.current = debouncedSearch;
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);
  // Back/forward changed the URL: show that search in the box.
  useEffect(() => {
    setSearchInput((current) => (current.trim() === search ? current : search));
  }, [search]);

  // Page past the end (last row deleted, or an old link): jump to the last page.
  useEffect(() => {
    const lastPage = Math.max(meta?.totalPages || 1, 1);
    if (!loading && meta && page > lastPage) setPage(lastPage);
  }, [loading, meta, page, setPage]);

  const sorting = [{ id: sortBy, desc: sortOrder === 'desc' }];
  const changeSorting = (updater) => {
    const [next] = typeof updater === 'function' ? updater(sorting) : updater;
    if (next) setSort(next.id, next.desc ? 'desc' : 'asc');
  };

  const closeDialog = () => setDialog(null);

  const saveStudent = async (values) => {
    if (dialog.mode === 'edit') {
      await studentsApi.update(dialog.student.studentId, values);
      notify('Student updated');
    } else {
      await studentsApi.create(values);
      notify('Student added');
    }
    closeDialog();
    reload();
  };

  const deleteStudent = async () => {
    await studentsApi.remove(dialog.student.studentId);
    notify('Student deleted');
    closeDialog();
    reload();
  };

  const firstLoad = loading && meta === null;
  const openCreate = () => setDialog({ mode: 'create' });

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={
          meta
            ? `${meta.total} ${meta.total === 1 ? 'student' : 'students'}${search ? ` matching “${search}”` : ' enrolled'}`
            : 'Manage student records'
        }
        actions={
          <Button size="lg" onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            Add student
          </Button>
        }
      />

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 px-5 py-4">
          <SearchBox value={searchInput} onChange={setSearchInput} />
        </div>

        {error ? (
          <div className="border-t border-slate-200">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : firstLoad ? (
          <TableSkeleton />
        ) : students.length === 0 ? (
          <StudentsEmptyState search={search} onAdd={openCreate} onClear={() => setSearchInput('')} />
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

      {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
        <StudentFormModal student={dialog.student} onSubmit={saveStudent} onClose={closeDialog} />
      )}
      {dialog?.mode === 'delete' && (
        <DeleteStudentDialog student={dialog.student} onConfirm={deleteStudent} onClose={closeDialog} />
      )}
    </>
  );
}
