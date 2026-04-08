import * as React from "react";

export default function TimesheetWebsite() {
  const [page, setPage] = React.useState("home");

  const [entries, setEntries] = React.useState([
    {
      id: 1,
      employee: "Alex Johnson",
      date: "2026-04-07",
      hours: 8,
      project: "Client Portal",
      description: "Built dashboard widgets and fixed validation issues.",
      status: "Pending",
    },
    {
      id: 2,
      employee: "Alex Johnson",
      date: "2026-04-03",
      hours: 7.5,
      project: "Client Portal",
      description: "Worked on responsive layout improvements.",
      status: "Approved",
    },
    {
      id: 3,
      employee: "Alex Johnson",
      date: "2026-03-27",
      hours: 6,
      project: "Internal Tools",
      description: "Updated reporting filters and exports.",
      status: "Approved",
    },
    {
      id: 4,
      employee: "Alex Johnson",
      date: "2026-03-20",
      hours: 8.5,
      project: "Payroll System",
      description: "Fixed timesheet approval workflow bugs.",
      status: "Rejected",
    },
  ]);

  const [form, setForm] = React.useState({
    employee: "Alex Johnson",
    date: "",
    hours: "",
    project: "",
    description: "",
  });

  const [error, setError] = React.useState("");

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addEntry(event) {
    event.preventDefault();

    if (!form.employee || !form.date || !form.hours || !form.project || !form.description) {
      setError("Please complete all fields before submitting.");
      return;
    }

    setError("");

    const newEntry = {
      id: Date.now(),
      employee: form.employee.trim(),
      date: form.date,
      hours: Number(form.hours),
      project: form.project.trim(),
      description: form.description.trim(),
      status: "Pending",
    };

    setEntries((current) => [newEntry, ...current]);
    setForm({
      employee: "Alex Johnson",
      date: "",
      hours: "",
      project: "",
      description: "",
    });
    setPage("home");
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const approvedCount = entries.filter((entry) => entry.status === "Approved").length;
  const pendingCount = entries.filter((entry) => entry.status === "Pending").length;

  const weeklyData = [
    { label: "Week 1", hours: 32 },
    { label: "Week 2", hours: 36 },
    { label: "Week 3", hours: 29 },
    { label: "Week 4", hours: 38 },
    { label: "Week 5", hours: 34 },
  ];

  const maxHours = Math.max(...weeklyData.map((item) => item.hours));

  if (page === "add") {
    return (
      <div className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Add Timesheet</h1>
              <p className="mt-2 text-slate-600">Create a new timesheet entry.</p>
            </div>
            <button
              type="button"
              onClick={() => setPage("home")}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back to Home
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
            <form onSubmit={addEntry} className="space-y-5">
              <Field label="Employee Name">
                <input
                  type="text"
                  value={form.employee}
                  onChange={(e) => updateForm("employee", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />
                </Field>

                <Field label="Hours">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours}
                    onChange={(e) => updateForm("hours", e.target.value)}
                    placeholder="8"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  />
                </Field>
              </div>

              <Field label="Project">
                <input
                  type="text"
                  value={form.project}
                  onChange={(e) => updateForm("project", e.target.value)}
                  placeholder="Client Portal"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                />
              </Field>

              <Field label="Work Description">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe what you worked on"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                />
              </Field>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Save Timesheet Entry
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Timesheet Portal</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">Welcome back, Alex</h1>
            <p className="mt-2 text-slate-600">Review your hours, check recent entries, and add a new timesheet.</p>
          </div>

          <button
            type="button"
            onClick={() => setPage("add")}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Add Timesheet
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Hours" value={String(totalHours)} subtext="Across recent entries" />
          <SummaryCard label="Approved Entries" value={String(approvedCount)} subtext="Ready for payroll" />
          <SummaryCard label="Pending Entries" value={String(pendingCount)} subtext="Awaiting review" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Timesheet History</h2>
                <p className="mt-1 text-sm text-slate-500">Your recent submitted entries.</p>
              </div>
            </div>

            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
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

          <div className="space-y-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Weekly Hours</h2>
                <p className="mt-1 text-sm text-slate-500">A simple view of hours over time.</p>
              </div>

              <div className="flex h-64 items-end justify-between gap-3">
                {weeklyData.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <div className="text-xs font-semibold text-slate-500">{item.hours}h</div>
                    <div
                      className="w-full rounded-t-2xl bg-slate-900"
                      style={{ height: `${(item.hours / maxHours) * 160}px` }}
                    />
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-500">Go straight to creating a new entry.</p>
              <button
                type="button"
                onClick={() => setPage("add")}
                className="mt-5 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Create New Timesheet Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value, subtext }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{subtext}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}>
      {status}
    </span>
  );
}
