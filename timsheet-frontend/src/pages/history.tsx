import * as React from "react";
import { useMemo, useState } from "react";
import {
  listTimesheets,
  type EntryStatus,
  type TimesheetEntry,
} from "../lib/api";
import { useAuthSession } from "../lib/useAuthSession";

type Status = "Pending" | "Approved" | "Rejected";

type Entry = {
  id: number;
  employee: string;
  date: string;
  hours: number;
  project: string;
  description: string;
  status: Status;
};

function titleCaseStatus(status: EntryStatus): Status {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function mapEntryToUi(entry: TimesheetEntry): Entry {
  return {
    id: entry.id,
    employee: entry.user?.name ?? `User #${entry.user_id}`,
    date: entry.entry_date,
    hours: entry.hours,
    project: entry.time_code?.code ?? `Time Code #${entry.time_code_id}`,
    description:
      entry.description?.trim() ||
      entry.time_code?.description ||
      "Timesheet entry",
    status: titleCaseStatus(entry.status),
  };
}

function LoginView({
  onLogin,
  error,
  busy,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string;
  busy: boolean;
}) {
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
        <p className="mt-1 text-sm text-slate-500">
          Authenticate to view and manage timesheets.
        </p>

        <label className="mt-5 block text-sm text-slate-700">Email</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mt-4 block text-sm text-slate-700">Password</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white"
          type="submit"
          disabled={busy}
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const classes: Record<Status, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function getStartOfWeek(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getEndOfWeek(dateString: string) {
  const start = getStartOfWeek(dateString);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function History() {
  const {
    loading: authLoading,
    isAuthenticated,
    signIn,
    token,
    user,
    error: authError,
  } = useAuthSession();

  const [selectedWeekDate, setSelectedWeekDate] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [entries, setEntries] = React.useState<Entry[]>([]);
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
        setEntries(
          data.map(mapEntryToUi).sort((a, b) => b.date.localeCompare(a.date))
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setEntriesError(
          error instanceof Error ? error.message : "Unable to load timesheets"
        );
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingEntries(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const weekStart = selectedWeekDate ? getStartOfWeek(selectedWeekDate) : null;
  const weekEnd = selectedWeekDate ? getEndOfWeek(selectedWeekDate) : null;

  const filteredHistory = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(12, 0, 0, 0);

      const matchesWeek =
        !selectedWeekDate ||
        (weekStart !== null &&
          weekEnd !== null &&
          entryDate >= weekStart &&
          entryDate <= weekEnd);

      const matchesStatus =
        historyStatusFilter === "all" || entry.status === historyStatusFilter;

      return matchesWeek && matchesStatus;
    });
  }, [entries, selectedWeekDate, historyStatusFilter, weekStart, weekEnd]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginView onLogin={signIn} error={authError} busy={authLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] px-6 py-10 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
            CGI Timesheet
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            View full timesheet history
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
            Browse submitted timesheets and filter by week and status.
          </p>

          {selectedWeekDate ? (
            <p className="mt-4 text-sm text-white/80">
              Showing week of {formatDate(weekStart!)} to {formatDate(weekEnd!)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="min-w-[220px] flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Pick a week
            </label>
            <input
              type="date"
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
            >
              <option value="all">All statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedWeekDate("");
              setHistoryStatusFilter("all");
            }}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>

        {entriesError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {entriesError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                All Timesheets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Scrollable list of submitted timesheets.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredHistory.length} shown
            </div>
          </div>

          <div className="max-h-[620px] space-y-4 overflow-y-auto p-6">
            {loadingEntries ? (
              <div className="text-sm text-slate-500">Loading entries...</div>
            ) : null}

            {!loadingEntries &&
              filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-900">
                          {entry.project}
                        </h3>
                        <StatusBadge status={entry.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {entry.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Employee: {entry.employee}
                      </p>
                    </div>
                    <div className="text-sm text-slate-500 sm:text-right">
                      <div>{entry.date}</div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {entry.hours} hrs
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {!loadingEntries && filteredHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                No timesheets match those filters.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}