'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import ar from 'locales/ar.json';
import en from 'locales/en.json';

type Locale = 'ar' | 'en';

type TranslationValue = string | TranslationDictionary;
type TranslationDictionary = { [key: string]: TranslationValue };

type I18nContextValue = {
  locale: Locale;
  direction: 'rtl' | 'ltr';
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
};

const dictionaries: Record<Locale, TranslationDictionary> = { ar, en };

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolveKey(locale: Locale, key: string): string {
  const segments = key.split('.');
  let current: TranslationValue | undefined = dictionaries[locale];

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return key;
    }
    current = current[segment];
  }

  if (typeof current === 'string') {
    return current;
  }

  return key;
}

/**
 * Provides translation helpers and locale state to the React tree.
 */
export function I18nProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? 'ar');

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.cookie = `locale=${nextLocale}; path=/`;
  }, []);

  const t = useCallback(
    (key: string) => {
      const value = resolveKey(locale, key);
      if (value !== key) return value;
      // fallback to English if translation missing
      const fallback = resolveKey('en', key);
      return fallback !== key ? fallback : key;
    },
    [locale]
  );

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [direction, locale]);

  const value = useMemo(() => ({ locale, direction, t, setLocale }), [direction, locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to read translation helpers and locale metadata from the i18n context.
 */
export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}
