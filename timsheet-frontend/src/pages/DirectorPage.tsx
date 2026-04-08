import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Filter,
  Search,
  User2,
  X,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  MoreHorizontal,
  Plus,
} from 'lucide-react';

type Status = 'Pending' | 'Approved' | 'Rejected';
type StatusFilter = 'All Status' | Status;

type TimesheetEntry = {
  id: number;
  date: string;
  user: string;
  project: string;
  task: string;
  hours: number;
  status: Status;
};

const entriesSeed: TimesheetEntry[] = [
  { id: 1, date: '2024-04-24', user: 'Camila Adams', project: 'Project A', task: 'Development', hours: 8, status: 'Pending' },
  { id: 2, date: '2024-04-23', user: 'Mark Patel', project: 'Project A', task: 'Development', hours: 7.5, status: 'Approved' },
  { id: 3, date: '2024-04-23', user: 'Mark Patel', project: 'Project B', task: 'Testing', hours: 6, status: 'Pending' },
  { id: 4, date: '2024-04-22', user: 'Liam Whitehead', project: 'Project C', task: 'Research', hours: 5, status: 'Approved' },
  { id: 5, date: '2024-04-21', user: 'Liam Whitehead', project: 'Project A', task: 'Testing', hours: 2, status: 'Approved' },
  { id: 6, date: '2024-04-21', user: 'Sarah Lin', project: 'Project B', task: 'Development', hours: 6.5, status: 'Pending' },
  { id: 7, date: '2024-04-21', user: 'Sarah Lin', project: 'Project A', task: 'Development', hours: 6.5, status: 'Rejected' },
  { id: 8, date: '2024-04-20', user: 'Priya Nair', project: 'Project D', task: 'Design', hours: 4, status: 'Pending' },
  { id: 9, date: '2024-04-19', user: 'Noah Chen', project: 'Project C', task: 'Review', hours: 3.5, status: 'Approved' },
  { id: 10, date: '2024-04-18', user: 'Ava Johnson', project: 'Project B', task: 'Testing', hours: 7, status: 'Pending' },
  { id: 11, date: '2024-04-17', user: 'Ethan Moore', project: 'Project A', task: 'Development', hours: 8, status: 'Rejected' },
  { id: 12, date: '2024-04-16', user: 'Maya Patel', project: 'Project D', task: 'Research', hours: 4.5, status: 'Approved' },
];

const users = ['All Users', ...Array.from(new Set(entriesSeed.map((e) => e.user)))];
const projects = ['All Projects', ...Array.from(new Set(entriesSeed.map((e) => e.project)))];
const statuses: StatusFilter[] = ['All Status', 'Pending', 'Approved', 'Rejected'];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ status }: { status: Status }) {
  const styles =
    status === 'Pending'
      ? 'bg-amber-50 text-amber-800 ring-amber-200'
      : status === 'Approved'
        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
        : 'bg-rose-50 text-rose-800 ring-rose-200';

  const icon =
    status === 'Pending' ? <Clock3 className="h-4 w-4" /> : status === 'Approved' ? <CircleCheckBig className="h-4 w-4" /> : <CircleX className="h-4 w-4" />;

  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1', styles)}>
      {icon}
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 ring-1 ring-slate-300">
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  tone: 'pink' | 'purple' | 'blue';
  icon?: React.ReactNode;
}) {
  const topBorder = tone === 'pink' ? 'from-rose-500 to-rose-400' : tone === 'purple' ? 'from-fuchsia-500 to-violet-500' : 'from-sky-500 to-indigo-500';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${topBorder}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
          {sublabel ? <div className="mt-1 text-xs text-slate-500">{sublabel}</div> : null}
        </div>
        {icon ? <div className="rounded-xl bg-slate-50 p-2 text-slate-500">{icon}</div> : null}
      </div>
    </div>
  );
}

function TopNavButton({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={cx(
        'rounded-full px-4 py-2 text-sm font-medium transition',
        active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100',
      )}
    >
      {children}
    </button>
  );
}

