'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import FormButton from 'components/Public/FormButton/FormButton';
import { useRouter } from 'next/navigation';
import { useNavigating } from 'hooks/navigation';

export default function CreateCompoundOnboardingPage() {
  const router = useRouter();
  const { setNavigating } = useNavigating();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNavigating(true);

    try {
      const res = await fetch('/api/onboarding/create-compound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, address }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to create compound');
        return;
      }

      router.replace('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setNavigating(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" px={2} py={4}>
        <Card sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
          <CardContent>
            <Stack spacing={3}>
              <Stack spacing={1} textAlign="center">
                <Typography variant="h4">Create your compound</Typography>
                <Typography variant="body2" color="text.secondary">
                  Set up your first community to start managing units, residents, billing, and operations.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Compound name"
                    placeholder="e.g. Gulf Residences"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <TextField
                    label="Address (optional)"
                    placeholder="City, district, street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  {error && (
                    <Typography color="error" variant="body2" textAlign="center">
                      {error}
                    </Typography>
                  )}

                  <FormButton>Create compound</FormButton>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
