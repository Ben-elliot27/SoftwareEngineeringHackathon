import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleX,
  Clock3,
  Eye,
  Filter,
  Search,
  User2,
} from 'lucide-react';
import {
  approveTimesheet,
  listTimesheets,
  rejectTimesheet,
  type EntryStatus,
  type TimesheetEntry,
} from '../lib/api';
import { useAuthSession } from '../lib/useAuthSession';

type Status = 'Pending' | 'Approved' | 'Rejected';
type StatusFilter = 'All Status' | Status;

type UiEntry = {
  id: number;
  date: string;
  user: string;
  project: string;
  task: string;
  hours: number;
  status: Status;
};

const pageSize = 6;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

function mapStatus(status: EntryStatus): Status {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function toUiEntry(entry: TimesheetEntry): UiEntry {
  return {
    id: entry.id,
    date: entry.entry_date,
    user: entry.user?.name ?? `User #${entry.user_id}`,
    project: entry.time_code?.code ?? `Time Code #${entry.time_code_id}`,
    task: entry.description || 'Timesheet entry',
    hours: entry.hours,
    status: mapStatus(entry.status),
  };
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
  const accent = tone === 'red' ? 'bg-rose-500' : tone === 'green' ? 'bg-emerald-500' : 'bg-sky-500';

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
  disabled,
}: {
  entry: UiEntry;
  open: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cx(
          'inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
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

function LoginView({ onLogin, error }: { onLogin: (email: string, password: string) => Promise<void>; error: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        onSubmit={async (event) => {
          event.preventDefault();
          await onLogin(email, password);
        }}
      >
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Authenticate to review and approve timesheets.</p>

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="director-login-email">
          Email
        </label>
        <input
          id="director-login-email"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#c51d4a]/15"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="director-login-password">
          Password
        </label>
        <input
          id="director-login-password"
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#c51d4a]/15"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}

function AccessDenied({ onLogout }: { onLogout: () => void }) {
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
        <button className="mt-6 rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function TimesheetApprovals() {
  const { loading: authLoading, isAuthenticated, signIn, token, user, logout, error: authError } = useAuthSession();
  const [entries, setEntries] = useState<UiEntry[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [userFilter, setUserFilter] = useState('All Users');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [error, setError] = useState('');
  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    listTimesheets(token)
      .then((data) => {
        if (cancelled) return;
        setEntries(data.map(toUiEntry).sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load timesheets');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const users = useMemo(() => ['All Users', ...Array.from(new Set(entries.map((e) => e.user)))], [entries]);
  const projects = useMemo(() => ['All Projects', ...Array.from(new Set(entries.map((e) => e.project)))], [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const userOk = userFilter === 'All Users' || entry.user === userFilter;
      const projectOk = projectFilter === 'All Projects' || entry.project === projectFilter;
      const statusOk = statusFilter === 'All Status' || entry.status === statusFilter;
      const dateOk = (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate);
      const searchOk =
        !q ||
        [entry.date, entry.user, entry.project, entry.task, String(entry.hours), entry.status]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return userOk && projectOk && statusOk && dateOk && searchOk;
    });
  }, [entries, userFilter, projectFilter, statusFilter, startDate, endDate, search]);

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

  const totalFilteredHours = useMemo(() => filtered.reduce((sum, item) => sum + item.hours, 0), [filtered]);

  const clearAll = () => {
    setUserFilter('All Users');
    setProjectFilter('All Projects');
    setStatusFilter('Pending');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setPage(1);
    setSelected([]);
  };

  async function refreshEntries() {
    if (!token) return;
    const data = await listTimesheets(token);
    setEntries(data.map(toUiEntry).sort((a, b) => b.date.localeCompare(a.date)));
  }

  async function approveOne(entryId: number) {
    if (!token) return;
    try {
      setError('');
      await approveTimesheet(token, entryId);
      await refreshEntries();
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to approve');
    }
  }

  async function rejectOne(entryId: number) {
    if (!token) return;
    try {
      setError('');
      await rejectTimesheet(token, entryId, 'Rejected from approvals dashboard');
      await refreshEntries();
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to reject');
    }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading session...</div>;
  }

  if (!isAuthenticated || !token || !user) {
    return <LoginView onLogin={signIn} error={authError} />;
  }

  if (!(user.role === 'manager' || user.role === 'admin')) {
    return <AccessDenied onLogout={logout} />;
  }

  const selectedPendingIds = entries.filter((item) => selected.includes(item.id) && item.status === 'Pending').map((item) => item.id);

  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
        <div>
          <div className="text-sm font-semibold text-slate-900">CGI Approvals</div>
          <div className="text-xs text-slate-500">Signed in as {user.name}</div>
        </div>
        <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#c51d4a] via-[#cc2269] to-[#6f2dbd] px-6 py-10 text-white sm:px-8 sm:py-12">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">CGI Timesheet Review</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Timesheet Review Dashboard</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
            Review submitted timesheets, filter by user, project, date, or status, and approve or reject entries from one page.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              <BadgeCheck className="h-4 w-4" />
              Open Pending Entries
            </button>
          </div>
        </div>
      </div>

      <main className="space-y-5 px-6 py-6 sm:px-8">
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

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div ref={tableRef} className="space-y-5">
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

            <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.2fr_1fr_1fr]">
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
                    {['All Status', 'Pending', 'Approved', 'Rejected'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex flex-col gap-1.5 xl:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Search</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#c51d4a]/15">
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
                </div>
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden lg:block">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-12 px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={pageItems.length > 0 && pageItems.every((e) => selected.includes(e.id))}
                        onChange={() => {
                          const allSelected = pageItems.length > 0 && pageItems.every((e) => selected.includes(e.id));
                          setSelected(
                            allSelected
                              ? selected.filter((id) => !pageItems.some((e) => e.id === id))
                              : Array.from(new Set([...selected, ...pageItems.map((e) => e.id)])),
                          );
                        }}
                      />
                    </th>
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
                    const isSelected = selected.includes(entry.id);

                    return (
                      <tr key={entry.id} className={cx('group transition hover:bg-slate-50', isSelected && 'bg-[#0b2a4a]/5')}>
                        <td className="px-6 py-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelected((prev) => (prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id]))
                            }
                          />
                        </td>

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
                              onApprove={() => approveOne(entry.id)}
                              onReject={() => rejectOne(entry.id)}
                              disabled={entry.status !== 'Pending'}
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

            <div className="grid gap-4 p-4 lg:hidden">
              {pageItems.map((entry) => {
                const menuOpen = openActionMenu === entry.id;
                const isSelected = selected.includes(entry.id);

                return (
                  <div key={entry.id} className={cx('rounded-3xl border border-slate-200 bg-white p-4 shadow-sm', isSelected && 'ring-2 ring-[#0b2a4a]/15')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-2"
                          checked={isSelected}
                          onChange={() =>
                            setSelected((prev) => (prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id]))
                          }
                        />
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <Avatar name={entry.user} />
                            {entry.user}
                          </div>
                          <p className="mt-2 text-sm text-slate-500">{entry.date}</p>
                        </div>
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
                        open={menuOpen}
                        onToggle={() => setOpenActionMenu((curr) => (curr === entry.id ? null : entry.id))}
                        onApprove={() => approveOne(entry.id)}
                        onReject={() => rejectOne(entry.id)}
                        disabled={entry.status !== 'Pending'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-[#0b2a4a] px-4 py-2 text-sm text-white disabled:opacity-50"
              disabled={selectedPendingIds.length === 0}
              onClick={async () => {
                if (!token) return;

                if (selectedPendingIds.length === 0) {
                  setError('Only pending entries can be approved in bulk');
                  return;
                }

                setError('');
                try {
                  const results = await Promise.allSettled(selectedPendingIds.map((id) => approveTimesheet(token, id)));
                  const succeededIds = selectedPendingIds.flatMap((id, index) => (results[index].status === 'fulfilled' ? [id] : []));
                  const failedCount = results.length - succeededIds.length;

                  setSelected((current) => current.filter((id) => !succeededIds.includes(id)));
                  await refreshEntries();

                  if (failedCount > 0) {
                    setError(`${failedCount} approval request${failedCount === 1 ? '' : 's'} failed. Please retry or check permissions.`);
                  }
                } catch (bulkError: unknown) {
                  setError(bulkError instanceof Error ? bulkError.message : 'Bulk approval failed');
                }
              }}
            >
              Approve Selected ({selected.length})
            </button>

            <button
              className="rounded-xl border border-[#c51d4a]/25 px-4 py-2 text-sm text-[#c51d4a] disabled:opacity-50"
              disabled={selectedPendingIds.length === 0}
              onClick={async () => {
                if (!token) return;

                if (selectedPendingIds.length === 0) {
                  setError('Only pending entries can be rejected in bulk');
                  return;
                }

                setError('');
                try {
                  const results = await Promise.allSettled(selectedPendingIds.map((id) => rejectTimesheet(token, id, 'Rejected in bulk')));
                  const succeededIds = selectedPendingIds.flatMap((id, index) => (results[index].status === 'fulfilled' ? [id] : []));
                  const failedCount = results.length - succeededIds.length;

                  setSelected((current) => current.filter((id) => !succeededIds.includes(id)));
                  await refreshEntries();

                  if (failedCount > 0) {
                    setError(`${failedCount} rejection request${failedCount === 1 ? '' : 's'} failed. Please retry or check permissions.`);
                  }
                } catch (bulkError: unknown) {
                  setError(bulkError instanceof Error ? bulkError.message : 'Bulk rejection failed');
                }
              }}
            >
              Reject Selected ({selected.length})
            </button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Total filtered hours: {totalFilteredHours.toFixed(1)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}