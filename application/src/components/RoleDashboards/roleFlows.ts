import { USER_ROLES } from 'lib/auth/roles';
import { UserRole } from 'types';

export type FlowField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'select' | 'textarea';
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type UseCase = {
  id: string;
  title: string;
  description: string;
  page: string;
  forms: {
    id: string;
    title: string;
    fields: FlowField[];
    output: string;
  }[];
  dashboardWidgets: string[];
  reports: string[];
};

export type RoleFlow = {
  role: UserRole;
  label: string;
  purpose: string;
  heroCta: string;
  useCases: UseCase[];
};

export const roleFlows: RoleFlow[] = [
  {
    role: USER_ROLES.SUPER_ADMIN,
    label: 'Super Admin',
    purpose: 'Global control of tenants, roles, and platform-wide observability.',
    heroCta: 'Create and audit every tenant workspace from one place.',
    useCases: [
      {
        id: 'superadmin-governance',
        title: 'Tenant governance & safety',
        description: 'Spin up a tenant, assign its primary admin, and lock down platform policies.',
        page: '/admin/dashboard',
        forms: [
          {
            id: 'create-tenant',
            title: 'Create tenant + admin',
            output: 'Tenant shell created with admin invited and policy baselines stored.',
            fields: [
              { name: 'tenantName', label: 'Compound / tenant name', required: true, placeholder: 'Rizi Compound East' },
              { name: 'adminEmail', label: 'Primary admin email', type: 'email', required: true },
              { name: 'plan', label: 'Plan', type: 'select', options: ['Free', 'Pro'] },
              { name: 'policy', label: 'Baseline policy', type: 'textarea', placeholder: 'Upload rules, SLA, data region…' },
            ],
          },
          {
            id: 'platform-audit',
            title: 'Platform audit & risk',
            output: 'Consolidated audit trail exported for compliance.',
            fields: [
              { name: 'scope', label: 'Audit scope', type: 'select', options: ['Access logs', 'Billing', 'Data residency'] },
              { name: 'range', label: 'Date range', placeholder: 'Last 30 days' },
              { name: 'notify', label: 'Notify emails', placeholder: 'security@rizi.app' },
            ],
          },
        ],
        dashboardWidgets: ['Tenant health overview', 'Access anomalies', 'Billing collection', 'Data region coverage'],
        reports: ['Audit exports', 'Plan utilization', 'Security posture'],
      },
      {
        id: 'superadmin-escalation',
        title: 'Escalation & recovery',
        description: 'Override tenant issues, unblock admins, and recover data snapshots.',
        page: '/admin/dashboard/escalations',
        forms: [
          {
            id: 'unlock-admin',
            title: 'Unlock tenant admin',
            output: 'Admin access restored and session resets enforced.',
            fields: [
              { name: 'tenant', label: 'Tenant', required: true },
              { name: 'adminEmail', label: 'Admin email', type: 'email', required: true },
              { name: 'reason', label: 'Reason / ticket', type: 'textarea', placeholder: 'Explain escalation context' },
            ],
          },
          {
            id: 'data-restore',
            title: 'Data snapshot restore',
            output: 'Snapshot queued for restore with download link sent to requester.',
            fields: [
              { name: 'snapshotId', label: 'Snapshot ID', required: true },
              { name: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Staging'] },
              { name: 'notify', label: 'Notify', placeholder: 'ops@rizi.app' },
            ],
          },
        ],
        dashboardWidgets: ['Escalation queue', 'Restore timelines', 'Admin lockout reasons', 'Notifications'],
        reports: ['MTTR trends', 'Top blockers', 'Restore SLA'],
      },
    ],
  },
  {
    role: USER_ROLES.ADMIN,
    label: 'Tenant Admin',
    purpose: 'Operate one or many compounds with role assignments and billing oversight.',
    heroCta: 'Configure compounds, onboard managers, and keep billing current.',
    useCases: [
      {
        id: 'admin-compound',
        title: 'Compound onboarding',
        description: 'Create compounds, attach managers, and define amenities.',
        page: '/dashboard/admin/compounds',
        forms: [
          {
            id: 'compound-create',
            title: 'Add compound',
            output: 'Compound created with amenity catalog and manager invites.',
            fields: [
              { name: 'compoundName', label: 'Compound name', required: true },
              { name: 'location', label: 'Location', placeholder: 'Riyadh, KSA' },
              { name: 'amenities', label: 'Amenities', type: 'textarea', placeholder: 'Pool, meeting rooms, parking' },
            ],
          },
          {
            id: 'assign-manager',
            title: 'Assign manager',
            output: 'Manager assigned with scoped compounds and permissions.',
            fields: [
              { name: 'managerEmail', label: 'Manager email', type: 'email', required: true },
              { name: 'compounds', label: 'Compounds managed', placeholder: 'Compound East; Compound West' },
              { name: 'permissions', label: 'Permissions', type: 'select', options: ['Bookings', 'Residents', 'Vendors'] },
            ],
          },
        ],
        dashboardWidgets: ['Active compounds', 'Manager coverage', 'Amenity utilization'],
        reports: ['Occupancy by compound', 'Booking load', 'Amenity performance'],
      },
      {
        id: 'admin-billing',
        title: 'Billing & Stripe',
        description: 'Keep payment methods current and review invoices per compound.',
        page: '/dashboard/subscription',
        forms: [
          {
            id: 'payment-update',
            title: 'Update payment method',
            output: 'Payment source saved and future invoices routed.',
            fields: [
              { name: 'cardholder', label: 'Cardholder name', required: true },
              { name: 'billingEmail', label: 'Billing email', type: 'email', required: true },
              { name: 'country', label: 'Country', placeholder: 'KSA' },
            ],
          },
          {
            id: 'invoice-download',
            title: 'Download invoice',
            output: 'Invoice PDF downloaded and archived in tenant files.',
            fields: [
              { name: 'invoiceId', label: 'Invoice ID', required: true },
              { name: 'compound', label: 'Compound', placeholder: 'Optional filter' },
            ],
          },
        ],
        dashboardWidgets: ['Past due accounts', 'Payment methods', 'Plan distribution'],
        reports: ['Invoice ledger', 'Collection rate', 'ARR per compound'],
      },
    ],
  },
  {
    role: USER_ROLES.MANAGER,
    label: 'Manager',
    purpose: 'Operate the assigned compounds with booking, resident, and vendor visibility.',
    heroCta: 'Orchestrate amenities, bookings, and issue resolution for your compounds.',
    useCases: [
      {
        id: 'manager-bookings',
        title: 'Amenity bookings',
        description: 'Approve, schedule, and monitor bookings for assigned compounds.',
        page: '/dashboard/manager/bookings',
        forms: [
          {
            id: 'approve-booking',
            title: 'Approve booking',
            output: 'Booking approved with confirmation sent to resident.',
            fields: [
              { name: 'bookingId', label: 'Booking ID', required: true },
              { name: 'slot', label: 'Time slot', placeholder: 'e.g., 4 Feb, 2-3pm' },
              { name: 'amenity', label: 'Amenity', type: 'select', options: ['Pool', 'Meeting room', 'Gym'] },
            ],
          },
          {
            id: 'resolve-issue',
            title: 'Resolve issue',
            output: 'Issue closed and resident notified with resolution notes.',
            fields: [
              { name: 'ticket', label: 'Ticket number', required: true },
              { name: 'resolution', label: 'Resolution notes', type: 'textarea', required: true },
              { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
            ],
          },
        ],
        dashboardWidgets: ['Bookings pipeline', 'Amenity availability', 'Issue SLA'],
        reports: ['Booking approvals', 'Amenity utilization', 'Issue backlog'],
      },
      {
        id: 'manager-staff',
        title: 'Staff roster',
        description: 'Manage supervisors and service providers assigned to your compounds.',
        page: '/dashboard/manager/staff',
        forms: [
          {
            id: 'schedule-supervisor',
            title: 'Schedule supervisor',
            output: 'Supervisor scheduled with shift reminders.',
            fields: [
              { name: 'supervisor', label: 'Supervisor', required: true },
              { name: 'compound', label: 'Compound', required: true },
              { name: 'shift', label: 'Shift time', placeholder: 'Fri 6pm-11pm' },
            ],
          },
          {
            id: 'vendor-work',
            title: 'Service provider task',
            output: 'Task assigned with status tracking for completion.',
            fields: [
              { name: 'provider', label: 'Service provider', required: true },
              { name: 'task', label: 'Task details', type: 'textarea', required: true },
              { name: 'due', label: 'Due date', placeholder: 'yyyy-mm-dd' },
            ],
          },
        ],
        dashboardWidgets: ['Shifts calendar', 'Vendor tasks', 'Coverage per compound'],
        reports: ['Shift adherence', 'Task completion', 'Vendor SLA'],
      },
    ],
  },
  {
    role: USER_ROLES.OWNER,
    label: 'Owner',
    purpose: 'Monitor owned units, ledger, and approvals.',
    heroCta: 'Review unit performance and authorize key changes.',
    useCases: [
      {
        id: 'owner-ledger',
        title: 'Unit ledger & dues',
        description: 'Track dues, payments, and open balances for owned units.',
        page: '/dashboard/owner/ledger',
        forms: [
          {
            id: 'record-payment',
            title: 'Record payment',
            output: 'Payment attached to unit ledger with receipt.',
            fields: [
              { name: 'unit', label: 'Unit', required: true },
              { name: 'amount', label: 'Amount', required: true },
              { name: 'method', label: 'Method', type: 'select', options: ['Transfer', 'Card', 'Cash'] },
            ],
          },
          {
            id: 'approve-renovation',
            title: 'Approve renovation',
            output: 'Approval recorded with vendor and schedule.',
            fields: [
              { name: 'unit', label: 'Unit', required: true },
              { name: 'vendor', label: 'Vendor', placeholder: 'Optional' },
              { name: 'notes', label: 'Notes', type: 'textarea' },
            ],
          },
        ],
        dashboardWidgets: ['Outstanding dues', 'Receipts', 'Unit list'],
        reports: ['Collections', 'Renovation approvals', 'Owner statements'],
      },
      {
        id: 'owner-consent',
        title: 'Consent & visitors',
        description: 'Authorize resident changes and visitor access.',
        page: '/dashboard/owner/consent',
        forms: [
          {
            id: 'approve-resident',
            title: 'Approve resident move-in',
            output: 'Resident approval logged and shared with manager.',
            fields: [
              { name: 'resident', label: 'Resident name', required: true },
              { name: 'unit', label: 'Unit', required: true },
              { name: 'moveIn', label: 'Move-in date', placeholder: 'yyyy-mm-dd' },
            ],
          },
          {
            id: 'visitor-pass',
            title: 'Issue visitor pass',
            output: 'Visitor QR generated with timebound validity.',
            fields: [
              { name: 'guestName', label: 'Guest name', required: true },
              { name: 'validity', label: 'Validity window', placeholder: 'Today 3-5pm' },
            ],
          },
        ],
        dashboardWidgets: ['Approvals', 'Visitor passes', 'Unit ownership'],
        reports: ['Consent logs', 'Visitor volume', 'Owner activity'],
      },
    ],
  },
  {
    role: USER_ROLES.RESIDENT,
    label: 'Resident',
    purpose: 'Book amenities, submit tickets, and manage visitors.',
    heroCta: 'Self-serve bookings, payments, and support from one hub.',
    useCases: [
      {
        id: 'resident-book',
        title: 'Book amenity',
        description: 'Select amenity, time, and residents included in booking.',
        page: '/dashboard/my-notes',
        forms: [
          {
            id: 'new-booking',
            title: 'New booking',
            output: 'Booking created and confirmation pushed to your inbox.',
            fields: [
              { name: 'amenity', label: 'Amenity', type: 'select', options: ['Pool', 'BBQ area', 'Padel court'] },
              { name: 'time', label: 'Preferred time', placeholder: 'Fri 8pm' },
              { name: 'guests', label: 'Guests', placeholder: 'Number of guests' },
            ],
          },
          {
            id: 'cancel-booking',
            title: 'Cancel booking',
            output: 'Booking cancelled and slot released for others.',
            fields: [
              { name: 'bookingId', label: 'Booking ID', required: true },
              { name: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Optional context' },
            ],
          },
        ],
        dashboardWidgets: ['Upcoming bookings', 'Amenity rules', 'Wallet & dues'],
        reports: ['Booking history', 'Cancellations', 'Payments'],
      },
      {
        id: 'resident-support',
        title: 'Support ticket',
        description: 'Raise maintenance or community tickets with SLA visibility.',
        page: '/dashboard/support',
        forms: [
          {
            id: 'new-ticket',
            title: 'New ticket',
            output: 'Ticket created with SLA timer and manager notified.',
            fields: [
              { name: 'category', label: 'Category', type: 'select', options: ['Maintenance', 'Noise', 'Payment'] },
              { name: 'details', label: 'Details', type: 'textarea', required: true },
              { name: 'photos', label: 'Attachments', placeholder: 'Link to images' },
            ],
          },
          {
            id: 'track-ticket',
            title: 'Track ticket',
            output: 'Real-time status and ETA returned for your ticket.',
            fields: [
              { name: 'ticketId', label: 'Ticket ID', required: true },
            ],
          },
        ],
        dashboardWidgets: ['Open tickets', 'SLA status', 'Announcements'],
        reports: ['Ticket closures', 'Category breakdown', 'Response times'],
      },
    ],
  },
  {
    role: USER_ROLES.SERVICE_PROVIDER,
    label: 'Service Provider',
    purpose: 'Deliver facility services with clear tasks, files, and approvals.',
    heroCta: 'See your assigned work, upload proofs, and get approvals fast.',
    useCases: [
      {
        id: 'provider-work',
        title: 'Work orders',
        description: 'Accept, complete, and document work orders from managers.',
        page: '/dashboard/provider/orders',
        forms: [
          {
            id: 'accept-work',
            title: 'Accept work',
            output: 'Work order accepted and SLA timer started.',
            fields: [
              { name: 'workId', label: 'Work order ID', required: true },
              { name: 'start', label: 'Start time', placeholder: 'Now / later' },
            ],
          },
          {
            id: 'upload-proof',
            title: 'Upload proof',
            output: 'Completion proof attached for manager review.',
            fields: [
              { name: 'workId', label: 'Work order ID', required: true },
              { name: 'attachments', label: 'Attachments', placeholder: 'Links to photos / docs' },
              { name: 'notes', label: 'Notes', type: 'textarea' },
            ],
          },
        ],
        dashboardWidgets: ['Assigned work', 'SLA clocks', 'Approvals'],
        reports: ['Completed tasks', 'SLA breaches', 'Approval turnaround'],
      },
      {
        id: 'provider-invoice',
        title: 'Invoice submission',
        description: 'Submit invoices with line items and supporting files.',
        page: '/dashboard/provider/invoices',
        forms: [
          {
            id: 'submit-invoice',
            title: 'Submit invoice',
            output: 'Invoice submitted to manager with status tracking.',
            fields: [
              { name: 'invoiceId', label: 'Invoice ID', required: true },
              { name: 'amount', label: 'Amount', required: true },
              { name: 'lineItems', label: 'Line items', type: 'textarea' },
            ],
          },
          {
            id: 'track-invoice',
            title: 'Track invoice',
            output: 'Invoice status and expected payout shown.',
            fields: [
              { name: 'invoiceId', label: 'Invoice ID', required: true },
            ],
          },
        ],
        dashboardWidgets: ['Outstanding invoices', 'Payouts', 'Rejected items'],
        reports: ['Invoice history', 'Payout times', 'Rejection reasons'],
      },
    ],
  },
  {
    role: USER_ROLES.VISITOR,
    label: 'Visitor (Guest)',
    purpose: 'Request and track temporary access.',
    heroCta: 'Request passes and know exactly where to go.',
    useCases: [
      {
        id: 'visitor-pass',
        title: 'Access pass',
        description: 'Request a visitor pass with host and duration.',
        page: '/dashboard/visitor/pass',
        forms: [
          {
            id: 'request-pass',
            title: 'Request pass',
            output: 'Pass requested and pending host approval.',
            fields: [
              { name: 'host', label: 'Host email', type: 'email', required: true },
              { name: 'visitTime', label: 'Visit time', placeholder: 'Sat 5pm' },
            ],
          },
          {
            id: 'check-status',
            title: 'Check status',
            output: 'Pass status displayed with QR if approved.',
            fields: [
              { name: 'passId', label: 'Pass ID', required: true },
            ],
          },
        ],
        dashboardWidgets: ['Active passes', 'Host approvals'],
        reports: ['Visits by day', 'Denied entries'],
      },
    ],
  },
  {
    role: USER_ROLES.SUPERVISOR,
    label: 'Supervisor',
    purpose: 'Run facility shifts, approve bookings, and coordinate providers.',
    heroCta: 'Keep facilities running with real-time approvals and inventory.',
    useCases: [
      {
        id: 'supervisor-approvals',
        title: 'On-shift approvals',
        description: 'Approve bookings and service work during your shift.',
        page: '/dashboard/supervisor/approvals',
        forms: [
          {
            id: 'approve-amenity',
            title: 'Approve amenity booking',
            output: 'Booking approved with rules attached.',
            fields: [
              { name: 'bookingId', label: 'Booking ID', required: true },
              { name: 'rules', label: 'Rules to enforce', type: 'textarea' },
            ],
          },
          {
            id: 'handover',
            title: 'Shift handover',
            output: 'Handover file stored for next supervisor.',
            fields: [
              { name: 'nextSupervisor', label: 'Next supervisor', required: true },
              { name: 'notes', label: 'Notes', type: 'textarea', required: true },
            ],
          },
        ],
        dashboardWidgets: ['Live bookings', 'Shift notes', 'Facility status'],
        reports: ['Approvals per shift', 'Incident log', 'Inventory movements'],
      },
      {
        id: 'supervisor-inventory',
        title: 'Inventory & checklists',
        description: 'Track consumables, safety checks, and readiness.',
        page: '/dashboard/supervisor/inventory',
        forms: [
          {
            id: 'checklist',
            title: 'Run checklist',
            output: 'Checklist logged with timestamp and responsible person.',
            fields: [
              { name: 'area', label: 'Area', required: true },
              { name: 'items', label: 'Items checked', type: 'textarea', required: true },
              { name: 'status', label: 'Status', type: 'select', options: ['Pass', 'Fail', 'Follow-up'] },
            ],
          },
          {
            id: 'reorder',
            title: 'Request reorder',
            output: 'Reorder sent to manager with urgency flag.',
            fields: [
              { name: 'supply', label: 'Supply', required: true },
              { name: 'quantity', label: 'Quantity', required: true },
              { name: 'urgency', label: 'Urgency', type: 'select', options: ['Normal', 'Urgent'] },
            ],
          },
        ],
        dashboardWidgets: ['Stock levels', 'Reorder queue', 'Readiness status'],
        reports: ['Checklist history', 'Reorder trends', 'Stockouts'],
      },
    ],
  },
];

export const findUseCaseByPage = (page: string) => {
  const normalizedPage = page.startsWith('/') ? page : `/${page}`;
  for (const flow of roleFlows) {
    for (const useCase of flow.useCases) {
      if (useCase.page === normalizedPage) {
        return { flow, useCase };
      }
    }
  }
  return undefined;
};
