import { useCallback, useEffect, useRef, useState } from 'react';
import { studentsApi } from '../api/students';

// Loads one page of students for the given search/sort/page and exposes `reload` for after writes.
export default function useStudents({ page, limit, search, sortBy, sortOrder }) {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const res = await studentsApi.list({ page, limit, search, sortBy, sortOrder });
      // A newer request (faster typing, another click) has started: drop this stale response.
      if (requestId !== latestRequest.current) return;
      setStudents(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (requestId === latestRequest.current) setError(err.message);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { students, meta, loading, error, reload };
}
