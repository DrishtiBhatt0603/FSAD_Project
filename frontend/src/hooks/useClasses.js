import { useState, useEffect } from 'react';
import api from '../api/axios';

// Fetches the distinct list of class names that actually exist in the DB.
// Keeps every page in sync with reality instead of a hardcoded array.
export default function useClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/students/classes')
      .then(r => { if (active) setClasses(r.data); })
      .catch(() => { if (active) setClasses([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { classes, loading };
}
