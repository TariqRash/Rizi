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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import { BuildingsClient, Building } from 'lib/api/buildings';
import { Unit, UnitsClient } from 'lib/api/units';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

const UNIT_TYPES = ['APARTMENT', 'VILLA', 'TOWNHOUSE', 'OFFICE', 'PARKING'] as const;
type UnitType = (typeof UNIT_TYPES)[number];

const UNIT_STATUSES = ['VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'] as const;
type UnitStatus = (typeof UNIT_STATUSES)[number];

export default function UnitsPage() {
  const buildingsApi = useMemo(() => new BuildingsClient(), []);
  const unitsApi = useMemo(() => new UnitsClient(), []);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingIdFilter, setBuildingIdFilter] = useState<string>('');

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  const [createOpen, setCreateOpen] = useState(false);
  const [createBuildingId, setCreateBuildingId] = useState('');
  const [createNumber, setCreateNumber] = useState('');
  const [createType, setCreateType] = useState<UnitType>('APARTMENT');
  const [createStatus, setCreateStatus] = useState<UnitStatus>('VACANT');

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [editType, setEditType] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');

  const loadBuildings = async () => {
    const data = await buildingsApi.list();
    setBuildings(data.buildings ?? []);
    // default create selection
    if (!createBuildingId && data.buildings?.[0]?.id) setCreateBuildingId(data.buildings[0].id);
  };

  const loadUnits = async (buildingId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await unitsApi.list({ buildingId });
      setUnits(data.units ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await loadBuildings();
        await loadUnits(buildingIdFilter || undefined);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload units when filter changes
  useEffect(() => {
    loadUnits(buildingIdFilter || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingIdFilter]);

  const beginEdit = (u: Unit) => {
    setEditing(u);
    setEditNumber(u.number);
    setEditType(u.type);
    setEditStatus(u.status);
    setEditOpen(true);
  };

  const handleCreate = async () => {
    try {
      await unitsApi.create({
        buildingId: createBuildingId,
        number: createNumber,
        type: createType,
        status: createStatus,
      });
      setToast({ open: true, message: 'Unit created', severity: 'success' });
      setCreateOpen(false);
      setCreateNumber('');
      await loadUnits(buildingIdFilter || undefined);
      await loadBuildings(); // refresh counts
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to create unit', severity: 'error' });
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      await unitsApi.update(editing.id, {
        number: editNumber,
        type: editType,
        status: editStatus,
      });
      setToast({ open: true, message: 'Unit updated', severity: 'success' });
      setEditOpen(false);
      setEditing(null);
      await loadUnits(buildingIdFilter || undefined);
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to update unit', severity: 'error' });
    }
  };

  const handleDelete = async (u: Unit) => {
    const confirmed = window.confirm(`Delete unit "${u.number}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await unitsApi.delete(u.id);
      setToast({ open: true, message: 'Unit deleted', severity: 'success' });
      await loadUnits(buildingIdFilter || undefined);
      await loadBuildings(); // refresh counts
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to delete unit', severity: 'error' });
    }
  };

  const buildingNameById = useMemo(() => {
    const map = new Map<string, string>();
    buildings.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [buildings]);

  return (
    <PageContainer title="Units">
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Units belong to a building. Create buildings first, then add unit inventory.
        </Typography>

        <Card variant="outlined">
          <CardHeader title="Filters" />
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <FormControl sx={{ minWidth: 240 }} size="small">
                <InputLabel id="building-filter-label">Building</InputLabel>
                <Select
                  labelId="building-filter-label"
                  label="Building"
                  value={buildingIdFilter}
                  onChange={(e) => setBuildingIdFilter(e.target.value)}
                >
                  <MenuItem value="">All buildings</MenuItem>
                  {buildings.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={buildings.length === 0}>
                  Add unit
                </Button>
              </Box>
            </Stack>
            {buildings.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                You don’t have any buildings yet. Create a building first.
              </Alert>
            )}
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Unit list" />
          <CardContent>
            {loading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : units.length === 0 ? (
              <Typography color="text.secondary">No units yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Unit</TableCell>
                      <TableCell>Building</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {units.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.number}</TableCell>
                        <TableCell>{buildingNameById.get(u.buildingId) ?? u.buildingId}</TableCell>
                        <TableCell>{u.type}</TableCell>
                        <TableCell>{u.status}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => beginEdit(u)} aria-label="Edit unit">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(u)} aria-label="Delete unit">
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
        <DialogTitle>Add unit</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="create-building-label">Building</InputLabel>
            <Select
              labelId="create-building-label"
              label="Building"
              value={createBuildingId}
              onChange={(e) => setCreateBuildingId(e.target.value)}
            >
              {buildings.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Unit number"
            value={createNumber}
            onChange={(e) => setCreateNumber(e.target.value)}
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="create-type-label">Type</InputLabel>
            <Select
              labelId="create-type-label"
              label="Type"
              value={createType}
              onChange={(e) => setCreateType(e.target.value as UnitType)}
            >
              {UNIT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="create-status-label">Status</InputLabel>
            <Select
              labelId="create-status-label"
              label="Status"
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value as UnitStatus)}
            >
              {UNIT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!createNumber.trim() || !createBuildingId}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit unit</DialogTitle>
        <DialogContent>
          <TextField
            label="Unit number"
            value={editNumber}
            onChange={(e) => setEditNumber(e.target.value)}
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-type-label">Type</InputLabel>
            <Select labelId="edit-type-label" label="Type" value={editType} onChange={(e) => setEditType(e.target.value)}>
              {UNIT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-status-label">Status</InputLabel>
            <Select labelId="edit-status-label" label="Status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              {UNIT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={!editNumber.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />
    </PageContainer>
  );
}
