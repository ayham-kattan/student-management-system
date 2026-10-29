import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = { page: 1, search: '', sortBy: 'studentId', sortOrder: 'desc' };
const SORTABLE = ['studentId', 'name', 'email', 'phone', 'department', 'createdDate'];

// List state lives in the URL (?page=2&search=ali&sortBy=name&sortOrder=asc),
// so back/forward, refresh and shared links all keep the same view.
export default function useStudentListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    return {
      page: Math.max(parseInt(searchParams.get('page')) || DEFAULTS.page, 1),
      search: searchParams.get('search') || DEFAULTS.search,
      sortBy: SORTABLE.includes(sortBy) ? sortBy : DEFAULTS.sortBy,
      sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : DEFAULTS.sortOrder,
    };
  }, [searchParams]);

  // Writes only non-default values to keep URLs short; page resets unless it's the thing changing.
  const update = useCallback(
    (changes, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!('page' in changes)) next.delete('page');
          for (const [key, value] of Object.entries(changes)) {
            if (value === DEFAULTS[key] || value === '' || value == null) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback((page) => update({ page }), [update]);
  const setSearch = useCallback((search) => update({ search }, { replace: true }), [update]);
  const setSort = useCallback((sortBy, sortOrder) => update({ sortBy, sortOrder }), [update]);

  return { ...params, setPage, setSearch, setSort };
}
