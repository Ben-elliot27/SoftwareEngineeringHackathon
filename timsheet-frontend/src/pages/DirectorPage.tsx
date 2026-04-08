import React, { useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Eye,
  Filter,
  Search,
  User2,
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
    status === 'Pending' ? (
      <Clock3 className="h-4 w-4" />
    ) : status === 'Approved' ? (
      <CircleCheckBig className="h-4 w-4" />
    ) : (
      <CircleX className="h-4 w-4" />
    );

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

function MetricCard({
  label,
  value,
  sublabel,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  sublabel: string;
  tone: 'red' | 'green' | 'blue';
  icon: React.ReactNode;
}) {
  const accent =
    tone === 'red'
      ? 'bg-rose-500'
      : tone === 'green'
        ? 'bg-emerald-500'
        : 'bg-sky-500';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={cx('mb-4 h-1 w-16 rounded-full', accent)} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{value}</div>
          <div className="mt-2 text-sm text-slate-500">{sublabel}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-slate-500">{icon}</div>
      </div>
    </div>
  );
}

function ActionMenu({
  entry,
  open,
  onToggle,
  onApprove,
  onReject,
}: {
  entry: TimesheetEntry;
  open: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="relative flex">
      <button
        type="button"
        onClick={onToggle}
        className={cx(
          'inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition',
          entry.status === 'Pending'
            ? 'bg-[#0b2a4a] text-white hover:bg-[#102f50]'
            : entry.status === 'Approved'
              ? 'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'border border-[#c51d4a]/15 bg-white text-[#c51d4a] hover:bg-[#c51d4a]/5',
        )}
      >
        {entry.status === 'Pending' ? 'Approve' : entry.status === 'Approved' ? 'Approved' : 'Rejected'}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          <button onClick={onApprove} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100">
            Approve
          </button>
          <button onClick={onReject} className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#c51d4a] hover:bg-[#c51d4a]/5">
            Reject
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
          <BadgeCheck className="h-4 w-4" />
          Director only
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">You do not have access to this page</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This review page is intended for Directors who approve or reject submitted timesheets.
        </p>
      </div>
    </div>
  );
}

export default function TimesheetApprovals() {
  const currentUserRole: 'admin' | 'user' = 'admin';
  if (currentUserRole !== 'admin') return <AccessDenied />;

  const [entries, setEntries] = useState<TimesheetEntry[]>(entriesSeed);
  const [userFilter, setUserFilter] = useState('All Users');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  const pageSize = 6;
  const tableRef = useRef<HTMLDivElement | null>(null);

  const handleOpenPendingEntries = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateStatus = (id: number, status: Status) => {
    setEntries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setOpenActionMenu(null);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const userOk = userFilter === 'All Users' || entry.user === userFilter;
      const projectOk = projectFilter === 'All Projects' || entry.project === projectFilter;
      const statusOk = statusFilter === 'All Status' || entry.status === statusFilter;
      const searchOk =
        !q ||
        [entry.date, entry.user, entry.project, entry.task, String(entry.hours), entry.status]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const dateOk = (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate);
      return userOk && projectOk && statusOk && searchOk && dateOk;
    });
  }, [entries, userFilter, projectFilter, statusFilter, search, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const counts = useMemo(
    () => ({
      approved: entries.filter((e) => e.status === 'Approved').length,
      pending: entries.filter((e) => e.status === 'Pending').length,
      rejected: entries.filter((e) => e.status === 'Rejected').length,
    }),
    [entries],
  );

  const clearAll = () => {
    setUserFilter('All Users');
    setProjectFilter('All Projects');
    setStatusFilter('All Status');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">CGI Timesheet Review</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Timesheet Review Dashboard</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Review submitted timesheets, filter by user, project, date, or status, and approve or reject entries from one.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleOpenPendingEntries}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                <BadgeCheck className="h-4 w-4" />
                Open Pending Entries
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="Rejected Timesheets"
            value={counts.rejected}
            sublabel="Entries rejected by admins"
            tone="red"
            icon={<CircleX className="h-4 w-4" />}
          />
          <MetricCard
            label="Approved Timesheets"
            value={counts.approved}
            sublabel="Ready for payroll"
            tone="green"
            icon={<CircleCheckBig className="h-4 w-4" />}
          />
          <MetricCard
            label="Pending Review"
            value={counts.pending}
            sublabel="Entries awaiting action"
            tone="blue"
            icon={<CircleAlert className="h-4 w-4" />}
          />
        </div>

        <div ref={tableRef} className="mt-6 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                <p className="text-xs text-slate-500">Focus on the entries that need your review.</p>
              </div>
              <button type="button" className="text-xs font-medium text-[#c51d4a] hover:text-[#a31a3d]" onClick={clearAll}>
                Clear all
              </button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_1.2fr_1fr_1fr]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">User</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
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
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Date range</span>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                      aria-label="Start date"
                    />
                  </div>
                  <span className="text-slate-300">—</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-transparent text-sm outline-none"
                    aria-label="End date"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Project</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
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
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
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
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
            <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:max-w-sm">
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

          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Project</th>
                    <th className="px-6 py-4 text-left">Task</th>
                    <th className="px-6 py-4 text-left">Hours</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((entry) => {
                    const menuOpen = openActionMenu === entry.id;

                    return (
                      <tr key={entry.id} className="group transition hover:bg-slate-50">
                        <td className="px-6 py-5 text-sm text-slate-600">{entry.date}</td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={entry.user} />
                            <span className="text-sm font-medium text-slate-900">{entry.user}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">{entry.project}</td>
                        <td className="px-6 py-5 text-sm text-slate-600">{entry.task}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-800">{entry.hours}</td>

                        <td className="px-6 py-5">
                          <StatusBadge status={entry.status} />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <ActionMenu
                              entry={entry}
                              open={menuOpen}
                              onToggle={() => setOpenActionMenu((curr) => (curr === entry.id ? null : entry.id))}
                              onApprove={() => updateStatus(entry.id, 'Approved')}
                              onReject={() => updateStatus(entry.id, 'Rejected')}
                            />

                            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                              View
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

          <div className="grid gap-4 lg:hidden">
            {pageItems.map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Avatar name={entry.user} />
                      {entry.user}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{entry.date}</p>
                  </div>
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
                    onApprove={() => updateStatus(entry.id, 'Approved')}
                    onReject={() => updateStatus(entry.id, 'Rejected')}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{pageItems.length}</span> of{' '}
              <span className="font-medium text-slate-700">{filtered.length}</span> filtered entries
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
      </main>
    </div>
  );
}