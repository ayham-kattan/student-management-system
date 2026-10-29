import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { PencilIcon, TrashIcon } from '../ui/icons';
import { formatDate } from '../../utils/format';

const Muted = () => <span className="text-slate-300">—</span>;

// meta.className styles both the header and the cells of a column (e.g. hiding it on small screens).
const columns = [
  {
    accessorKey: 'studentId',
    header: 'ID',
    cell: (info) => <span className="font-mono text-xs text-slate-400">#{info.getValue()}</span>,
    meta: { className: 'w-16' },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => (
      <Link
        to={`/students/${info.row.original.studentId}`}
        className="group/name flex items-center gap-3 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Avatar name={info.getValue()} />
        <span className="font-medium text-slate-900 group-hover/name:text-indigo-600 group-hover/name:underline">
          {info.getValue()}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: (info) => (info.getValue() ? <span className="tabular-nums text-slate-600">{info.getValue()}</span> : <Muted />),
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: (info) =>
      info.getValue() ? (
        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
          {info.getValue()}
        </span>
      ) : (
        <Muted />
      ),
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    accessorKey: 'createdDate',
    header: 'Created',
    cell: (info) => <span className="whitespace-nowrap text-slate-500">{formatDate(info.getValue())}</span>,
    meta: { className: 'hidden md:table-cell' },
  },
  { id: 'actions', header: 'Actions', enableSorting: false, meta: { className: 'w-24 text-right' } },
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
    <div className={`overflow-x-auto transition-opacity ${busy ? 'opacity-60' : ''}`} aria-busy={busy}>
      <table className="min-w-full text-sm">
        <thead className="border-y border-slate-200 bg-slate-50/80">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                      header.column.columnDef.meta?.className || ''
                    }`}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={`group inline-flex items-center gap-1.5 rounded uppercase tracking-wider outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          sorted ? 'text-indigo-600' : ''
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
            <tr key={row.id} className="group transition-colors hover:bg-slate-50/70">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={`px-5 py-3.5 ${cell.column.columnDef.meta?.className || ''}`}>
                  {cell.column.id === 'actions' ? (
                    <RowActions student={row.original} onEdit={onEdit} onDelete={onDelete} />
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ student, onEdit, onDelete }) {
  const btn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors focus-visible:ring-2';
  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={() => onEdit(student)}
        className={`${btn} hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-indigo-500`}
        aria-label={`Edit ${student.name}`}
        title="Edit"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(student)}
        className={`${btn} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500`}
        aria-label={`Delete ${student.name}`}
        title="Delete"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function SortIcon({ direction }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 16" className="h-3.5 w-2.5">
      <path d="M6 2 10 7H2z" className={direction === 'asc' ? 'fill-indigo-600' : 'fill-slate-300 group-hover:fill-slate-400'} />
      <path d="M6 14 2 9h8z" className={direction === 'desc' ? 'fill-indigo-600' : 'fill-slate-300 group-hover:fill-slate-400'} />
    </svg>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-slate-100 border-t border-slate-200" aria-label="Loading students" role="status">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="h-3 w-8 rounded bg-slate-200" />
          <div className="h-9 w-9 rounded-full bg-slate-200" />
          <div className="h-3 w-40 rounded bg-slate-200" />
          <div className="hidden h-3 w-48 rounded bg-slate-100 sm:block" />
          <div className="ml-auto h-3 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
