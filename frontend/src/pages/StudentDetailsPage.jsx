import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { studentsApi } from '../api/students';
import PageHeader from '../components/layout/PageHeader';
import DeleteStudentDialog from '../components/students/DeleteStudentDialog';
import StudentFormModal from '../components/students/StudentFormModal';
import Avatar from '../components/ui/Avatar';
import Button, { ButtonLink } from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import { PencilIcon, TrashIcon, UsersIcon } from '../components/ui/icons';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/format';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState(null); // 'edit' | 'delete' | null

  const load = useCallback(async () => {
    setError(null);
    try {
      setStudent(await studentsApi.get(id));
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => {
    setStudent(null);
    load();
  }, [load]);

  const save = async (values) => {
    setStudent(await studentsApi.update(id, values));
    notify('Student updated');
    setDialog(null);
  };

  const remove = async () => {
    await studentsApi.remove(id);
    notify('Student deleted');
    navigate('/students', { replace: true });
  };

  if (error?.status === 404 || error?.status === 400) return <StudentNotFound />;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm">
        <Link to="/students" className="font-medium text-slate-500 hover:text-slate-900">
          ← Back to students
        </Link>
      </nav>

      {error ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <ErrorState message={error.message} onRetry={load} />
        </div>
      ) : !student ? (
        <DetailsSkeleton />
      ) : (
        <>
          <PageHeader
            title={student.name}
            subtitle={`Student #${student.studentId}`}
            actions={
              <>
                <Button variant="secondary" onClick={() => setDialog('edit')}>
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" onClick={() => setDialog('delete')}>
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
              </>
            }
          >
            <div className="mb-3">
              <Avatar name={student.name} size="lg" />
            </div>
          </PageHeader>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <h2 className="border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-900">Student details</h2>
            <dl className="divide-y divide-slate-100">
              <Field label="Full name" value={student.name} />
              <Field
                label="Email"
                value={
                  <a href={`mailto:${student.email}`} className="text-indigo-600 hover:underline">
                    {student.email}
                  </a>
                }
              />
              <Field label="Phone" value={student.phone} />
              <Field label="Department" value={student.department} />
              <Field label="Created" value={formatDateTime(student.createdDate)} />
            </dl>
          </section>
        </>
      )}

      {dialog === 'edit' && <StudentFormModal student={student} onSubmit={save} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <DeleteStudentDialog student={student} onConfirm={remove} onClose={() => setDialog(null)} />
      )}
    </>
  );
}

function Field({ label, value }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2">{value || <span className="text-slate-300">—</span>}</dd>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading student" className="animate-pulse">
      <div className="mb-3 h-14 w-14 rounded-full bg-slate-200" />
      <div className="mb-2 h-6 w-56 rounded bg-slate-200" />
      <div className="mb-6 h-4 w-28 rounded bg-slate-100" />
      <div className="h-72 rounded-2xl bg-white ring-1 ring-slate-200" />
    </div>
  );
}

function StudentNotFound() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <UsersIcon className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-slate-900">Student not found</h1>
      <p className="mt-1 text-sm text-slate-500">It may have been deleted, or the link is wrong.</p>
      <ButtonLink to="/students" className="mt-6">
        Back to students
      </ButtonLink>
    </div>
  );
}
