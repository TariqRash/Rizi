import { Card, CardContent, Chip, Grid, Stack, Typography, Divider } from '@mui/material';

interface RoleBlueprint {
  role: string;
  labelAr: string;
  focus: string[];
  dashboards: string[];
  reports: string[];
  crm: string[];
}

const ROLE_BLUEPRINTS: RoleBlueprint[] = [
  {
    role: 'Super Admin',
    labelAr: 'المشرف العام',
    focus: ['Global guardrails', 'Tenant provisioning', 'Platform health'],
    dashboards: ['Cross-compound uptime', 'Security & access overview', 'License usage'],
    reports: ['Incident SLA trends', 'Audit log exports', 'Compound onboarding velocity'],
    crm: ['Strategic accounts list', 'Executive brief templates', 'Escalation queue ownership'],
  },
  {
    role: 'Admin (Tenant)',
    labelAr: 'مدير المجمع',
    focus: ['Compound setup', 'Staff governance', 'Operational playbooks'],
    dashboards: ['Compound occupancy & churn', 'Amenity utilization', 'Financial snapshot'],
    reports: ['Vendor compliance', 'Collections vs. dues', 'Maintenance backlog aging'],
    crm: ['Tenant directory', 'Unit notes & files', 'Billing & contracts workspace'],
  },
  {
    role: 'Manager',
    labelAr: 'المدير المناوب',
    focus: ['Assigned compounds', 'Shift execution', 'Task routing'],
    dashboards: ['Shift KPIs', 'Open work orders', 'Visitor & access approvals'],
    reports: ['Daily ops summary', 'Bookings approvals log', 'Service queue throughput'],
    crm: ['Resident pulse board', 'Owner follow-ups', 'Task handoff notes'],
  },
  {
    role: 'Owner',
    labelAr: 'المالك',
    focus: ['Portfolio performance', 'Unit cashflow', 'Approvals'],
    dashboards: ['Income vs. expenses', 'Occupancy per unit', 'Pending approvals'],
    reports: ['Invoice history', 'Expense receipts', 'Capital improvements log'],
    crm: ['Owner documents vault', 'Approvals trail', 'Agent collaboration'],
  },
  {
    role: 'Resident',
    labelAr: 'المقيم',
    focus: ['Requests', 'Bookings', 'Access'],
    dashboards: ['My requests', 'Upcoming bookings', 'Guest access'],
    reports: ['Payment receipts', 'Maintenance history', 'Community announcements'],
    crm: ['Profile & household', 'Vehicle & access cards', 'Preference center'],
  },
  {
    role: 'Service Provider',
    labelAr: 'مقدم الخدمة',
    focus: ['Dispatch', 'SLA tracking', 'Inventory'],
    dashboards: ['Assigned tickets', 'SLA timer', 'Parts & inventory'],
    reports: ['Completion rate', 'First-time-fix', 'Invoice submissions'],
    crm: ['Team roster', 'Certifications', 'Contract documents'],
  },
  {
    role: 'Visitor (Guest)',
    labelAr: 'زائر',
    focus: ['Fast access', 'Wayfinding', 'Host confirmations'],
    dashboards: ['Access pass', 'Visit schedule', 'Host contact'],
    reports: ['Entry logs', 'Access denials', 'Check-in latency'],
    crm: ['Identity verification', 'Vehicle plate cache', 'Host preferences'],
  },
  {
    role: 'Supervisor',
    labelAr: 'المشرف الميداني',
    focus: ['Facility oversight', 'Bookings approvals', 'Incident handling'],
    dashboards: ['Facility status', 'Live bookings', 'Incident queue'],
    reports: ['Amenity uptime', 'Cleaning & turnover', 'Safety checks'],
    crm: ['Staff rota', 'Playbooks & SOPs', 'Escalation checklist'],
  },
];

const PillSection = ({ title, items }: { title: string; items: string[] }) => (
  <Stack spacing={1} alignItems="flex-start">
    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: 12 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {items.map((item) => (
        <Chip key={item} label={item} size="small" color="primary" variant="outlined" />
      ))}
    </Stack>
  </Stack>
);

const RolePlaybooks = () => {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeaderContent />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {ROLE_BLUEPRINTS.map((role) => (
            <Grid item xs={12} md={6} key={role.role}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1.5} alignItems="flex-start">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {role.role}
                      </Typography>
                      <Chip label={role.labelAr} size="small" color="secondary" variant="outlined" />
                    </Stack>

                    <PillSection title="Focus" items={role.focus} />
                    <PillSection title="Dashboards" items={role.dashboards} />
                    <PillSection title="Reports" items={role.reports} />
                    <PillSection title="CRM" items={role.crm} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const CardHeaderContent = () => (
  <CardContent>
    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
      <div>
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Role-based operating dashboards | لوحات تشغيل مخصصة للأدوار
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Blueprint for RTL-first dashboards, reports, and CRM spaces per persona.
        </Typography>
      </div>
      <Chip label="RTL ready" color="success" variant="outlined" />
    </Stack>
  </CardContent>
);

export default RolePlaybooks;
