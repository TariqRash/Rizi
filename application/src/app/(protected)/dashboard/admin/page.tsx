import PageContainer from 'components/Common/PageContainer/PageContainer';
import { Box, Card, CardContent, CardHeader, Grid, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <PageContainer title="Admin">
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Manage core compound setup data (buildings, units, and more).
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader title="Buildings" />
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary">
                  Create buildings and keep your compound structure organized.
                </Typography>
                <Box>
                  <Button component={Link} href="/dashboard/admin/buildings" variant="contained">
                    Manage buildings
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader title="Units" />
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary">
                  Create unit inventory, set status, and prepare for resident assignments.
                </Typography>
                <Box>
                  <Button component={Link} href="/dashboard/admin/units" variant="contained">
                    Manage units
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader title="Residents" />
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary">
                  Assign residents to units, set the primary resident, and manage household dependents.
                </Typography>
                <Box>
                  <Button component={Link} href="/dashboard/admin/residents" variant="contained">
                    Manage residents
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
