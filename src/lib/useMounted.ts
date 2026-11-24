import { useState, useEffect } from 'react';

/**
 * Hook to determine if the component has mounted on the client.
 * Essential for preventing React hydration errors (418, 423, 425)
 * when rendering dynamic time, locales, or client storage.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
