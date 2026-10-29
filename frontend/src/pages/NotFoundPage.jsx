import { ButtonLink } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">Sorry, we couldn’t find the page you’re looking for.</p>
      <ButtonLink to="/students" className="mt-8">
        Go to students
      </ButtonLink>
    </div>
  );
}
