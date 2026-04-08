import React from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleCheckBig,
  CircleX,
  Plus,
} from 'lucide-react';

type TimesheetStatus = 'Pending' | 'Approved' | 'Rejected';

type DayEntry = {
  hours: number;
  title: string;
  subtitle?: string;
  tone: 'blue' | 'green' | 'purple' | 'gray';
};

type DayItem = {
  day: string;
  date: number;
  totalHours: number;
  entries: DayEntry[];
};

type WeeklyTimesheetPageProps = {
  employeeName?: string;
  status?: TimesheetStatus;
  weekLabel?: string;
  onBack?: () => void;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ status }: { status: TimesheetStatus }) {
  const styles =
    status === 'Pending'
      ? 'bg-amber-50 text-amber-800 ring-amber-200'
      : status === 'Approved'
        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
        : 'bg-rose-50 text-rose-800 ring-rose-200';

  const icon =
    status === 'Pending' ? (
      <Clock3 className="h-3.5 w-3.5" />
    ) : status === 'Approved' ? (
      <CircleCheckBig className="h-3.5 w-3.5" />
    ) : (
      <CircleX className="h-3.5 w-3.5" />
    );

  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1', styles)}>
      {icon}
      {status}
    </span>
  );
}

function EntryBlock({
  hours,
  title,
  subtitle,
  tone,
}: DayEntry) {
  const styles =
    tone === 'blue'
      ? 'bg-sky-100 text-sky-950 border-sky-200'
      : tone === 'green'
        ? 'bg-emerald-100 text-emerald-950 border-emerald-200'
        : tone === 'purple'
          ? 'bg-violet-100 text-violet-950 border-violet-200'
          : 'bg-slate-100 text-slate-950 border-slate-200';

  return (
    <div className={cx('rounded-2xl border p-3 shadow-sm', styles)}>
      <div className="text-sm font-semibold">{hours}h</div>
      <div className="mt-1 text-[11px] font-medium leading-4 opacity-90">{title}</div>
      {subtitle ? <div className="mt-0.5 text-[11px] leading-4 opacity-75">{subtitle}</div> : null}
    </div>
  );
}

const weeklyData: DayItem[] = [
  { day: 'Sun', date: 21, totalHours: 0, entries: [] },
  {
    day: 'Mon',
    date: 22,
    totalHours: 2,
    entries: [{ hours: 2, title: 'Client ABC', subtitle: 'Dev', tone: 'blue' }],
  },
  {
    day: 'Tue',
    date: 23,
    totalHours: 4,
    entries: [{ hours: 4, title: 'Project X', subtitle: 'Test', tone: 'green' }],
  },
  { day: 'Wed', date: 24, totalHours: 0, entries: [] },
  {
    day: 'Thu',
    date: 25,
    totalHours: 2,
    entries: [{ hours: 2, title: 'Client ABC', subtitle: 'Dev', tone: 'blue' }],
  },
  {
    day: 'Fri',
    date: 26,
    totalHours: 1,
    entries: [{ hours: 1, title: 'Training', tone: 'purple' }],
  },
  { day: 'Sat', date: 27, totalHours: 0, entries: [] },
];

export default function WeeklyTimesheetPage({
  employeeName = 'Camila Adams',
  status = 'Pending',
  weekLabel = 'Apr 21 – Apr 27, 2024',
  onBack,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onApprove,
  onReject,
}: WeeklyTimesheetPageProps) {
  const weeklyTotals = weeklyData.map((day) => day.totalHours);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <StatusBadge status={status} />
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  View Timesheet
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {employeeName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Weekly submission overview and review
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onPreviousWeek}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  {weekLabel}
                </div>

                <button
                  type="button"
                  onClick={onNextWeek}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onToday}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {weeklyData.map((day) => (
                <div
                  key={`${day.day}-${day.date}`}
                  className="min-h-[320px] rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{day.day}</div>
                      <div className="text-xs text-slate-500">{day.date}</div>
                    </div>
                    <div className="text-xs font-medium text-slate-500">{day.totalHours}h</div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {day.entries.length > 0 ? (
                      day.entries.map((entry, index) => <EntryBlock key={index} {...entry} />)
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-400">
                        No time added
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-8 sm:gap-3">
                <div className="font-medium text-slate-700 sm:col-span-1">Weekly Total</div>
                {weeklyTotals.map((hours, index) => (
                  <div key={index} className="text-left font-medium text-slate-700 sm:text-center">
                    {hours}h
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
        </div>
      </div>
    </div>
  );
}