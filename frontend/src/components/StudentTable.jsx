const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function StudentTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        No students yet. Click <span className="font-medium">Add student</span> to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((s) => (
            <tr key={s.studentId} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-400">{s.studentId}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
              <td className="px-4 py-3 text-slate-600">{s.email}</td>
              <td className="px-4 py-3 text-slate-600">{s.phone || '—'}</td>
              <td className="px-4 py-3 text-slate-600">{s.department || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(s.createdDate)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  onClick={() => onEdit(s)}
                  className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50"
                  aria-label={`Edit ${s.name}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(s)}
                  className="ml-1 rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${s.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
