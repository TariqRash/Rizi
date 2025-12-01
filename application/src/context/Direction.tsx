'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Direction = 'ltr' | 'rtl';

interface DirectionContextValue {
  direction: Direction;
  toggleDirection: () => void;
  setDirection: (dir: Direction) => void;
}

const DirectionContext = createContext<DirectionContextValue | null>(null);
const STORAGE_KEY = 'rizi-direction';

export const DirectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [direction, setDirectionState] = useState<Direction>('rtl');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Direction | null;
    if (stored === 'ltr' || stored === 'rtl') {
      setDirectionState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('dir', direction);
    document.body?.setAttribute('data-direction', direction);
    window.localStorage.setItem(STORAGE_KEY, direction);
  }, [direction]);

  const toggleDirection = () => setDirectionState((prev) => (prev === 'rtl' ? 'ltr' : 'rtl'));
  const setDirection = (dir: Direction) => setDirectionState(dir);

  const value = useMemo(
    () => ({
      direction,
      toggleDirection,
      setDirection,
    }),
    [direction]
  );

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
};

export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
};
