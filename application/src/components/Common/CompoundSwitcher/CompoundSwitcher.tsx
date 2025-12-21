'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';

type CompoundListItem = {
  id: string;
  name: string;
  address: string | null;
  role: string | null;
};

export default function CompoundSwitcher() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compounds, setCompounds] = useState<CompoundListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const hasMultiple = compounds.length > 1;

  const selected = useMemo(
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
        if (!selectedId && list.length) {
          setSelectedId(list[0].id);
        }

        // If user has multiple compounds, we show the switcher button.
        // If they have none, onboarding will handle it.
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load compounds');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasMultiple) return null;

  const onApply = async () => {
    if (!selectedId) return;

    setLoading(true);
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
        throw new Error(data.error || 'Failed to switch compound');
      }

      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to switch compound');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        Select compound
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Select a compound</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              You’re assigned to multiple compounds. Pick the active one for this session.
            </Typography>

            {error ? (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            ) : null}

            <FormControl fullWidth>
              <InputLabel id="compound-select-label">Compound</InputLabel>
              <Select
                labelId="compound-select-label"
                value={selectedId}
                label="Compound"
                onChange={(e) => setSelectedId(String(e.target.value))}
                disabled={loading}
              >
                {compounds.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected?.address ? (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {selected.address}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onApply} variant="contained" disabled={loading || !selectedId}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
