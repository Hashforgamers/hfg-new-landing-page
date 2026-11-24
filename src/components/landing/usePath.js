'use client';

import { useEffect, useState } from 'react';
import { PATH_EVENT, getPath } from '@/lib/paths';

export default function usePath() {
  const [path, set] = useState(null);
  useEffect(() => {
    set(getPath());
    const on = (e) => set(e.detail ?? null);
    window.addEventListener(PATH_EVENT, on);
    return () => window.removeEventListener(PATH_EVENT, on);
  }, []);
  return path;
}
