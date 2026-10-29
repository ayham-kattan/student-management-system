import { useState } from 'react';

const FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 },
  { name: 'email', label: 'Email', type: 'email', required: true, maxLength: 100 },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 20, placeholder: '+968 9123 4567' },
  { name: 'department', label: 'Department', type: 'text', maxLength: 50 },
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
    <form onSubmit={submit} noValidate className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-slate-700">
            {f.label} {f.required && <span className="text-red-500">*</span>}
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
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors[f.name]
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
          {errors[f.name] && (
            <p id={`${f.name}-error`} className="mt-1 text-xs text-red-600">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
