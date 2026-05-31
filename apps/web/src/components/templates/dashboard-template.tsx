'use client';

import { useMemo, useState } from 'react';
import {
  PixelSidebar,
  PixelBreadcrumb,
  PixelDropdown,
  PixelTooltip,
  PixelButton,
  PixelToggle,
  PixelRibbon,
  PixelStatGroup,
  PixelStatCard,
  PixelTwoColumn,
  PixelCard,
  PixelStack,
  PixelContainer,
  PixelSparkline,
  PixelAreaChart,
  PixelTimeline,
  PixelTimelineItem,
  PixelDataTable,
  PixelSegmented,
  PixelDrawer,
  PixelInput,
  PixelCombobox,
  PixelDatePicker,
  PixelToggleGroup,
  PixelInputGroup,
  PixelCommand,
  PixelBadge,
  PxlKitToastProvider,
  useToast,
  type ColumnDef,
} from '@pxlkit/ui-kit';

/* ─────────────────────────────────────────────────────────────────────────
   Types + placeholder data
   ───────────────────────────────────────────────────────────────────────── */

type OrderStatus = 'paid' | 'pending' | 'refunded' | 'shipped' | 'failed';

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: OrderStatus;
  channel: 'web' | 'mobile' | 'pos';
  placedAt: string;
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  time: string;
}

const STAT_TREND_REVENUE = [42, 38, 51, 47, 60, 58, 72, 68, 81, 78, 92, 104];
const STAT_TREND_USERS = [12, 18, 14, 22, 20, 28, 31, 27, 34, 38, 42, 46];
const STAT_TREND_ORDERS = [80, 64, 88, 72, 96, 84, 110, 98, 122, 116, 134, 142];
const STAT_TREND_CONVERSION = [3.1, 3.0, 3.3, 3.2, 3.5, 3.4, 3.7, 3.6, 3.8, 4.0, 4.1, 4.3];

const REVENUE_SERIES = [
  { x: 'Mon', y: 8200 },
  { x: 'Tue', y: 9100 },
  { x: 'Wed', y: 8800 },
  { x: 'Thu', y: 10400 },
  { x: 'Fri', y: 11800 },
  { x: 'Sat', y: 14200 },
  { x: 'Sun', y: 13600 },
  { x: 'Mon', y: 12100 },
  { x: 'Tue', y: 13400 },
  { x: 'Wed', y: 14900 },
  { x: 'Thu', y: 16100 },
  { x: 'Fri', y: 17800 },
];

const ACTIVITY_PEOPLE = [
  'Ana López', 'Diego Romero', 'Marina Sosa', 'Jorge Pérez', 'Carla Méndez',
  'Esteban Ruiz', 'Sofía Quintero', 'Luis Hernández', 'Valeria Torres', 'Mateo García',
];

function buildActivity(count: number): ActivityEvent[] {
  const verbs = [
    'placed an order',
    'requested a refund',
    'left a review',
    'updated their profile',
    'subscribed to Pro',
    'downgraded to Free',
    'opened a support ticket',
    'closed a ticket',
    'paid invoice',
    'verified email',
  ];
  return Array.from({ length: count }, (_, i) => {
    const person = ACTIVITY_PEOPLE[i % ACTIVITY_PEOPLE.length];
    const verb = verbs[i % verbs.length];
    const minutesAgo = (i + 1) * 7;
    return {
      id: `evt-${i + 1}`,
      title: `${person} ${verb}`,
      description:
        i % 3 === 0
          ? 'Auto-flagged by the risk engine for manual review.'
          : i % 3 === 1
            ? 'Captured via the public checkout SDK.'
            : 'Synced from the mobile app session log.',
      time: `${minutesAgo}m ago`,
    };
  });
}

const ACTIVITY_EVENTS = buildActivity(30);

function buildOrders(count: number): Order[] {
  const statuses: OrderStatus[] = ['paid', 'pending', 'shipped', 'refunded', 'failed'];
  const channels: Order['channel'][] = ['web', 'mobile', 'pos'];
  return Array.from({ length: count }, (_, i) => {
    const customer = ACTIVITY_PEOPLE[i % ACTIVITY_PEOPLE.length];
    const status = statuses[i % statuses.length];
    const channel = channels[i % channels.length];
    const slug = customer.toLowerCase().split(' ')[0];
    const amount = 49 + ((i * 37) % 940);
    const day = String((i % 27) + 1).padStart(2, '0');
    return {
      id: `ORD-${(10000 + i).toString()}`,
      customer,
      email: `${slug}@${i % 2 === 0 ? 'pxlkit.dev' : 'mail.test'}`,
      amount,
      status,
      channel,
      placedAt: `2026-05-${day}`,
    };
  });
}

