'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import { BuildingsClient, Building } from 'lib/api/buildings';
import { buildingNameSchema } from 'lib/validation/buildings';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

export default function BuildingsPage() {
  const api = useMemo(() => new BuildingsClient(), []);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState<Building | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setBuildings(data.buildings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    try {
      const parsedName = buildingNameSchema.safeParse(createName);
      if (!parsedName.success) {
        setToast({ open: true, message: parsedName.error.issues?.[0]?.message ?? 'Invalid building name', severity: 'error' });
        return;
      }

      await api.create({ name: parsedName.data });
      setToast({ open: true, message: 'Building created', severity: 'success' });
      setCreateOpen(false);
      setCreateName('');
      await load();
    } catch (e) {
      setToast({
        open: true,
        message: e instanceof Error ? e.message : 'Failed to create building',
        severity: 'error',
      });
    }
  };

  const beginEdit = (b: Building) => {
    setEditing(b);
    setEditName(b.name);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      const parsedName = buildingNameSchema.safeParse(editName);
      if (!parsedName.success) {
        setToast({ open: true, message: parsedName.error.issues?.[0]?.message ?? 'Invalid building name', severity: 'error' });
        return;
      }

      await api.update(editing.id, { name: parsedName.data });
      setToast({ open: true, message: 'Building updated', severity: 'success' });
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to update building', severity: 'error' });
    }
  };

  const handleDelete = async (b: Building) => {
    const confirmed = window.confirm(`Delete building "${b.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(b.id);
      setToast({ open: true, message: 'Building deleted', severity: 'success' });
      await load();
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to delete building', severity: 'error' });
    }
  };

  return (
    <PageContainer title="Buildings">
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Buildings are compound-scoped. You can’t delete a building that already has units.
        </Typography>

        <Box>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add building
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Building list" />
          <CardContent>
            {loading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : buildings.length === 0 ? (
              <Typography color="text.secondary">No buildings yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Units</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {buildings.map((b) => (
                      <TableRow key={b.id} hover>
                        <TableCell>{b.name}</TableCell>
                        <TableCell>{b._count?.units ?? 0}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => beginEdit(b)} aria-label="Edit building">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(b)} aria-label="Delete building">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add building</DialogTitle>
        <DialogContent>
          <TextField
            label="Building name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            autoFocus
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!createName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit building</DialogTitle>
        <DialogContent>
          <TextField
            label="Building name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={!editName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((p) => ({ ...p, open: false }))} />
    </PageContainer>
  );
}
