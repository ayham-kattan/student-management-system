export const formatDate = (iso, options = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  new Date(iso).toLocaleDateString(undefined, options);

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