const ORDERS = buildOrders(100);

const SEGMENTS = [
  'cyan', 'gold', 'green', 'purple', 'pink', 'red', 'neutral',
] as const;

const STATUS_TONE: Record<OrderStatus, 'green' | 'gold' | 'cyan' | 'red' | 'neutral'> = {
  paid: 'green',
  pending: 'gold',
  shipped: 'cyan',
  refunded: 'neutral',
  failed: 'red',
};

const CHANNEL_LABEL: Record<Order['channel'], string> = {
  web: 'Web',
  mobile: 'Mobile',
  pos: 'POS',
};

/* ─────────────────────────────────────────────────────────────────────────
   Inner shell — needs useToast() so we wrap inside <PxlKitToastProvider/>.
   ───────────────────────────────────────────────────────────────────────── */

function DashboardInner() {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([
    { id: 'placedAt', desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPlan, setNewCustomerPlan] = useState('pro');
  const [newCustomerJoined, setNewCustomerJoined] = useState<Date | null>(new Date());
  const [newCustomerChannels, setNewCustomerChannels] = useState<string[]>(['web']);

  const sidebarSections = useMemo(
    () => [
      {
        title: 'Workspace',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <span aria-hidden>◆</span>,
            active: activeNav === 'dashboard',
            onSelect: () => setActiveNav('dashboard'),
            badge: { label: 'LIVE', tone: 'cyan' as const },
          },
          {
            id: 'customers',
            label: 'Customers',
            icon: <span aria-hidden>◉</span>,
            active: activeNav === 'customers',
            onSelect: () => setActiveNav('customers'),
            badge: { label: '128', tone: 'neutral' as const },
          },
          {
            id: 'orders',
            label: 'Orders',
            icon: <span aria-hidden>▤</span>,
            active: activeNav === 'orders',
            onSelect: () => setActiveNav('orders'),
            badge: { label: '12', tone: 'gold' as const },
          },
        ],
      },
      {
        title: 'Insights',
        items: [
          {
            id: 'reports',
            label: 'Reports',
            icon: <span aria-hidden>▦</span>,
            active: activeNav === 'reports',
            onSelect: () => setActiveNav('reports'),
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: <span aria-hidden>⚙</span>,
            active: activeNav === 'settings',
            onSelect: () => setActiveNav('settings'),
          },
        ],
      },
    ],
    [activeNav],
  );

  const tableColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Order',
        cell: (info) => (
          <code className="font-mono text-xs text-retro-cyan">{info.getValue() as string}</code>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="text-sm text-retro-text">{row.customer}</span>
              <span className="text-[11px] text-retro-muted font-mono">{row.email}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => (
          <span className="font-mono text-sm text-retro-text">
            ${(info.getValue() as number).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as OrderStatus;
          return (
            <PixelBadge tone={STATUS_TONE[status]} size="sm">
              {status.toUpperCase()}
            </PixelBadge>
          );
        },
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: (info) => (
          <span className="text-xs text-retro-muted font-mono">
            {CHANNEL_LABEL[info.getValue() as Order['channel']]}
          </span>
        ),
      },
      {
        accessorKey: 'placedAt',
        header: 'Placed',
        cell: (info) => (
          <span className="text-xs text-retro-muted font-mono">{info.getValue() as string}</span>
        ),
      },
    ],
    [],
  );

  const commandGroups = useMemo(
    () => [
      {
        heading: 'Navigate',
        items: [
          {
            id: 'go-dashboard',
            label: 'Go to Dashboard',
            shortcut: 'G D',
            onSelect: () => { setActiveNav('dashboard'); setCommandOpen(false); },
          },
          {
            id: 'go-customers',
            label: 'Go to Customers',
            shortcut: 'G C',
            onSelect: () => { setActiveNav('customers'); setCommandOpen(false); },
          },
          {
            id: 'go-orders',
            label: 'Go to Orders',
            shortcut: 'G O',
            onSelect: () => { setActiveNav('orders'); setCommandOpen(false); },
          },
          {
            id: 'go-reports',
            label: 'Go to Reports',
            shortcut: 'G R',
            onSelect: () => { setActiveNav('reports'); setCommandOpen(false); },
          },
        ],
      },
      {
        heading: 'Actions',
        items: [
          {
            id: 'new-customer',
            label: 'New customer',
            shortcut: 'N C',
            onSelect: () => { setCommandOpen(false); setDrawerOpen(true); },
          },
          {
            id: 'toggle-theme',
            label: dark ? 'Switch to light mode' : 'Switch to dark mode',
            shortcut: 'T',
            onSelect: () => { setDark((d) => !d); setCommandOpen(false); },
          },
          {
            id: 'export-csv',
            label: 'Export orders to CSV',
            onSelect: () => {
              setCommandOpen(false);
              toast.success('Export queued', 'Your CSV is being generated.');
            },
          },
        ],
      },
    ],
    [dark, toast],
  );

  const handleNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerEmail.trim()) {
      toast.error('Missing fields', 'Name and email are required.');
      return;
    }
    setDrawerOpen(false);
    toast.success(
      'Customer created',
      `${newCustomerName} was added to the workspace.`,
    );
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerPlan('pro');
    setNewCustomerChannels(['web']);
  };

  const userMenuItems = useMemo(
    () => [
      { kind: 'header' as const, label: 'Signed in as', value: '__hdr' },
      { kind: 'item' as const, label: 'joangel@pxlkit.dev', value: 'profile' },
      { kind: 'separator' as const, label: '', value: '__sep1' },
      { kind: 'item' as const, label: 'Account settings', value: 'account', shortcut: '⌘,' },
      { kind: 'item' as const, label: 'Billing', value: 'billing' },
      { kind: 'item' as const, label: 'API tokens', value: 'tokens' },
      { kind: 'separator' as const, label: '', value: '__sep2' },
      { kind: 'item' as const, label: 'Sign out', value: 'signout', tone: 'red' as const },
    ],
    [],
  );

  return (
    <div className={dark ? 'dark' : 'light'}>
      <div className="relative min-h-screen bg-retro-bg text-retro-text">
        {/* Top ribbon — page-level "NEW" marker */}
        <PixelRibbon position="top-right" tone="cyan" offset="md">
          NEW · @pxlkit/ui-kit v1.9.0
        </PixelRibbon>

        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div className="hidden md:block">
            <PixelSidebar
              collapsible
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
              sections={sidebarSections}
              header={
                <div className="flex items-center gap-2">
                  <span aria-hidden className="inline-block h-3 w-3 bg-retro-cyan" />
                  <span className="font-pixel text-xs text-retro-text">PXL · Admin</span>
                </div>
              }
              footer={
                !sidebarCollapsed ? (
                  <div className="text-[10px] font-mono text-retro-muted/70 px-1">
                    v1.9.0 · build 4a
                  </div>
                ) : null
              }
            />
          </div>

          {/* Main column */}
          <section aria-label="Dashboard workspace" className="flex-1 min-w-0 flex flex-col">
            {/* Top bar */}
            <header className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-retro-border/40 bg-retro-bg/60 backdrop-blur">
              <div className="min-w-0 flex-1">
                <PixelBreadcrumb
                  items={[
                    { label: 'Workspace', href: '#workspace' },
                    { label: 'Admin', href: '#admin' },
                    { label: 'Dashboard', active: true },
                  ]}
                />
              </div>

              <PixelTooltip content="Toggle theme" position="bottom">
                <PixelToggle
                  value="theme"
                  pressed={!dark}
                  onPressedChange={(p) => setDark(!p)}
                  aria-label="Toggle color theme"
                >
                  {dark ? '☾' : '☀'}
                </PixelToggle>
              </PixelTooltip>

              <PixelTooltip content="Open command palette (⌘K)" position="bottom">
                <PixelButton
                  variant="outline"
                  tone="neutral"
                  size="sm"
                  onClick={() => setCommandOpen(true)}
                >
                  ⌘K
                </PixelButton>
              </PixelTooltip>

              <PixelTooltip content="Create a new customer" position="bottom">
                <PixelButton
                  tone="cyan"
                  size="sm"
                  iconLeft={<span aria-hidden>+</span>}
                  onClick={() => setDrawerOpen(true)}
                >
                  New
                </PixelButton>
              </PixelTooltip>

              <PixelDropdown
                label="JD"
                tone="neutral"
                ariaLabel="User menu"
                items={userMenuItems}
                onSelect={(value) => {
                  if (value === 'signout') {
                    toast.info('Signed out', 'See you next time.');
                  } else if (value.startsWith('__')) {
                    return;
                  } else {
                    toast.info('Navigation', `Opened ${value}.`);
                  }
                }}
              />
            </header>

            {/* Body */}
            <PixelContainer
              as="section"
              maxWidth="2xl"
              padding={{ x: 'md', y: 'md' }}
              className="flex-1"
            >
              <PixelStack gap={6}>
                {/* Row 1 — stats */}
                <PixelStatGroup
                  layout="grid"
                  columns={4}
                  aria-label="Key metrics"
                  className="!divide-x-0"
                >
                  <div className="p-2">
                    <PixelStatCard
                      label="Revenue (30d)"
                      value="$184,210"
                      tone="green"
                      trend="+12.4% vs last period"
                      iconPosition="bottom-left"
                      icon={
                        <PixelSparkline
                          data={STAT_TREND_REVENUE.map((y, i) => ({ x: i, y }))}
                          tone="green"
                          size="sm"
                          showArea
                        />
                      }
                    />
                  </div>
                  <div className="p-2">
                    <PixelStatCard
                      label="Active users"
                      value="4,812"
                      tone="cyan"
                      trend="+318 this week"
                      iconPosition="bottom-left"
                      icon={
                        <PixelSparkline
                          data={STAT_TREND_USERS.map((y, i) => ({ x: i, y }))}
                          tone="cyan"
                          size="sm"
                          showArea
                        />
                      }
                    />
                  </div>
                  <div className="p-2">
                    <PixelStatCard
                      label="Orders"
                      value="1,204"
                      tone="gold"
                      trend="+86 last 24h"
                      iconPosition="bottom-left"
                      icon={
                        <PixelSparkline
                          data={STAT_TREND_ORDERS.map((y, i) => ({ x: i, y }))}
                          tone="gold"
                          size="sm"
                          showArea
                        />
                      }
                    />
                  </div>
                  <div className="p-2">
                    <PixelStatCard
                      label="Conversion"
                      value="4.3%"
                      tone="purple"
                      trend="+0.4pp"
                      iconPosition="bottom-left"
                      icon={
                        <PixelSparkline
                          data={STAT_TREND_CONVERSION.map((y, i) => ({ x: i, y: y * 10 }))}
                          tone="purple"
                          size="sm"
                          showArea
                        />
                      }
                    />
                  </div>
                </PixelStatGroup>

                {/* Row 2 — chart + activity */}
                <PixelTwoColumn
                  ratio="60/40"
                  stackBelow="lg"
                  gap={6}
                  align="stretch"
                  left={
                    <PixelCard
                      title="Revenue over time"
                      description="Daily gross revenue, last 12 days. Hover the trend in chart settings for breakdown."
                      padding="md"
                    >
                      <div className="mt-2 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-2xl text-retro-text">$184,210</p>
                            <p className="font-mono text-xs text-retro-muted">
                              vs $163,920 last period
                            </p>
                          </div>
                          <PixelBadge tone="green" variant="soft" size="sm">
                            +12.4%
                          </PixelBadge>
                        </div>
                        <div className="w-full">
                          <PixelAreaChart
                            data={REVENUE_SERIES}
                            tone="cyan"
                            size="lg"
                            className="w-full"
                            aria-label="Daily revenue area chart"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono text-retro-muted">
                          {REVENUE_SERIES.slice(-7).map((p, i) => (
                            <span key={`${p.x}-${i}`} className="px-2 py-1 border border-retro-border/40 rounded-sm">
                              {p.x}: ${p.y.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </PixelCard>
                  }
                  right={
                    <PixelCard
                      title="Recent activity"
                      description="Latest signals across the workspace."
                      padding="md"
                    >
                      <div className="max-h-[440px] overflow-y-auto pr-1 mt-3">
                        <PixelTimeline bulletSize="sm" active={2}>
                          {ACTIVITY_EVENTS.map((evt) => (
                            <PixelTimelineItem
                              key={evt.id}
                              title={evt.title}
                              time={evt.time}
                            >
                              {evt.description}
                            </PixelTimelineItem>
                          ))}
                        </PixelTimeline>
                      </div>
                    </PixelCard>
                  }
                />

                {/* Row 3 — data table */}
                <PixelCard
                  title="Recent orders"
                  description="Latest 100 orders. Sort, select, paginate. Density toggle on the right."
                  padding="md"
                >
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <PixelBadge tone="neutral" variant="outline" size="sm">
                        {Object.keys(rowSelection).length} selected · {ORDERS.length} total
                      </PixelBadge>
                      <PixelSegmented
                        label="Density"
                        value={density}
                        onChange={(next) => setDensity(next as typeof density)}
                        tone="cyan"
                        options={[
                          { value: 'compact', label: 'Compact' },
                          { value: 'normal', label: 'Normal' },
                          { value: 'comfortable', label: 'Comfortable' },
                        ]}
                      />
                    </div>
                    <PixelDataTable<Order>
                      data={ORDERS}
                      columns={tableColumns}
                      density={density}
                      sorting={sorting}
                      onSortingChange={setSorting}
                      rowSelection={rowSelection}
                      onRowSelectionChange={setRowSelection}
                      pagination={pagination}
                      onPaginationChange={setPagination}
                      getRowId={(row) => row.id}
                    />
                  </div>
                </PixelCard>
              </PixelStack>
            </PixelContainer>
          </section>
        </div>

        {/* Floating action — opens the New Customer drawer */}
        <div className="fixed bottom-6 right-6 z-40">
          <PixelTooltip content="New customer" position="left">
            <PixelButton
              tone="cyan"
              size="lg"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open new customer drawer"
            >
              + New customer
            </PixelButton>
          </PixelTooltip>
        </div>

        {/* New Customer Drawer */}
        <PixelDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          side="right"
          size="lg"
          title="New customer"
          description="Add a new customer record to the workspace."
        >
          <PixelDrawer.Header>
            <div>
              <p className="font-pixel text-xs text-retro-text">New customer</p>
              <p className="font-mono text-[11px] text-retro-muted mt-0.5">
                Fields marked required must be filled.
              </p>
            </div>
            <PixelButton
              variant="ghost"
              tone="neutral"
              size="sm"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close drawer"
            >
              ×
            </PixelButton>
          </PixelDrawer.Header>
          <PixelDrawer.Body>
            <form
              id="new-customer-form"
              onSubmit={handleNewCustomer}
              className="flex flex-col gap-4"
            >
              <PixelInput
                label="Full name"
                placeholder="e.g. Ana López"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                required
              />
              <PixelInput
                label="Email"
                hint="We never share this with third parties."
                type="email"
                placeholder="ana@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                required
              />
              <PixelInputGroup aria-label="Quick contact" size="md">
                <PixelInput
                  placeholder="+1"
                  defaultValue="+1"
                  aria-label="Country code"
                />
                <PixelInput
                  placeholder="555 0100"
                  aria-label="Phone number"
                />
              </PixelInputGroup>
              <PixelCombobox
                label="Plan"
                value={newCustomerPlan}
                onChange={setNewCustomerPlan}
                options={[
                  { value: 'free', label: 'Free' },
                  { value: 'pro', label: 'Pro' },
                  { value: 'studio', label: 'Studio' },
                  { value: 'enterprise', label: 'Enterprise' },
                ]}
                placeholder="Select a plan"
              />
              <PixelDatePicker
                label="Joined"
                value={newCustomerJoined}
                onChange={setNewCustomerJoined}
              />
              <div>
                <p className="text-xs text-retro-muted mb-2">Channels</p>
                <PixelToggleGroup
                  type="multiple"
                  value={newCustomerChannels}
                  onChange={(next) => setNewCustomerChannels(next)}
                  aria-label="Customer channels"
                  size="sm"
                >
                  <PixelToggle value="web">Web</PixelToggle>
                  <PixelToggle value="mobile">Mobile</PixelToggle>
                  <PixelToggle value="pos">POS</PixelToggle>
                </PixelToggleGroup>
              </div>
            </form>
          </PixelDrawer.Body>
          <PixelDrawer.Footer>
            <PixelButton
              variant="ghost"
              tone="neutral"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </PixelButton>
            <PixelButton
              tone="cyan"
              type="submit"
              form="new-customer-form"
            >
              Create customer
            </PixelButton>
          </PixelDrawer.Footer>
        </PixelDrawer>

        {/* Command palette */}
        <PixelCommand
          open={commandOpen}
          onOpenChange={setCommandOpen}
          shortcut="mod+k"
          placeholder="Type a command or search…"
          groups={commandGroups}
        />

        {/* Hidden palette to keep tones live-imported (lint touch) */}
        <span className="sr-only" aria-hidden>
          {SEGMENTS.join(' ')}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Public component — wraps the inner shell with its own toast provider so
   it composes cleanly inside any page (no global provider required).
   ───────────────────────────────────────────────────────────────────────── */

export function PixelDashboardTemplate() {
  return (
    <PxlKitToastProvider position="top-right" stacked>
      <DashboardInner />
    </PxlKitToastProvider>
  );
}

export default PixelDashboardTemplate;
