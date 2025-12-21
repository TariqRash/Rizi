'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useNavigating } from 'hooks/navigation';

type CompoundListItem = {
  id: string;
  name: string;
  address: string | null;
  role: string | null;
};

export default function SelectCompoundPage() {
  const router = useRouter();
  const { setNavigating } = useNavigating();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compounds, setCompounds] = useState<CompoundListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCompound = useMemo(
    () => compounds.find((c) => c.id === selectedId) ?? null,
    [compounds, selectedId]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/compounds/my', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load compounds');
        }

        const list = (data.compounds ?? []) as CompoundListItem[];
        if (cancelled) return;

        setCompounds(list);

        // If user has exactly one compound, auto-select and continue.
        if (list.length === 1) {
          const onlyId = list[0].id;
          setSelectedId(onlyId);
          await fetch('/api/compounds/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ compoundId: onlyId }),
          });
          router.replace('/dashboard');
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onContinue = async () => {
    if (!selectedId) {
      setError('Please select a compound to continue.');
      return;
    }

    setNavigating(true);
    setError(null);

    try {
      const res = await fetch('/api/compounds/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ compoundId: selectedId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to select compound');
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
    <Container maxWidth="md">
      <Box py={6}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h4">Select a compound</Typography>
            <Typography variant="body2" color="text.secondary">
              You belong to multiple compounds. Choose which one you’d like to manage right now.
            </Typography>
          </Stack>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading compounds…
            </Typography>
          ) : compounds.length === 0 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                No compounds found for your account.
              </Typography>
              <Button variant="contained" fullWidth size="large" onClick={() => router.replace('/onboarding/compound')}>
                Create your first compound
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {compounds.map((compound) => {
                const selected = compound.id === selectedId;
                return (
                  <Card
                    key={compound.id}
                    variant="outlined"
                    sx={{
                      borderColor: selected ? 'primary.main' : 'divider',
                      boxShadow: selected ? 2 : 0,
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedId(compound.id)}>
                      <CardContent>
                        <Stack spacing={0.5}>
                          <Typography variant="h6">{compound.name}</Typography>
                          {compound.address ? (
                            <Typography variant="body2" color="text.secondary">
                              {compound.address}
                            </Typography>
                          ) : null}
                          {compound.role ? (
                            <Typography variant="caption" color="text.secondary">
                              Role: {compound.role}
                            </Typography>
                          ) : null}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="contained" disabled={!selectedCompound || loading} onClick={onContinue}>
              Continue
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
