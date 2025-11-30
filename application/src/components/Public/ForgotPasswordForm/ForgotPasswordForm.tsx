'use client';

import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Box, Button } from '@mui/material';
import FormButton from 'components/Public/FormButton/FormButton';
import { useNavigating } from 'hooks/navigation';
import { useI18n } from 'context/I18nContext';

/**
 * Forgot Password form.
 * Handles sending email for password reset and passwordless authentication.
 */
const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [magicLinkSuccess, setMagicLinkSuccess] = useState<string | null>(null);
  const { setNavigating } = useNavigating();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t('auth.signup.genericError'));
      } else {
        setSuccess(t('auth.forgot.subtitle'));
      }
    } catch (err) {
      setError(
        t('auth.signup.genericError') + (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setMagicLinkSuccess(null);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t('auth.signup.genericError'));
      } else {
        setMagicLinkSuccess(t('auth.magic.subtitle'));
      }
    } catch (err) {
      setError(
        t('auth.signup.genericError') + (err instanceof Error ? `: ${err.message}` : '')
      );
    } finally {
      setNavigating(false);
    }
  };

  return (
    <Box display="flex" flexGrow={1} minHeight="100vh" justifyContent="center" alignItems="center">
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <Box display="flex" flexDirection="column" gap={1.5} p={3}>
          <Typography fontWeight="bold" variant="h5">
            {t('auth.forgot.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('auth.forgot.subtitle')}
          </Typography>
        </Box>
        <CardContent sx={{ p: 3, pt: 0, pb: 1 }}>
          <form onSubmit={handleSubmit} data-testid="forgot-password-form">
            <Box display="grid" gap={2}>
              <Box display="flex" flexDirection="column" gap={1}>
                <label htmlFor="email" style={{ fontSize: 14, lineHeight: 1.5 }}>
                  {t('auth.forgot.email')}
                </label>
                <TextField
                  id="email"
                  type="email"
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>

            {error && (
              <Typography color="error" fontSize={14} mt={2}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success" fontSize={14} mt={2}>
                {success}
              </Typography>
            )}
            {magicLinkSuccess && (
              <Typography color="success" fontSize={14} mt={2}>
                {magicLinkSuccess}
              </Typography>
            )}

            <Box mt={3} display="flex" flexDirection="column" gap={2}>
              <FormButton>{t('auth.forgot.submit')}</FormButton>
              <Button
                type="button"
                onClick={handleMagicLink}
                variant="outlined"
                fullWidth
                size="large"
                sx={{ textTransform: 'none' }}
              >
                {t('auth.magic.title')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordForm;
