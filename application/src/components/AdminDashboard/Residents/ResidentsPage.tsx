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
  Chip,
  Divider,
} from '@mui/material';
import { Delete, Edit, Group } from '@mui/icons-material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import { BuildingsClient, Building } from 'lib/api/buildings';
import { Unit, UnitsClient } from 'lib/api/units';
import { HouseholdMember, Resident, ResidentsClient } from 'lib/api/residents';

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

export default function ResidentsPage() {
  const buildingsApi = useMemo(() => new BuildingsClient(), []);
  const unitsApi = useMemo(() => new UnitsClient(), []);
  const residentsApi = useMemo(() => new ResidentsClient(), []);

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [buildingIdFilter, setBuildingIdFilter] = useState<string>('');
  const [unitIdFilter, setUnitIdFilter] = useState<string>('');
  const [q, setQ] = useState<string>('');

  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({ open: false, message: '', severity: 'info' });

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignBuildingId, setAssignBuildingId] = useState('');
  const [assignUnitId, setAssignUnitId] = useState('');
  const [assignPrimary, setAssignPrimary] = useState<'true' | 'false'>('false');

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [editPrimary, setEditPrimary] = useState<'true' | 'false'>('false');
  const [editMoveOut, setEditMoveOut] = useState<string>('');

  // Household dialog
  const [householdOpen, setHouseholdOpen] = useState(false);
  const [householdResident, setHouseholdResident] = useState<Resident | null>(null);
  const [household, setHousehold] = useState<HouseholdMember[]>([]);
  const [hhName, setHhName] = useState('');
  const [hhRelation, setHhRelation] = useState('');
  const [hhPhone, setHhPhone] = useState('');

  const loadBuildings = async () => {
    const data = await buildingsApi.list();
    setBuildings(data.buildings ?? []);

    if (!assignBuildingId && data.buildings?.[0]?.id) {
      setAssignBuildingId(data.buildings[0].id);
    }
  };

  const loadUnits = async (buildingId?: string) => {
    const data = await unitsApi.list({ buildingId });
    setUnits(data.units ?? []);

    // default assign selection after units load
    if (!assignUnitId && data.units?.[0]?.id) {
      setAssignUnitId(data.units[0].id);
    }
  };

  const loadResidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await residentsApi.list({
        buildingId: buildingIdFilter || undefined,
        unitId: unitIdFilter || undefined,
        q: q.trim() || undefined,
      });
      setResidents(data.residents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await loadBuildings();
        await loadUnits(buildingIdFilter || undefined);
        await loadResidents();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When filter building changes, refresh units + clear unit filter if needed
    (async () => {
      await loadUnits(buildingIdFilter || undefined);
      if (unitIdFilter) {
        const stillExists = units.some((u) => u.id === unitIdFilter);
        if (!stillExists) setUnitIdFilter('');
      }
      await loadResidents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingIdFilter]);

  useEffect(() => {
    loadResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitIdFilter]);

  const buildingName = (id: string) => buildings.find((b) => b.id === id)?.name ?? id;
  const unitNumber = (id: string) => units.find((u) => u.id === id)?.number ?? residents.find((r) => r.unitId === id)?.unit?.number ?? id;

  const unitsForBuilding = (buildingId: string) => units.filter((u) => u.buildingId === buildingId);

  const openAssign = () => {
    setAssignOpen(true);
    if (assignBuildingId) {
      const firstUnit = unitsForBuilding(assignBuildingId)[0];
      if (firstUnit?.id) setAssignUnitId(firstUnit.id);
    }
  };

  const handleAssign = async () => {
    try {
      await residentsApi.assign({
        userId: assignUserId.trim(),
        unitId: assignUnitId,
        isPrimary: assignPrimary === 'true',
      });
      setToast({ open: true, message: 'Resident assigned', severity: 'success' });
      setAssignOpen(false);
      setAssignUserId('');
      setAssignPrimary('false');
      await loadResidents();
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to assign resident', severity: 'error' });
    }
  };

  const beginEdit = (r: Resident) => {
    setEditing(r);
    setEditPrimary(r.isPrimary ? 'true' : 'false');
    setEditMoveOut(r.moveOutDate ? r.moveOutDate.slice(0, 10) : '');
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      await residentsApi.update(editing.id, {
        isPrimary: editPrimary === 'true',
        moveOutDate: editMoveOut ? new Date(editMoveOut).toISOString() : null,
      });
      setToast({ open: true, message: 'Resident updated', severity: 'success' });
      setEditOpen(false);
      setEditing(null);
      await loadResidents();
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to update resident', severity: 'error' });
    }
  };

  const handleDelete = async (r: Resident) => {
    const confirmed = window.confirm(`Remove resident "${r.user?.name ?? r.userId}" from unit ${r.unit?.number ?? r.unitId}?`);
    if (!confirmed) return;

    try {
      await residentsApi.remove(r.id);
      setToast({ open: true, message: 'Resident removed', severity: 'success' });
      await loadResidents();
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to remove resident', severity: 'error' });
    }
  };

  const openHousehold = async (r: Resident) => {
    setHouseholdResident(r);
    setHouseholdOpen(true);
    setHousehold([]);

    try {
      const data = await residentsApi.listHousehold(r.id);
      setHousehold(data.household ?? []);
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to load household', severity: 'error' });
    }
  };

  const handleAddHousehold = async () => {
    if (!householdResident) return;
    try {
      await residentsApi.addHouseholdMember(householdResident.id, {
        name: hhName.trim(),
        relation: hhRelation.trim(),
        phone: hhPhone.trim() || undefined,
      });
      setToast({ open: true, message: 'Household member added', severity: 'success' });
      setHhName('');
      setHhRelation('');
      setHhPhone('');
      const data = await residentsApi.listHousehold(householdResident.id);
      setHousehold(data.household ?? []);
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to add household member', severity: 'error' });
    }
  };

  const handleDeleteHousehold = async (m: HouseholdMember) => {
    const confirmed = window.confirm(`Delete household member "${m.name}"?`);
    if (!confirmed) return;

    try {
      await residentsApi.deleteHouseholdMember(m.id);
      setToast({ open: true, message: 'Household member deleted', severity: 'success' });
      if (householdResident) {
        const data = await residentsApi.listHousehold(householdResident.id);
        setHousehold(data.household ?? []);
      }
    } catch (e) {
      setToast({ open: true, message: e instanceof Error ? e.message : 'Failed to delete household member', severity: 'error' });
    }
  };

  const primaryChip = (r: Resident) => (r.isPrimary ? <Chip size="small" color="primary" label="Primary" /> : null);

  return (
    <PageContainer title="Residents">
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Assign residents to units. Each unit can have multiple residents, but only one primary resident.
          Dependents (تابعين) are stored as household members under the primary person.
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

              <FormControl sx={{ minWidth: 240 }} size="small">
                <InputLabel id="unit-filter-label">Unit</InputLabel>
                <Select
                  labelId="unit-filter-label"
                  label="Unit"
                  value={unitIdFilter}
                  onChange={(e) => setUnitIdFilter(e.target.value)}
                >
                  <MenuItem value="">All units</MenuItem>
                  {units
                    .filter((u) => !buildingIdFilter || u.buildingId === buildingIdFilter)
                    .map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.number}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Search (name/email)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadResidents();
                }}
              />

              <Box>
                <Button variant="outlined" onClick={() => loadResidents()}>
                  Search
                </Button>
              </Box>

              <Box>
                <Button variant="contained" onClick={openAssign}>
                  Assign resident
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {error && <Alert severity="error">{error}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Resident assignments" />
          <CardContent>
            {loading ? (
              <Typography color="text.secondary">Loading…</Typography>
            ) : residents.length === 0 ? (
              <Typography color="text.secondary">No residents assigned yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Resident</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Building</TableCell>
                      <TableCell>Primary</TableCell>
                      <TableCell>Move out</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {residents.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography>{r.user?.name ?? r.userId}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {r.user?.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{r.unit?.number ?? unitNumber(r.unitId)}</TableCell>
                        <TableCell>
                          {r.unit?.buildingId ? buildingName(r.unit.buildingId) : buildingIdFilter ? buildingName(buildingIdFilter) : '—'}
                        </TableCell>
                        <TableCell>{primaryChip(r)}</TableCell>
                        <TableCell>{r.moveOutDate ? r.moveOutDate.slice(0, 10) : '—'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton size="small" onClick={() => openHousehold(r)} aria-label="Household">
                              <Group fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => beginEdit(r)} aria-label="Edit">
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(r)} aria-label="Delete">
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

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign resident</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter an existing userId to assign. (Next step: invite/create users from this screen.)
          </Alert>

          <TextField
            label="User ID"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth margin="normal">
            <InputLabel id="assign-building-label">Building</InputLabel>
            <Select
              labelId="assign-building-label"
              label="Building"
              value={assignBuildingId}
              onChange={(e) => {
                const next = e.target.value;
                setAssignBuildingId(next);
                const firstUnit = unitsForBuilding(next)[0];
                if (firstUnit?.id) setAssignUnitId(firstUnit.id);
              }}
            >
              {buildings.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="assign-unit-label">Unit</InputLabel>
            <Select
              labelId="assign-unit-label"
              label="Unit"
              value={assignUnitId}
              onChange={(e) => setAssignUnitId(e.target.value)}
            >
              {unitsForBuilding(assignBuildingId).map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="assign-primary-label">Primary</InputLabel>
            <Select
              labelId="assign-primary-label"
              label="Primary"
              value={assignPrimary}
              onChange={(e) => setAssignPrimary(e.target.value as 'true' | 'false')}
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes (make primary)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={!assignUserId.trim() || !assignUnitId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit resident</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-primary-label">Primary</InputLabel>
            <Select
              labelId="edit-primary-label"
              label="Primary"
              value={editPrimary}
              onChange={(e) => setEditPrimary(e.target.value as 'true' | 'false')}
            >
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes (make primary)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Move out date"
            type="date"
            value={editMoveOut}
            onChange={(e) => setEditMoveOut(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty for active resident"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Household dialog */}
      <Dialog open={householdOpen} onClose={() => setHouseholdOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Household (تابعين)</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            These are dependents linked to the selected resident. They can access services through the primary resident workflow.
          </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
            {household.length === 0 ? (
              <Typography color="text.secondary">No household members yet.</Typography>
            ) : (
              household.map((m) => (
                <Card key={m.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography>{m.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.relation}{m.phone ? ` • ${m.phone}` : ''}
                        </Typography>
                      </Box>
                      <Button color="error" onClick={() => handleDeleteHousehold(m)}>
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ mb: 1 }}>Add household member</Typography>
          <TextField
            label="Name"
            value={hhName}
            onChange={(e) => setHhName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Relation"
            value={hhRelation}
            onChange={(e) => setHhRelation(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Wife / Son / Daughter / ..."
          />
          <TextField
            label="Phone (optional)"
            value={hhPhone}
            onChange={(e) => setHhPhone(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHouseholdOpen(false)}>Close</Button>
          <Button onClick={handleAddHousehold} variant="contained" disabled={!hhName.trim() || !hhRelation.trim()}>
            Add
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
