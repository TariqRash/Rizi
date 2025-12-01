'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import { FlowForm, FormState } from './FlowForm';
import { RoleFlow, UseCase, roleFlows } from './roleFlows';
import { format } from 'date-fns';

type FlowLog = {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
};

function UseCaseCard({ useCase, onLog }: { useCase: UseCase; onLog: (useCaseId: string, payload: FormState, output: string) => void }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title={<Typography variant="h6">{useCase.title}</Typography>}
        subheader={<Typography color="text.secondary">{useCase.description}</Typography>}
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Page" color="primary" variant="outlined" />
            <Chip label={useCase.page} sx={{ fontFamily: 'monospace' }} />
            <Button size="small" component={Link} href={useCase.page} variant="outlined">
              Open view
            </Button>
          </Stack>
          <Typography variant="subtitle2">Dashboards</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {useCase.dashboardWidgets.map((widget) => (
              <Chip key={widget} label={widget} />
            ))}
          </Stack>
          <Typography variant="subtitle2">Reports</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {useCase.reports.map((report) => (
              <Chip key={report} label={report} variant="outlined" />
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
                  onSubmit={onLog}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function RoleFlowDashboard() {
  const [logs, setLogs] = useState<Record<string, FlowLog[]>>({});

  const handleLog = (useCaseId: string, payload: FormState, output: string) => {
    const summary = Object.entries(payload)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');

    setLogs((prev) => ({
      ...prev,
      [useCaseId]: [
        {
          id: `${useCaseId}-${Date.now()}`,
          title: output,
          summary: summary || 'Saved with defaults',
          timestamp: format(new Date(), 'MMM d, HH:mm'),
        },
        ...(prev[useCaseId] ?? []),
      ],
    }));
  };

  const renderLog = (useCaseId: string) => {
    const entries = logs[useCaseId] ?? [];
    if (!entries.length) return null;
    return (
      <Card variant="outlined">
        <CardHeader title="Tracked submissions" subheader="Mirrors the note form history flow." />
        <List>
          {entries.map((entry) => (
            <ListItem key={entry.id} divider>
              <ListItemText primary={entry.title} secondary={`${entry.timestamp} — ${entry.summary}`} />
            </ListItem>
          ))}
        </List>
      </Card>
    );
  };

  return (
    <PageContainer title="Role dashboards & flows">
      <Stack spacing={3}>
        <Alert severity="info">
          Each card outlines the dedicated page, dashboard widgets, CRUD-style forms, and the tracked outputs for every persona.
          Submissions follow the same flow as the notes form: capture inputs, persist in-memory, and show a chronological log.
        </Alert>
        {roleFlows.map((flow: RoleFlow) => (
          <Card key={flow.role} variant="outlined">
            <CardHeader
              title={flow.label}
              subheader={flow.purpose}
              action={<Chip color="primary" label={flow.heroCta} />}
            />
            <CardContent>
              <Grid container spacing={3}>
                {flow.useCases.map((useCase) => (
                  <Grid item xs={12} key={useCase.id}>
                    <UseCaseCard useCase={useCase} onLog={handleLog} />
                    <Box mt={2}>{renderLog(useCase.id)}</Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageContainer>
  );
}

