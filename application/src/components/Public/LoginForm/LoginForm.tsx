'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Container,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import FormButton from 'components/Public/FormButton/FormButton';
import { signIn } from 'next-auth/react';
import { useNavigating, usePrefetchRouter } from 'hooks/navigation';
import { useI18n } from 'context/I18nContext';

/**
 * Login form.
 * Handles authentication by credentials and integrates with intelligent navigation.
 */
const LoginForm: React.FC = () => {
  const { navigate } = usePrefetchRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { setNavigating } = useNavigating();

  const handleSubmit = async (e: React.FormEvent) => {
    setNavigating(true);
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      setNavigating(false);
      setError(res?.code || 'Something went wrong');
    } else if (res.ok) {
      navigate('/dashboard/my-notes');
    }
  };
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        px={2}
        py={4}
      >
        <Card sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          <CardContent>
            <Stack spacing={4}>
              {/* Header */}
              <Stack spacing={1.5} textAlign="center">
                <Typography variant="h4" component="h1">
                  {t('auth.login.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('auth.login.subtitle')}
                </Typography>
              </Stack>{' '}
              {/* Form */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                data-testid="login-form"
                autoComplete="on"
              >
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {t('auth.login.email')}
                    </Typography>
                    <TextField
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      autoComplete="email"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {t('auth.login.password')}
                    </Typography>
                    <TextField
                      id="password"
                      name="password"
                      type="password"
                      placeholder={t('auth.login.passwordPlaceholder')}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      autoComplete="current-password"
                      variant="outlined"
                    />
                  </Stack>

                  {error && (
                    <Typography color="error" variant="body2" textAlign="center">
                      {error}
                    </Typography>
                  )}

                  <Box mt={1}>
                    <FormButton>{t('auth.login.submit')}</FormButton>
                  </Box>
                </Stack>
              </Box>
              {/* Links */}
              <Stack spacing={2} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                  {' '}
                  <Typography variant="body2" color="text.secondary">
                    {t('auth.login.noAccount')}
                  </Typography>
                  <MuiLink component={Link} href="/signup" variant="body2" sx={{ fontWeight: 600 }}>
                    {t('auth.login.signup')}
                  </MuiLink>
                </Stack>

                <MuiLink
                  component={Link}
                  href="/forgot-password"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'underline' }}
                >
                  {t('auth.login.forgot')}
                </MuiLink>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginForm;
