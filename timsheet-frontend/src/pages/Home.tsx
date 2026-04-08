import { Link } from "react-router-dom";

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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
      <div className="text-sm font-medium text-white/75">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: string;
  subtext: string;
  accent: string;
}) {
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

function StatusBadge({ status }: { status: Status }) {
  const classes = {
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

export default function Home() {
  const entries: Entry[] = [
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
    {
      id: 5,
      employee: "Alex Johnson",
      date: "2026-03-14",
      hours: 8,
      project: "Client Portal",
      description: "Completed testing and bug fixes.",
      status: "Approved",
    },
  ];

  const rejectedCount = entries.filter((entry) => entry.status === "Rejected").length;
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd] opacity-95" />
        <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-10 top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 text-white md:px-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/75">
                CGI Timesheet Portal
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
                Welcome back, Alex
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                Review your recent timesheets, track weekly hours, and move to the
                separate submission flow when you are ready to add a new entry.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/add-timesheet"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
                >
                  Go to Add Timesheet Page
                </Link>

                <Link
                  to="/history"
                  className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  View History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Approvals"
            value={String(approvedCount)}
            subtext="Ready for payroll"
            accent="from-[#c81d5a] to-[#d946ef]"
          />
          <SummaryCard
            label="Pending Review"
            value={String(pendingCount)}
            subtext="Entries awaiting action"
            accent="from-[#6f2dbd] to-[#8b5cf6]"
          />
          <SummaryCard label="Rejections" value={String(rejectedCount)} subtext="Entries Rejected" accent="from-[#c81d5a] to-[#d946ef]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Timesheet History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest submitted entries.
                </p>
              </div>
              <Link
                to="/history"
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                View all history
              </Link>
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
                        <h3 className="text-base font-semibold text-slate-900">
                          {entry.project}
                        </h3>
                        <StatusBadge status={entry.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {entry.description}
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
            </div>
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
              <div className="h-1.5 bg-gradient-to-r from-[#d71920] via-[#c81d5a] to-[#6f2dbd]" />
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Weekly Hours
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A simple view of hours over time.
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Last 5 weeks
                  </div>
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
                      <div
                        key={item.label}
                        className="flex flex-1 flex-col items-center justify-end gap-3"
                      >
                        <div className="text-xs font-semibold text-slate-500">
                          {item.hours}h
                        </div>
                        <div
                          className={`w-full rounded-t-2xl bg-gradient-to-t ${barClasses[index]}`}
                          style={{ height: `${(item.hours / maxHours) * 160}px` }}
                        />
                        <div className="text-xs text-slate-500">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Jump straight into the external submission flow.
                </p>

                <Link
                  to="/add-timesheet"
                  className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-[#d71920] to-[#6f2dbd] px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                >
                  Open Add Timesheet Page
                </Link>

                <Link
                  to="/history"
                  className="mt-3 block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Browse Full History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}