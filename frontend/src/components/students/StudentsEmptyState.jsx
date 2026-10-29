import Button from '../ui/Button';
import { PlusIcon, SearchIcon, UsersIcon } from '../ui/icons';

export default function StudentsEmptyState({ search, onAdd, onClear }) {
  return (
    <div className="flex flex-col items-center border-t border-slate-200 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {search ? <SearchIcon className="h-6 w-6" /> : <UsersIcon className="h-6 w-6" />}
      </span>
      {search ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No students match “{search}”.</h3>
          <p className="mt-1 text-sm text-slate-500">Try a different name or email.</p>
          <Button variant="ghost" className="mt-4" onClick={onClear}>
            Clear search
          </Button>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">No students yet.</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by adding the first student.</p>
          <Button className="mt-4" onClick={onAdd}>
            <PlusIcon className="h-4 w-4" />
            Add student
          </Button>
        </>
      )}
    </div>
  );
}
