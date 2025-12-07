/**
 * Constants for landing page components
 * Centralizes colors, URLs, dimensions, and other hardcoded values
 */

// Brand and UI Colors
export const COLORS = {
  // CTA Button Colors
  primary: '#0F2B5B',
  primaryHover: '#0b2349',
  secondary: '#00A99D',
  secondaryHover: '#009283',

  // Feature Card Icon Colors
  operations: '#0F2B5B',
  workflows: '#00A99D',
  arabic: '#F59E0B',
  tickets: '#7C3AED',
  billing: '#EF4444',
  vendors: '#2563EB',
  access: '#F97316',
  insights: '#10B981',
  api: '#6B7280',
} as const;

// External URLs
export const URLS = {
  // Product and contact
  marketingSite: 'https://rizi.app',
  demo: 'https://rizi.app/demo',
  arabicDeck: 'https://rizi.app/rizi-arabic-one-pager.pdf',
  documentation: 'https://rizi.app/docs',
  contact: 'mailto:hello@rizi.app',
} as const;

// Component Dimensions
export const DIMENSIONS = {
  // Icon Sizes
  iconSize: {
    small: 16,
    large: 40,
  },
  
  // Feature Card Icon Container
  iconContainer: {
    width: 80,
    height: 80,
  },
  
  // Terminal Mock Dots
  terminalDot: {
    width: 12,
    height: 12,
  },
  
  // Spacing Values
  spacing: {
    section: 8,      // py={8} for sections
    card: 6,         // py={6} for cards
    container: 4,    // gap={4} for containers
    stack: 3,        // spacing={3} for stacks
    small: 2,        // spacing={2} for small elements
    tiny: 1.5,       // spacing={1.5} for tight elements
  },
  
  // Layout Dimensions
  layout: {
    terminalWidth: 500,
    sidebarWidth: 240,
    minHeight: 400,
    maxContentWidth: 600,
  },
} as const;

// Terminal Commands
export const TERMINAL = {
  commands: [
    '$ rizi login --tenant gulf-residences',
    '$ rizi compounds:list --region=gcc',
    '$ rizi residents:sync --compound=riyadh-villas --locale=ar',
    '$ rizi tickets:create --type=maintenance --sla=4h --notify=operations@rizi.app'
  ].join('\n'),
} as const;

// Feature Data
export const FEATURES = [
  {
    title: 'Multi-compound command center',
    description: 'One dashboard to orchestrate villas, towers, and staff housing with real-time occupancy and compliance.',
    color: COLORS.operations,
  },
  {
    title: 'Resident & services workflows',
    description: 'Guided requests for maintenance, housekeeping, and guest access that keep tenants and teams aligned.',
    color: COLORS.workflows,
  },
  {
    title: 'Arabic-first experience',
    description: 'Arabic interfaces, RTL layout, and bilingual notifications for Gulf communities.',
    color: COLORS.arabic,
  },
  {
    title: 'Smart ticketing & SLAs',
    description: 'Auto-prioritized work orders, escalations, and SLA timers tailored to each compound.',
    color: COLORS.tickets,
  },
  {
    title: 'Billing & collections',
    description: 'Invoices, collections reminders, and unified resident ledgers connected to finance.',
    color: COLORS.billing,
  },
  {
    title: 'Vendor scheduling & dispatch',
    description: 'Roster internal teams and third-party vendors with time windows, checklists, and approvals.',
    color: COLORS.vendors,
  },
  {
    title: 'Access & amenities control',
    description: 'Manage parking, amenities, and entry codes with resident-level permissions.',
    color: COLORS.access,
  },
  {
    title: 'Analytics & compliance',
    description: 'Dashboards for occupancy, collections, and HSSE compliance across every compound.',
    color: COLORS.insights,
  },
  {
    title: 'Open API & webhooks',
    description: 'Push data to ERPs, BI tools, and messaging stacks with secure webhooks.',
    color: COLORS.api,
  },
] as const;
