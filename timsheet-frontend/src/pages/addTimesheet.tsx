import React, { useMemo, useState } from "react";
import {
  approveTimesheet,
  createTimesheet,
  listTimeCodes,
  listTimesheets,
  listUsers,
  rejectTimesheet,
  type EntryStatus,
  type TimeCode,
  type TimesheetEntry,
  type User,
} from "../lib/api";
import { useAuthSession } from "../lib/useAuthSession";

type UiStatus = "Pending" | "Approved" | "Rejected";

type Entry = {
  id: number;
  day: DayKey;
  project: string;
  task: string;
  timeCode: string;
  hours: number;
  status: UiStatus;
};

const projects = ["Project A", "Project B", "Project C", "Client Portal", "Internal Ops"];
const tasks = ["Development", "Testing", "Research", "Meetings", "Design", "Support"];

function toStatus(status: EntryStatus): UiStatus {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function toRow(entry: TimesheetEntry): TimesheetRow {
  return {
    id: entry.id,
    date: entry.entry_date,
    user: entry.user?.name ?? `User #${entry.user_id}`,
    project: entry.time_code?.code ?? `Time Code #${entry.time_code_id}`,
    task: entry.description || "Timesheet entry",
    timeCode: entry.time_code?.code ?? String(entry.time_code_id),
    hours: entry.hours,
    status: toStatus(entry.status),
  };
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
        <p className="mt-1 text-sm text-slate-500">Authenticate to create timesheet entries.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="add-timesheet-login-email">Email</label>
        <input id="add-timesheet-login-email" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="add-timesheet-login-password">Password</label>
        <input id="add-timesheet-login-password" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button className="mt-5 w-full rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white" type="submit">Sign in</button>
      </form>
    </div>
  );
}

