'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Stack, Button } from '@mui/material';
import { useI18n } from 'context/I18nContext';

/**
 * ResetPasswordForm renders a form for users to reset their password using a token from the URL.
 * Handles validation, API request, and displays success or error messages.
 */
const ResetPasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth.reset.mismatch'));
      return;
    }
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t('auth.signup.generic'));
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        t('auth.signup.genericError') + (err instanceof Error ? `: ${err.message}` : '')
      );
    }
  };

  if (success) {
    return (
      <Box
        display="flex"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        bgcolor="#f3f4f6"
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                {t('auth.reset.title')}
              </Typography>
              <Typography>
                {t('auth.reset.subtitle')}
              </Typography>
              <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
                {t('auth.login.submit')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center">
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight="bold">
              {t('auth.reset.title')}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label={t('auth.reset.password')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label={t('auth.reset.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  {t('auth.reset.submit')}
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordForm;
