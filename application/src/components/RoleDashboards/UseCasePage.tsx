'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import { FlowForm, FormState, defaultFormValues } from './FlowForm';
import { findUseCaseByPage } from './roleFlows';
import { format } from 'date-fns';

type FlowLogEntry = {
  id: string;
  formId: string;
  formTitle: string;
  output: string;
  summary: string;
  timestamp: string;
  data: FormState;
};

type UseCasePageProps = {
  pagePath: string;
};

export default function UseCasePage({ pagePath }: UseCasePageProps) {
  const resolved = findUseCaseByPage(pagePath);

  if (!resolved) {
    return (
      <PageContainer title="Use case not found">
        <Alert severity="warning">No matching use case found for {pagePath}.</Alert>
      </PageContainer>
    );
  }

  const { flow, useCase } = resolved;

  const initialStates = useMemo(() => {
    const defaults: Record<string, FormState> = {};
    useCase.forms.forEach((form) => {
      defaults[form.id] = defaultFormValues(form.fields);
    });
    return defaults;
  }, [useCase.forms]);

  const [formStates, setFormStates] = useState<Record<string, FormState>>(initialStates);
  const [editingIds, setEditingIds] = useState<Record<string, string | null>>({});
  const [entries, setEntries] = useState<FlowLogEntry[]>([]);

  useEffect(() => {
    setFormStates(initialStates);
    setEditingIds({});
    setEntries([]);
  }, [initialStates]);

  const handleSubmit = (useCaseId: string, payload: FormState, output: string, formId: string, formTitle: string) => {
    const summary = Object.entries(payload)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');

    const existingId = editingIds[formId];
    const entryId = existingId ?? `${useCaseId}-${formId}-${Date.now()}`;
    const newEntry: FlowLogEntry = {
      id: entryId,
      formId,
      formTitle,
      output,
      summary: summary || 'Saved with defaults',
      timestamp: format(new Date(), 'MMM d, HH:mm'),
      data: payload,
    };

    setEntries((prev) => {
      const filtered = prev.filter((entry) => entry.id !== entryId);
      return [newEntry, ...filtered];
    });

    setFormStates((prev) => ({ ...prev, [formId]: defaultFormValues(useCase.forms.find((f) => f.id === formId)?.fields ?? []) }));
    setEditingIds((prev) => ({ ...prev, [formId]: null }));
  };

  const handleEdit = (entry: FlowLogEntry) => {
    setFormStates((prev) => ({ ...prev, [entry.formId]: entry.data }));
    setEditingIds((prev) => ({ ...prev, [entry.formId]: entry.id }));
  };

  const handleDelete = (entryId: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const handleReset = (formId: string) => {
    setFormStates((prev) => ({ ...prev, [formId]: initialStates[formId] }));
    setEditingIds((prev) => ({ ...prev, [formId]: null }));
  };

  return (
    <PageContainer title={`${flow.label} · ${useCase.title}`}>
      <Stack spacing={3}>
        <Alert severity="info">
          This is the dedicated page for the <strong>{useCase.title}</strong> flow. Forms mirror the note tracking pattern with
          create, read, update, and delete controls plus a live log of submissions.
        </Alert>
        <Card variant="outlined">
          <CardHeader
            title={useCase.title}
            subheader={`${useCase.description} — Owned by ${flow.label}`}
            action={<Chip color="primary" label={useCase.page} sx={{ fontFamily: 'monospace' }} />}
          />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Dashboards" />
                {useCase.dashboardWidgets.map((widget) => (
                  <Chip key={widget} label={widget} variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Reports" color="secondary" variant="outlined" />
                {useCase.reports.map((report) => (
                  <Chip key={report} label={report} />
                ))}
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                {useCase.forms.map((form) => (
                  <Grid item xs={12} md={6} key={form.id}>
                    <FlowForm
                      useCaseId={useCase.id}
                      formId={form.id}
                      title={form.title}
                      fields={form.fields}
                      output={form.output}
                      submitLabel={editingIds[form.id] ? 'Update entry' : 'Save & track'}
                      initialValues={formStates[form.id]}
                      onSubmit={(useCaseId, payload, output) =>
                        handleSubmit(useCaseId, payload, output, form.id, form.title)
                      }
                      onReset={() => handleReset(form.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Submissions" subheader="Track, edit, and remove entries per form." />
          <CardContent>
            {entries.length === 0 ? (
              <Typography color="text.secondary">No submissions yet. Save a form to see the tracked entry here.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Form</TableCell>
                      <TableCell>Output</TableCell>
                      <TableCell>Summary</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id} hover>
                        <TableCell>{entry.formTitle}</TableCell>
                        <TableCell>{entry.output}</TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>{entry.summary}</TableCell>
                        <TableCell>{entry.timestamp}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit entry">
                              <IconButton size="small" onClick={() => handleEdit(entry)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete entry">
                              <IconButton size="small" onClick={() => handleDelete(entry.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
    </PageContainer>
  );
}

