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
} from 'lucide-react';

type Status = 'Pending' | 'Approved' | 'Rejected';

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
const statuses: Array<'All Status' | Status> = ['All Status', 'Pending', 'Approved', 'Rejected'];

function StatusBadge({ status }: { status: Status }) {
  const classes =
    status === 'Pending'
      ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
      : status === 'Approved'
        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
        : 'bg-rose-100 text-rose-800 ring-1 ring-rose-200';

  const icon =
    status === 'Pending' ? <Clock3 className="h-4 w-4" /> : status === 'Approved' ? <CircleCheckBig className="h-4 w-4" /> : <CircleX className="h-4 w-4" />;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium ${classes}`}>
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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 ring-1 ring-slate-300">
      {initials}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'emerald' | 'rose';
  icon: React.ReactNode;
}) {
  const toneClasses =
    tone === 'amber'
      ? 'bg-amber-100 text-amber-700'
      : tone === 'emerald'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-rose-100 text-rose-700';

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses}`}>{icon}</div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-lg font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

export default function TimesheetApprovals() {
  const [selected, setSelected] = useState<number[]>([1, 3, 6]);
  const [userFilter, setUserFilter] = useState('All Users');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState<'All Status' | Status>('Pending');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(6);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return entriesSeed.filter((entry) => {
      const userOk = userFilter === 'All Users' || entry.user === userFilter;
      const projectOk = projectFilter === 'All Projects' || entry.project === projectFilter;
      const statusOk = statusFilter === 'All Status' || entry.status === statusFilter;
      const searchOk =
        !q ||
        [entry.date, entry.user, entry.project, entry.task, String(entry.hours), entry.status]
          .join(' ')
          .toLowerCase()
          .includes(q);

      return userOk && projectOk && statusOk && searchOk;
    });
  }, [userFilter, projectFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingCount = entriesSeed.filter((e) => e.status === 'Pending').length;
  const approvedCount = entriesSeed.filter((e) => e.status === 'Approved').length;
  const rejectedCount = entriesSeed.filter((e) => e.status === 'Rejected').length;

  const selectedCount = selected.filter((id) => filtered.some((e) => e.id === id)).length;

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = () => {
    const visibleIds = pageItems.map((e) => e.id);
    const allSelected = visibleIds.every((id) => selected.includes(id));
    setSelected((prev) => (allSelected ? prev.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds]))));
  };

  const badgeTone = statusFilter === 'Pending' ? 'text-amber-700' : statusFilter === 'Approved' ? 'text-emerald-700' : 'text-rose-700';

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Timesheet Approvals</h1>
            <p className="mt-1 text-sm text-slate-500">Review and approve user submitted timesheets.</p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">L</div>
            <span className="hidden sm:inline">Liam Whitehead</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="relative overflow-hidden px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-[42px] bg-gradient-to-b from-rose-500 via-fuchsia-600 to-indigo-600 opacity-90" />
          <div className="pointer-events-none absolute right-8 top-24 h-20 w-20 rounded-tl-[28px] bg-gradient-to-b from-rose-500 via-fuchsia-600 to-indigo-600 opacity-90" />

          <div className="relative z-10 space-y-5">
            {/* Filters */}
            <div className="grid gap-3 xl:grid-cols-[220px_1fr_1fr_auto]">
              <label className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:ring-2 focus-within:ring-slate-300">
                <User2 className="h-4 w-4 text-slate-500" />
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
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </label>

              <label className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:ring-2 focus-within:ring-slate-300">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  defaultValue="2024-04-01  —  2024-04-24"
                  className="w-full bg-transparent text-sm outline-none"
                  aria-label="Date range"
                />
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-300">
                  <Filter className="h-4 w-4 text-slate-500" />
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
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-300">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'All Status' | Status);
                      setPage(1);
                    }}
                    className={`w-full bg-transparent text-sm outline-none ${badgeTone}`}
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <div className="hidden items-center justify-end gap-3 xl:flex">
                  <StatCard label="Pending" value={pendingCount} tone="amber" icon={<CircleAlert className="h-5 w-5" />} />
                  <StatCard label="Approved Today" value={approvedCount} tone="emerald" icon={<CircleCheckBig className="h-5 w-5" />} />
                  <StatCard label="Rejected" value={rejectedCount} tone="rose" icon={<CircleX className="h-5 w-5" />} />
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700">
                  Apply Filters
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
                  Approve Selected <ChevronDown className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
                  Reject Selected <ChevronDown className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100">
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

            {/* Bulk bar / paging row */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-white shadow-sm">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Approve ({selectedCount})</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
                <div className="inline-flex items-center gap-3 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white px-4 py-3 text-rose-700 shadow-sm">
                  <X className="h-5 w-5" />
                  <span className="font-medium">Reject ({selectedCount})</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
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
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-sm font-semibold text-slate-700">
                      <th className="w-12 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={pageItems.length > 0 && pageItems.every((e) => selected.includes(e.id))}
                          onChange={selectAllVisible}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
                      return (
                        <tr key={entry.id} className={selectedRow ? 'bg-slate-50/80' : ''}>
                          <td className="px-4 py-4 align-middle">
                            <input
                              type="checkbox"
                              checked={selectedRow}
                              onChange={() => toggle(entry.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
                              {entry.status === 'Pending' ? (
                                <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                                  Approve <ChevronDown className="h-4 w-4" />
                                </button>
                              ) : entry.status === 'Approved' ? (
                                <button className="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                                  Revert
                                </button>
                              ) : (
                                <button className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
                                  Rejected
                                </button>
                              )}
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
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
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
                    {entry.status === 'Pending' ? (
                      <button className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white">
                        Approve
                      </button>
                    ) : entry.status === 'Approved' ? (
                      <button className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700">
                        Revert
                      </button>
                    ) : (
                      <button className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
                        Rejected
                      </button>
                    )}
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
