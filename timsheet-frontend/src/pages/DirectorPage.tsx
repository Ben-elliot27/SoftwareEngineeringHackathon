import React, { useMemo, useState } from "react";
import {
  approveTimesheet,
  listTimesheets,
  rejectTimesheet,
  type EntryStatus,
  type TimesheetEntry,
} from "../lib/api";
import { useAuthSession } from "../lib/useAuthSession";

type Status = "Pending" | "Approved" | "Rejected";
type StatusFilter = "All Status" | Status;

type UiEntry = {
  id: number;
  date: string;
  user: string;
  project: string;
  task: string;
  hours: number;
  status: Status;
};

function mapStatus(status: EntryStatus): Status {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function toUiEntry(entry: TimesheetEntry): UiEntry {
  return {
    id: entry.id,
    date: entry.entry_date,
    user: entry.user?.name ?? `User #${entry.user_id}`,
    project: entry.time_code?.code ?? `Time Code #${entry.time_code_id}`,
    task: entry.description || "Timesheet entry",
    hours: entry.hours,
    status: mapStatus(entry.status),
  };
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Pending: "bg-amber-50 text-amber-800 ring-amber-200",
    Approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    Rejected: "bg-rose-50 text-rose-800 ring-rose-200",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>{status}</span>;
}

function LoginView({ onLogin, error }: { onLogin: (email: string, password: string) => Promise<void>; error: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="director-login-email">Email</label>
        <input id="director-login-email" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="director-login-password">Password</label>
        <input id="director-login-password" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white" type="submit">Sign in</button>
      </form>
    </div>
  );
}

export default function TimesheetApprovals() {
  const { loading: authLoading, isAuthenticated, signIn, token, user, logout, error: authError } = useAuthSession();
  const [entries, setEntries] = useState<UiEntry[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [userFilter, setUserFilter] = useState("All Users");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Pending");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!token) return;

    let cancelled = false;

    listTimesheets(token)
      .then((data) => {
        if (cancelled) return;
        setEntries(data.map(toUiEntry).sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load timesheets");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const users = useMemo(() => ["All Users", ...Array.from(new Set(entries.map((e) => e.user)))], [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const userOk = userFilter === "All Users" || entry.user === userFilter;
      const statusOk = statusFilter === "All Status" || entry.status === statusFilter;
      const dateOk = (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate);
      const searchOk = !q || [entry.date, entry.user, entry.project, entry.task, String(entry.hours), entry.status].join(" ").toLowerCase().includes(q);
      return userOk && statusOk && dateOk && searchOk;
    });
  }, [entries, userFilter, statusFilter, startDate, endDate, search]);

  const counts = useMemo(() => ({
    totalHours: entries.reduce((sum, entry) => sum + entry.hours, 0),
    approved: entries.filter((e) => e.status === "Approved").length,
    pending: entries.filter((e) => e.status === "Pending").length,
    rejected: entries.filter((e) => e.status === "Rejected").length,
  }), [entries]);

  async function refreshEntries() {
    if (!token) return;
    const data = await listTimesheets(token);
    setEntries(data.map(toUiEntry).sort((a, b) => b.date.localeCompare(a.date)));
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading session...</div>;
  }

  if (!isAuthenticated || !token || !user) {
    return <LoginView onLogin={signIn} error={authError} />;
  }

  if (!(user.role === "manager" || user.role === "admin")) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-sm font-medium text-rose-700">Manager/Admin only</div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">You do not have access to this page</h1>
          <button className="mt-6 rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef1f6] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(11,42,74,0.08)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
          <div>
            <div className="text-sm font-semibold text-slate-900">CGI Approvals</div>
            <div className="text-xs text-slate-500">Signed in as {user.name}</div>
          </div>
          <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={logout}>Sign out</button>
        </div>

        <div className="bg-gradient-to-r from-[#c51d4a] via-[#cc2269] to-[#6f2dbd] px-6 py-10 text-white sm:px-8 sm:py-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Timesheet approvals dashboard</h1>
          <p className="mt-4 max-w-xl text-sm text-white/85">Review submitted timesheets, filter entries, and approve or reject directly from this page.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-4"><div className="text-xs">Pending</div><div className="mt-2 text-3xl font-semibold">{counts.pending}</div></div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-4"><div className="text-xs">Approved</div><div className="mt-2 text-3xl font-semibold">{counts.approved}</div></div>
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-4"><div className="text-xs">Rejected</div><div className="mt-2 text-3xl font-semibold">{counts.rejected}</div></div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-5">
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                {users.map((u) => <option key={u}>{u}</option>)}
              </select>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
                {["All Status", "Pending", "Approved", "Rejected"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <input type="date" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Search entries" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm font-semibold text-slate-700">
                  <th className="w-12 px-4 py-4"><input type="checkbox" checked={filtered.length > 0 && filtered.every((e) => selected.includes(e.id))} onChange={() => {
                    const allSelected = filtered.length > 0 && filtered.every((e) => selected.includes(e.id));
                    setSelected(allSelected ? [] : filtered.map((e) => e.id));
                  }} /></th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Project</th>
                  <th className="px-4 py-4">Hours</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((entry) => {
                  const selectedRow = selected.includes(entry.id);
                  return (
                    <tr key={entry.id} className={selectedRow ? "bg-[#0b2a4a]/5" : ""}>
                      <td className="px-4 py-4"><input type="checkbox" checked={selectedRow} onChange={() => setSelected((prev) => prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id])} /></td>
                      <td className="px-4 py-4 text-sm">{entry.date}</td>
                      <td className="px-4 py-4 text-sm">{entry.user}</td>
                      <td className="px-4 py-4 text-sm"><div className="font-medium">{entry.project}</div><div className="text-xs text-slate-500">{entry.task}</div></td>
                      <td className="px-4 py-4 text-sm">{entry.hours}</td>
                      <td className="px-4 py-4"><StatusBadge status={entry.status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="rounded-xl bg-[#0b2a4a] px-3 py-2 text-xs text-white disabled:opacity-40" disabled={entry.status !== "Pending"} onClick={async () => {
                            try {
                              await approveTimesheet(token, entry.id);
                              await refreshEntries();
                            } catch (actionError: unknown) {
                              setError(actionError instanceof Error ? actionError.message : "Unable to approve");
                            }
                          }}>Approve</button>
                          <button className="rounded-xl border border-[#c51d4a]/25 px-3 py-2 text-xs text-[#c51d4a] disabled:opacity-40" disabled={entry.status !== "Pending"} onClick={async () => {
                            try {
                              await rejectTimesheet(token, entry.id, "Rejected from approvals dashboard");
                              await refreshEntries();
                            } catch (actionError: unknown) {
                              setError(actionError instanceof Error ? actionError.message : "Unable to reject");
                            }
                          }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-[#0b2a4a] px-4 py-2 text-sm text-white disabled:opacity-50" disabled={selected.length === 0} onClick={async () => {
              const pendingSelected = entries.filter((item) => selected.includes(item.id) && item.status === "Pending");
              if (pendingSelected.length === 0) {
                setError("Only pending entries can be approved in bulk");
                return;
              }

              setError("");
              try {
                const results = await Promise.allSettled(pendingSelected.map((item) => approveTimesheet(token, item.id)));
                const succeededIds = pendingSelected
                  .filter((_, index) => results[index]?.status === "fulfilled")
                  .map((item) => item.id);
                const failedCount = results.length - succeededIds.length;

                setSelected((current) => current.filter((id) => !succeededIds.includes(id)));
                await refreshEntries();

                if (failedCount > 0) {
                  setError(`${failedCount} approval request${failedCount === 1 ? "" : "s"} failed`);
                }
              } catch (bulkError: unknown) {
                setError(bulkError instanceof Error ? bulkError.message : "Bulk approval failed");
              }
            }}>Approve Selected ({selected.length})</button>
            <button className="rounded-xl border border-[#c51d4a]/25 px-4 py-2 text-sm text-[#c51d4a] disabled:opacity-50" disabled={selected.length === 0} onClick={async () => {
              const pendingSelected = entries.filter((item) => selected.includes(item.id) && item.status === "Pending");
              if (pendingSelected.length === 0) {
                setError("Only pending entries can be rejected in bulk");
                return;
              }

              setError("");
              try {
                const results = await Promise.allSettled(pendingSelected.map((item) => rejectTimesheet(token, item.id, "Rejected in bulk")));
                const succeededIds = pendingSelected
                  .filter((_, index) => results[index]?.status === "fulfilled")
                  .map((item) => item.id);
                const failedCount = results.length - succeededIds.length;

                setSelected((current) => current.filter((id) => !succeededIds.includes(id)));
                await refreshEntries();

                if (failedCount > 0) {
                  setError(`${failedCount} rejection request${failedCount === 1 ? "" : "s"} failed`);
                }
              } catch (bulkError: unknown) {
                setError(bulkError instanceof Error ? bulkError.message : "Bulk rejection failed");
              }
            }}>Reject Selected ({selected.length})</button>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">Total filtered hours: {filtered.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
