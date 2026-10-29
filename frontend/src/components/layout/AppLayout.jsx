import { Link, NavLink, Outlet } from 'react-router-dom';
import { AcademicCapIcon } from '../ui/icons';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <AcademicCapIcon className="h-5 w-5" />
            </span>
            <span className="hidden text-base font-semibold text-slate-900 sm:inline">Student Management</span>
          </Link>
          <nav aria-label="Main">
            <NavLink to="/students" className={navClass}>
              Students
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
