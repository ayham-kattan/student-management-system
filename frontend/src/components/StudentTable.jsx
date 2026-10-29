import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

const dash = (v) => v || '—';

const columns = [
  { accessorKey: 'studentId', header: 'ID', meta: { className: 'text-slate-400' } },
  { accessorKey: 'name', header: 'Name', meta: { className: 'font-medium text-slate-800' } },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Phone', cell: (info) => dash(info.getValue()) },
  { accessorKey: 'department', header: 'Department', cell: (info) => dash(info.getValue()) },
  {
    accessorKey: 'createdDate',
    header: 'Created',
    cell: (info) => formatDate(info.getValue()),
    meta: { className: 'whitespace-nowrap text-slate-500' },
  },
  { id: 'actions', header: 'Actions', enableSorting: false, meta: { align: 'right' } },
];

const ARIA_SORT = { asc: 'ascending', desc: 'descending' };

// Sorting is done by the API: the table only shows and changes the sort state.
export default function StudentTable({ students, sorting, onSortingChange, onEdit, onDelete, busy }) {
  const table = useReactTable({
    data: students,
    columns,
    state: { sorting },
    onSortingChange,
    manualSorting: true,
    enableSortingRemoval: false,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.studentId),
  });

  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity ${
        busy ? 'opacity-60' : ''
      }`}
      aria-busy={busy}
    >
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const right = header.column.columnDef.meta?.align === 'right';
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                    className={`px-4 py-3 ${right ? 'text-right' : ''}`}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-800 ${
                          sorted ? 'text-slate-800' : ''
                        }`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon direction={sorted} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {row.getVisibleCells().map((cell) =>
                cell.column.id === 'actions' ? (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => onEdit(row.original)}
                      className="rounded px-2 py-1 font-medium text-blue-600 hover:bg-blue-50"
                      aria-label={`Edit ${row.original.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(row.original)}
                      className="ml-1 rounded px-2 py-1 font-medium text-red-600 hover:bg-red-50"
                      aria-label={`Delete ${row.original.name}`}
                    >
                      Delete
                    </button>
                  </td>
                ) : (
                  <td
                    key={cell.id}
                    className={`px-4 py-3 text-slate-600 ${cell.column.columnDef.meta?.className || ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ direction }) {
  return (
    <span aria-hidden="true" className="inline-flex flex-col text-[8px] leading-[7px]">
      <span className={direction === 'asc' ? 'text-blue-600' : 'text-slate-300'}>▲</span>
      <span className={direction === 'desc' ? 'text-blue-600' : 'text-slate-300'}>▼</span>
    </span>
  );
}