function StatusBadge({ status }: { status: UiStatus }) {
  const styles: Record<UiStatus, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-800",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

const leaveOptions = [
  "Administration",
  "Training",
  "Training AI",
  "Proposal",
  "In Between Assignments",
  "Reservist Leave",
  "Statutory Holiday",
  "Vacation",
  "Compensatory Time",
  "Sick Leave",
  "Exam/Study Leave",
  "Public Services Leave",
  "Floating/DeferredHoliday Taken",
  "Bereavement Leave",
  "Jury Duty Leave",
  "Military Leave",
  "Paternity Leave",
  "Family Support Leave",
  "Administrative Leave",
  "Unpaid Leave",
  "Unpaid Sick Leave",
  "Grad Return to Work Off Days",
  "Carer Leave",
  "Prenatal Exam/Course",
  "Partner Prenatal Assist Leave",
  "Unpaid Parental Leave",
  "Strike",
  "Union Duties Leave",
  "Defer Statutory Holiday",
  "Parental Bereavement Leave",
] as const;

export default function AddTimesheet() {
  const { loading: authLoading, isAuthenticated, signIn, token, user, logout, error: authError } = useAuthSession();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [timeCodes, setTimeCodes] = useState<TimeCode[]>([]);
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ userId: "", date: "", project: "", task: tasks[0], timeCodeId: "", hours: "", notes: "" });

  React.useEffect(() => {
    if (!token || !user) return;

    let cancelled = false;

    Promise.all([
      listTimeCodes(token),
      listTimesheets(token),
      user.role === "admin" ? listUsers(token).catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load all users; using your account only.");
        }
        return [user];
      }) : Promise.resolve([user]),
    ])
      .then(([codes, entries, users]) => {
        if (cancelled) return;
        setTimeCodes(codes);
        setRows(entries.map(toRow).sort((a, b) => b.date.localeCompare(a.date)));
        setAllUsers(users);
        setForm((prev) => ({
          ...prev,
          userId: prev.userId || String(user.id),
          timeCodeId: prev.timeCodeId || (codes[0] ? String(codes[0].id) : ""),
          project: prev.project || projects[0],
        }));
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load page data");
      });

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => [row.date, row.user, row.project, row.task, row.timeCode, row.status, String(row.hours)].join(" ").toLowerCase().includes(q));
  }, [rows, search]);

  const stats = useMemo(() => ({
    pending: rows.filter((r) => r.status === "Pending").length,
    approved: rows.filter((r) => r.status === "Approved").length,
    rejected: rows.filter((r) => r.status === "Rejected").length,
    hours: rows.reduce((sum, r) => sum + r.hours, 0),
  }), [rows]);

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading session...</div>;
  }

  if (!isAuthenticated || !token || !user) {
    return <LoginView onLogin={signIn} error={authError} />;
  }

  const canReview = user.role === "manager" || user.role === "admin";
  const authToken = token;

  async function refreshRows() {
    const data = await listTimesheets(authToken);
    setRows(data.map(toRow).sort((a, b) => b.date.localeCompare(a.date)));
  }

  const saveTimesheet = () => {
    console.log({ selectedDays, entries, totals });
    alert("Timesheet ready to save. Connect this button to your API.");
  };

  const nextDisabled = step === 1 && selectedDays.length === 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Create Time Report</h1>
            <p className="mt-1 text-sm text-slate-500">Submit new entries to the backend and track current approval status.</p>
          </div>
          <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={logout}>Sign out</button>
        </div>
      </div>

        {error ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">User</label>
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} disabled={user.role === "employee"}>
                {allUsers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Date</label>
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Hours</label>
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" type="number" min="0.25" max="24" step="0.25" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Project</label>
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}>
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Task</label>
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.task} onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}>
                {tasks.map((task) => <option key={task} value={task}>{task}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Time Code</label>
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.timeCodeId} onChange={(e) => setForm((f) => ({ ...f, timeCodeId: e.target.value }))}>
                {timeCodes.map((code) => <option key={code.id} value={code.id}>{code.code} - {code.description || "No description"}</option>)}
              </select>
            </div>
          </div>
          <label className="mt-4 block text-sm font-medium text-slate-700">Notes</label>
          <textarea className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={4} />
          <button
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              setError("");
              setFeedback("");
              if (!form.userId || !form.timeCodeId || !form.date || !form.hours) {
                setError("Please complete user, date, hours, and time code fields.");
                return;
              }

              try {
                await createTimesheet(authToken, {
                  user_id: Number(form.userId),
                  time_code_id: Number(form.timeCodeId),
                  entry_date: form.date,
                  hours: Number(form.hours),
                  description: form.notes.trim() || `${form.project} - ${form.task}`,
                });
                setFeedback("Timesheet entry submitted.");
                await refreshRows();
              } catch (submitError: unknown) {
                setError(submitError instanceof Error ? submitError.message : "Unable to submit entry");
              }
            }}
          >
            Save entry
          </button>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs text-slate-500">Total hours</div><div className="mt-1 text-2xl font-bold">{stats.hours.toFixed(1)}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-amber-50 p-4"><div className="text-xs text-slate-500">Pending</div><div className="mt-1 text-2xl font-bold">{stats.pending}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4"><div className="text-xs text-slate-500">Approved</div><div className="mt-1 text-2xl font-bold">{stats.approved}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-rose-50 p-4"><div className="text-xs text-slate-500">Rejected</div><div className="mt-1 text-2xl font-bold">{stats.rejected}</div></div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent entries</h2>
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filteredRows.map((row) => (
              <div key={row.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[140px_180px_1fr_120px_220px] md:items-center">
                <div>
                  <div className="text-xs text-slate-500">Date</div>
                  <div className="text-sm font-medium">{row.date}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">User</div>
                  <div className="text-sm font-medium">{row.user}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Work</div>
                  <div className="text-sm font-medium">{row.project}</div>
                  <div className="text-xs text-slate-500">{row.task}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hours</div>
                  <div className="text-sm font-medium">{row.hours}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={row.status} />
                  {canReview ? (
                    <>
                      <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700" onClick={async () => {
                        setError("");
                        try {
                          await approveTimesheet(authToken, row.id);
                          await refreshRows();
                        } catch (actionError: unknown) {
                          setError(actionError instanceof Error ? actionError.message : "Unable to approve");
                        }
                      }}>Approve</button>
                      <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700" onClick={async () => {
                        setError("");
                        try {
                          await rejectTimesheet(authToken, row.id, "Rejected from add-timesheet view");
                          await refreshRows();
                        } catch (actionError: unknown) {
                          setError(actionError instanceof Error ? actionError.message : "Unable to reject");
                        }
                      }}>Reject</button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
