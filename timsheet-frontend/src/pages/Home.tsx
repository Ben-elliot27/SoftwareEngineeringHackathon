import * as React from "react";
import { Link } from "react-router-dom";
import { listTimesheets, type EntryStatus, type TimesheetEntry } from "../lib/api";
import { useAuthSession } from "../lib/useAuthSession";

type UiStatus = "Pending" | "Approved" | "Rejected";

type UiEntry = {
  id: number;
  employee: string;
  date: string;
  hours: number;
  project: string;
  description: string;
  status: UiStatus;
};

type TopHeaderProps = {
  page: "home" | "history";
  setPage: (page: "home" | "history") => void;
  userName: string;
  onLogout: () => void;
};

type HeroStatProps = {
  label: string;
  value: string;
};

type SummaryCardProps = {
  label: string;
  value: string;
  subtext: string;
  accent: string;
};

type StatusBadgeProps = {
  status: UiStatus;
};

function titleCaseStatus(status: EntryStatus): UiStatus {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function mapEntryToUi(entry: TimesheetEntry): UiEntry {
  return {
    id: entry.id,
    employee: entry.user?.name ?? `User #${entry.user_id}`,
    date: entry.entry_date,
    hours: entry.hours,
    project: entry.time_code?.code ?? `Time Code #${entry.time_code_id}`,
    description: entry.description?.trim() || entry.time_code?.description || "Timesheet entry",
    status: titleCaseStatus(entry.status),
  };
}

function LoginView({ onLogin, error, busy }: { onLogin: (email: string, password: string) => Promise<void>; error: string; busy: boolean }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

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
        <p className="mt-1 text-sm text-slate-500">Authenticate to view and manage timesheets.</p>
        <label className="mt-5 block text-sm text-slate-700">Email</label>
        <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="mt-4 block text-sm text-slate-700">Password</label>
        <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function TimesheetWebsite() {
  const { loading: authLoading, isAuthenticated, signIn, token, user, logout, error: authError } = useAuthSession();
  const [page, setPage] = React.useState<"home" | "history">("home");
  const [historyDateFilter, setHistoryDateFilter] = React.useState("all");
  const [historyStatusFilter, setHistoryStatusFilter] = React.useState("all");
  const [entries, setEntries] = React.useState<UiEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [entriesError, setEntriesError] = React.useState("");

  React.useEffect(() => {
    if (!token) {
      setEntries([]);
      return;
    }

    let cancelled = false;
    setLoadingEntries(true);
    setEntriesError("");

    listTimesheets(token)
      .then((data) => {
        if (cancelled) return;
        setEntries(data.map(mapEntryToUi).sort((a, b) => b.date.localeCompare(a.date)));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEntriesError(error instanceof Error ? error.message : "Unable to load timesheets");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingEntries(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const approvedCount = entries.filter((entry) => entry.status === "Approved").length;
  const pendingCount = entries.filter((entry) => entry.status === "Pending").length;

  const filteredHistory = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

    const matchesDate =
      historyDateFilter === "all" ||
      (historyDateFilter === "7" && daysDiff <= 7) ||
      (historyDateFilter === "30" && daysDiff <= 30) ||
      (historyDateFilter === "90" && daysDiff <= 90);

    const matchesStatus = historyStatusFilter === "all" || entry.status === historyStatusFilter;

    return matchesDate && matchesStatus;
  });

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <LoginView onLogin={signIn} error={authError} busy={authLoading} />;
  }

  if (page === "history") {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <TopHeader page={page} setPage={setPage} userName={user.name} onLogout={logout} />
        <div className="bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] px-6 py-10 text-white md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">CGI Timesheet</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">View full timesheet history</h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6 flex flex-wrap items-end gap-4 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Date range</label>
              <select value={historyDateFilter} onChange={(e) => setHistoryDateFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
                <option value="all">All dates</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select value={historyStatusFilter} onChange={(e) => setHistoryStatusFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
                <option value="all">All statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          {entriesError ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{entriesError}</div> : null}
          <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="max-h-[620px] space-y-4 overflow-y-auto p-6">
              {loadingEntries ? <div className="text-sm text-slate-500">Loading entries...</div> : null}
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-900">{entry.project}</h3>
                        <StatusBadge status={entry.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
                      <p className="mt-2 text-xs text-slate-500">Employee: {entry.employee}</p>
                    </div>
                    <div className="text-sm text-slate-500 sm:text-right">
                      <div>{entry.date}</div>
                      <div className="mt-1 font-semibold text-slate-900">{entry.hours} hrs</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <TopHeader page={page} setPage={setPage} userName={user.name} onLogout={logout} />
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] opacity-95" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 text-white md:px-10 md:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">CGI Timesheet Portal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Welcome back, {user.name.split(" ")[0]}</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/add-timesheet" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg">Go to Add Timesheet Page</Link>
            {(user.role === "manager" || user.role === "admin") ? <Link to="/approvals" className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white">Open Approvals</Link> : null}
          </div>
        </div>
      </div>
      {entriesError ? <div className="mx-auto mt-6 max-w-7xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{entriesError}</div> : null}
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="This Month" value={totalHours.toFixed(1)} subtext="Logged hours so far" accent="from-[#d71920] to-[#ef4444]" />
          <SummaryCard label="Approvals" value={String(approvedCount)} subtext="Ready for payroll" accent="from-[#c81d5a] to-[#d946ef]" />
          <SummaryCard label="Pending Review" value={String(pendingCount)} subtext="Entries awaiting action" accent="from-[#6f2dbd] to-[#8b5cf6]" />
        </div>
        <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Recent Timesheet History</h2>
            <button type="button" onClick={() => setPage("history")} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">View all history</button>
          </div>
          <div className="space-y-4 p-6">
            {loadingEntries ? <div className="text-sm text-slate-500">Loading entries...</div> : null}
            {entries.slice(0, 4).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{entry.project}</h3>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
                  </div>
                  <div className="text-sm text-slate-500 sm:text-right">
                    <div>{entry.date}</div>
                    <div className="mt-1 font-semibold text-slate-900">{entry.hours} hrs</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopHeader({ page, setPage, userName, onLogout }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d71920] to-[#6f2dbd] text-sm font-bold text-white shadow-md">CGI</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{userName}</div>
            <div className="text-xs text-slate-500">Timesheet Management</div>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <button type="button" onClick={() => setPage("home")} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === "home" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Home</button>
          <button type="button" onClick={() => setPage("history")} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === "history" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>History</button>
          <button type="button" onClick={onLogout} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600">Sign out</button>
        </nav>
      </div>
    </header>
  );
}

function HeroStat({ label, value }: HeroStatProps) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
      <div className="text-sm font-medium text-white/75">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, subtext, accent }: SummaryCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-lg ring-1 ring-slate-200">
      <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 text-sm text-slate-500">{subtext}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  const classes: Record<UiStatus, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>;
}
