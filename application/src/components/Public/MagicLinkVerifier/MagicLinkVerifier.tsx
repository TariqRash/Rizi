'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useI18n } from 'context/I18nContext';

/**
 * MagicLinkVerifier
 *
 * This component verifies a magic link for passwordless authentication. It reads the token and email from the URL query parameters,
 * calls the signIn function with the credentials provider, and redirects the user to the home page on success. Displays loading,
 * success, and error states to the user.
 */
export default function MagicLinkVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (!token || !email) {
      setStatus('error');
      setError(t('auth.signup.genericError'));
      return;
    }

    const verifyMagicLink = async () => {
      try {
        await signIn('credentials', { email, magicLinkToken: token, redirect: false });
        setStatus('success');
        router.replace('/');
      } catch (err) {
        setStatus('error');
        setError(
          t('auth.signup.genericError') + (err instanceof Error ? ` ${err.message}` : '')
        );
      }
    };

    verifyMagicLink();
  }, [router, searchParams, t]);

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      {status === 'verifying' && <div>{t('auth.magic.title')}</div>}
      {status === 'success' && <div>{t('auth.magic.subtitle')}</div>}
      {status === 'error' && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
