import * as React from "react";

export default function TimesheetWebsite() {
  const [page, setPage] = React.useState("home");
  const [historyDateFilter, setHistoryDateFilter] = React.useState("all");
  const [historyStatusFilter, setHistoryStatusFilter] = React.useState("all");

  const entries = [
    { id: 1, employee: "Alex Johnson", date: "2026-04-07", hours: 8, project: "Client Portal", description: "Built dashboard widgets and fixed validation issues.", status: "Pending" },
    { id: 2, employee: "Alex Johnson", date: "2026-04-03", hours: 7.5, project: "Client Portal", description: "Worked on responsive layout improvements.", status: "Approved" },
    { id: 3, employee: "Alex Johnson", date: "2026-03-27", hours: 6, project: "Internal Tools", description: "Updated reporting filters and exports.", status: "Approved" },
    { id: 4, employee: "Alex Johnson", date: "2026-03-20", hours: 8.5, project: "Payroll System", description: "Fixed timesheet approval workflow bugs.", status: "Rejected" },
    { id: 5, employee: "Alex Johnson", date: "2026-03-14", hours: 8, project: "Client Portal", description: "Completed testing and bug fixes.", status: "Approved" },
    { id: 6, employee: "Alex Johnson", date: "2026-03-07", hours: 7, project: "Internal Tools", description: "Refined dashboard widgets for reporting.", status: "Approved" },
    { id: 7, employee: "Alex Johnson", date: "2026-02-28", hours: 8, project: "Payroll System", description: "Reviewed approval flow and prepared release notes.", status: "Pending" },
    { id: 8, employee: "Alex Johnson", date: "2026-02-21", hours: 6.5, project: "Client Portal", description: "Worked on accessibility improvements.", status: "Approved" },
  ];

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

  const filteredHistory = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const now = new Date("2026-04-08");
    const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

    const matchesDate =
      historyDateFilter === "all" ||
      (historyDateFilter === "7" && daysDiff <= 7) ||
      (historyDateFilter === "30" && daysDiff <= 30) ||
      (historyDateFilter === "90" && daysDiff <= 90);

    const matchesStatus = historyStatusFilter === "all" || entry.status === historyStatusFilter;

    return matchesDate && matchesStatus;
  });

  if (page === "history") {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <TopHeader page={page} setPage={setPage} />

        <div className="bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] px-6 py-10 text-white md:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">CGI Timesheet</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">View full timesheet history</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
              Browse all submitted timesheets and narrow results using filters for date range and status.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6 flex flex-wrap items-end gap-4 rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Date range</label>
              <select
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
              >
                <option value="all">All dates</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="min-w-[180px] flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
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
                setHistoryDateFilter("all");
                setHistoryStatusFilter("all");
              }}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>

          <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">All Timesheets</h2>
                <p className="mt-1 text-sm text-slate-500">Scrollable list of every submitted timesheet.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {filteredHistory.length} shown
              </div>
            </div>

            <div className="max-h-[620px] space-y-4 overflow-y-auto p-6">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white"
                >
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

              {filteredHistory.length === 0 ? (
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <TopHeader page={page} setPage={setPage} />

      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] opacity-95" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-10 top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 text-white md:px-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">CGI Timesheet Portal</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">Welcome back, Alex</h1>
              <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                Review your recent timesheets, track weekly hours, and move to the separate submission flow when you are ready to add a new entry.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                >
                  Go to Add Timesheet Page
                </a>
                <button
                  type="button"
                  onClick={() => setPage("history")}
                  className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  View History
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <HeroStat label="Total Hours" value={String(totalHours)} />
              <HeroStat label="Approved" value={String(approvedCount)} />
              <HeroStat label="Pending" value={String(pendingCount)} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="This Month" value="42.0" subtext="Logged hours so far" accent="from-[#d71920] to-[#ef4444]" />
          <SummaryCard label="Approvals" value={String(approvedCount)} subtext="Ready for payroll" accent="from-[#c81d5a] to-[#d946ef]" />
          <SummaryCard label="Pending Review" value={String(pendingCount)} subtext="Entries awaiting action" accent="from-[#6f2dbd] to-[#8b5cf6]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Timesheet History</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest submitted entries.</p>
              </div>
              <button
                type="button"
                onClick={() => setPage("history")}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                View all history
              </button>
            </div>

            <div className="space-y-4 p-6">
              {entries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white"
                >
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
            <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
              <div className="h-1.5 bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd]" />
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Weekly Hours</h2>
                    <p className="mt-1 text-sm text-slate-500">A simple view of hours over time.</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Last 5 weeks</div>
                </div>

                <div className="flex h-64 items-end justify-between gap-3">
                  {weeklyData.map((item, index) => {
                    const barClasses = [
                      "from-[#d71920] to-[#ef4444]",
                      "from-[#d71920] to-[#c81d5a]",
                      "from-[#c81d5a] to-[#d946ef]",
                      "from-[#6f2dbd] to-[#8b5cf6]",
                      "from-[#4f46e5] to-[#6f2dbd]",
                    ];

                    return (
                      <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-3">
                        <div className="text-xs font-semibold text-slate-500">{item.hours}h</div>
                        <div className={`w-full rounded-t-2xl bg-gradient-to-t ${barClasses[index]}`} style={{ height: `${(item.hours / maxHours) * 160}px` }} />
                        <div className="text-xs text-slate-500">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">Jump straight into the external submission flow.</p>

                <a
                  href="#"
                  className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-[#d71920] to-[#6f2dbd] px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  Open Add Timesheet Page
                </a>

                <button
                  type="button"
                  onClick={() => setPage("history")}
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Browse Full History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopHeader({ page, setPage }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d71920] to-[#6f2dbd] text-sm font-bold text-white shadow-md">CGI</div>
          <div>
            <div className="text-sm font-semibold text-slate-900">CGI</div>
            <div className="text-xs text-slate-500">Timesheet Management</div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage("home")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === "home" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setPage("history")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${page === "history" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            History
          </button>
        </nav>
      </div>
    </header>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
      <div className="text-sm font-medium text-white/75">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, subtext, accent }) {
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

function StatusBadge({ status }) {
  const classes = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}>{status}</span>;
}
