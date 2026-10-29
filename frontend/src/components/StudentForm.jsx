import { useState } from 'react';
import { AlertIcon } from './icons';

const FIELDS = [
  { name: 'name', label: 'Full name', type: 'text', required: true, maxLength: 100, placeholder: 'Ayham Kattan', wide: true },
  { name: 'email', label: 'Email', type: 'email', required: true, maxLength: 100, placeholder: 'name@example.com', wide: true },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 20, placeholder: '+968 9123 4567' },
  { name: 'department', label: 'Department', type: 'text', maxLength: 50, placeholder: 'Computer Science' },
];

const EMPTY = { name: '', email: '', phone: '', department: '' };

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => ({ ...EMPTY, ...stripNulls(initial) }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await onSubmit(values);
    } catch (err) {
      // Show server-side validation next to each field; 409 belongs to the email field.
      if (err.status === 409) setErrors({ email: err.message });
      else if (Object.keys(err.details || {}).length) setErrors(err.details);
      else setFormError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.wide ? 'sm:col-span-2' : ''}>
            <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium text-slate-700">
              {f.label} {f.required ? <span className="text-red-500">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              value={values[f.name]}
              onChange={change}
              maxLength={f.maxLength}
              placeholder={f.placeholder}
              aria-invalid={Boolean(errors[f.name])}
              aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
              className={`block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-inset ${
                errors[f.name] ? 'ring-red-300 focus:ring-red-500' : 'ring-slate-300 focus:ring-indigo-500'
              }`}
            />
            {errors[f.name] && (
              <p id={`${f.name}-error`} className="mt-1.5 text-xs text-red-600">
                {errors[f.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      {formError && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function stripNulls(obj = {}) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v ?? '']));
}
