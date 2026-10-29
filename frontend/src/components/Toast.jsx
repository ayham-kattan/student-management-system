import { CheckCircleIcon, XIcon } from './icons';

export default function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:justify-end sm:p-6">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_.2s_ease-out] items-center gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-900/5"
      >
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
        <p className="flex-1 text-sm font-medium text-slate-900">{message}</p>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