function ActionMenu({
  entry,
  open,
  onToggle,
}: {
  entry: TimesheetEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cx(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
          entry.status === 'Pending'
            ? 'bg-[#0b2a4a] text-white hover:bg-[#102f50]'
            : entry.status === 'Approved'
              ? 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'border border-[#c51d4a]/15 bg-white text-[#c51d4a] hover:bg-[#c51d4a]/5',
        )}
      >
        {entry.status === 'Pending' ? 'Approve' : entry.status === 'Approved' ? 'Revert' : 'Rejected'}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && entry.status === 'Pending' ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">Approve</button>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#c51d4a] hover:bg-[#c51d4a]/5">Reject</button>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100">View Details</button>
        </div>
      ) : null}
    </div>
  );
}

export default function TimesheetApprovals() {
  const [selected, setSelected] = useState<number[]>([1, 3, 6]);
  const [userFilter, setUserFilter] = useState('All Users');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entriesSeed.filter((entry) => {
      const userOk = userFilter === 'All Users' || entry.user === userFilter;
      const projectOk = projectFilter === 'All Projects' || entry.project === projectFilter;
      const statusOk = statusFilter === 'All Status' || entry.status === statusFilter;
      const searchOk =
        !q ||
        [entry.date, entry.user, entry.project, entry.task, String(entry.hours), entry.status].join(' ').toLowerCase().includes(q);
      return userOk && projectOk && statusOk && searchOk;
    });
  }, [userFilter, projectFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const counts = useMemo(
    () => ({
      pending: entriesSeed.filter((e) => e.status === 'Pending').length,
      approved: entriesSeed.filter((e) => e.status === 'Approved').length,
      rejected: entriesSeed.filter((e) => e.status === 'Rejected').length,
    }),
    [],
  );

  const selectedCount = selected.filter((id) => filtered.some((e) => e.id === id)).length;

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = () => {
    const visibleIds = pageItems.map((e) => e.id);
    const allSelected = visibleIds.every((id) => selected.includes(id));
    setSelected((prev) => (allSelected ? prev.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds]))));
  };

  return (
    <div className="min-h-screen bg-[#eef1f6] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(11,42,74,0.08)]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c51d4a] text-[11px] font-semibold text-white">CGI</div>
            <div>
              <div className="text-sm font-semibold text-slate-900">CGI</div>
              <div className="text-xs text-slate-500">Timesheet Management</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
            <TopNavButton active>Home</TopNavButton>
            <TopNavButton>Add Timesheet</TopNavButton>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#c51d4a] via-[#cc2269] to-[#6f2dbd] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">CGI Timesheet Portal</div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back, Alex</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
                Review your recent timesheets, track weekly hours, and submit new work entries through a clean, modern dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">
                  <Plus className="h-4 w-4" />
                  Add Timesheet
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15">
                  View History
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs text-white/75">Total Hours</div>
                <div className="mt-1 text-3xl font-semibold">30</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs text-white/75">Approved</div>
                <div className="mt-1 text-3xl font-semibold">2</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs text-white/75">Pending</div>
                <div className="mt-1 text-3xl font-semibold">1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {/* Summary cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard label="This Month" value="42.0" sublabel="Logged hours so far" tone="pink" icon={<Clock3 className="h-4 w-4" />} />
            <StatCard label="Approvals" value="2" sublabel="Ready for payroll" tone="purple" icon={<CircleCheckBig className="h-4 w-4" />} />
            <StatCard label="Pending Review" value="1" sublabel="Entries awaiting action" tone="blue" icon={<CircleAlert className="h-4 w-4" />} />
          </div>

          <div className="mt-6 space-y-5">
            {/* Filters */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                  <p className="text-xs text-slate-500">Narrow the list before taking action.</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-[#c51d4a] hover:text-[#a31a3d]"
                  onClick={() => {
                    setUserFilter('All Users');
                    setProjectFilter('All Projects');
                    setStatusFilter('All Status');
                    setSearch('');
                    setPage(1);
                  }}
                >
                  Clear all
                </button>
              </div>

              <div className="grid gap-3 xl:grid-cols-[1fr_1.2fr_1fr_1fr]">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">User</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
                    <User2 className="h-4 w-4 shrink-0 text-slate-500" />
                    <select
                      value={userFilter}
                      onChange={(e) => {
                        setUserFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    >
                      {users.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Date range</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
                    <input
                      type="text"
                      defaultValue="2024-04-01 — 2024-04-24"
                      className="w-full bg-transparent text-sm outline-none"
                      aria-label="Date range"
                    />
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Project</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
                    <Filter className="h-4 w-4 shrink-0 text-slate-500" />
                    <select
                      value={projectFilter}
                      onChange={(e) => {
                        setProjectFilter(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
                    <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as StatusFilter);
                        setPage(1);
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </div>
                </label>
              </div>
            </div>

            {/* Primary toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#0b2a4a] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#102f50]">
                  Apply Filters
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Approve Selected ({selectedCount}) <ChevronDown className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  Reject Selected ({selectedCount}) <ChevronDown className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>

              <label className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:max-w-sm">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search entries"
                />
              </label>
            </div>

            {/* Bulk summary row */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  className="inline-flex items-center gap-3 rounded-xl bg-[#0b2a4a] px-4 py-3 text-white shadow-sm transition hover:bg-[#102f50] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Approve {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={selectedCount === 0}
                  className="inline-flex items-center gap-3 rounded-xl border border-[#c51d4a]/15 bg-white px-4 py-3 text-[#c51d4a] shadow-sm transition hover:bg-[#c51d4a]/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  <span className="font-medium">Reject {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-slate-500">Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-transparent text-sm outline-none"
                >
                  {[5, 6, 10, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-sm font-semibold text-slate-700">
                      <th className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every((e) => selected.includes(e.id))}
                          onChange={selectAllVisible}
                          className="h-4 w-4 rounded border-slate-300 text-[#0b2a4a] focus:ring-[#0b2a4a]"
                          aria-label="Select all visible"
                        />
                      </th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">User</th>
                      <th className="px-4 py-4">Project</th>
                      <th className="px-4 py-4">Task</th>
                      <th className="px-4 py-4">Hours</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {pageItems.map((entry) => {
                      const selectedRow = selected.includes(entry.id);
                      const menuOpen = openActionMenu === entry.id;

                      return (
                        <tr key={entry.id} className={cx('transition hover:bg-slate-50', selectedRow && 'bg-[#0b2a4a]/5')}>
                          <td className="px-4 py-4 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedRow}
                              onChange={() => toggle(entry.id)}
                              className="h-4 w-4 rounded border-slate-300 text-[#0b2a4a] focus:ring-[#0b2a4a]"
                              aria-label={`Select row ${entry.id}`}
                            />
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.date}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={entry.user} />
                              <span className="text-sm font-medium text-slate-900">{entry.user}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.project}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.task}</td>
                          <td className="px-4 py-4 text-sm text-slate-700">{entry.hours}</td>
                          <td className="px-4 py-4">
                            <StatusBadge status={entry.status} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <ActionMenu
                                entry={entry}
                                open={menuOpen}
                                onToggle={() => setOpenActionMenu((curr) => (curr === entry.id ? null : entry.id))}
                              />
                              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                                <Eye className="h-4 w-4" /> View
                              </button>
                              <button className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-4 lg:hidden">
              {pageItems.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(entry.id)}
                        onChange={() => toggle(entry.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b2a4a] focus:ring-[#0b2a4a]"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <Avatar name={entry.user} />
                          {entry.user}
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{entry.date}</p>
                      </div>
                    </label>
                    <StatusBadge status={entry.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Project</div>
                      <div className="font-medium text-slate-900">{entry.project}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Task</div>
                      <div className="font-medium text-slate-900">{entry.task}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Hours</div>
                      <div className="font-medium text-slate-900">{entry.hours}</div>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        View
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <ActionMenu
                      entry={entry}
                      open={openActionMenu === entry.id}
                      onToggle={() => setOpenActionMenu((curr) => (curr === entry.id ? null : entry.id))}
                    />
                    <button className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{pageItems.length}</span> of <span className="font-medium text-slate-700">{filtered.length}</span> filtered entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm text-slate-700">
                  Page <span className="font-semibold">{safePage}</span> of <span className="font-semibold">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
