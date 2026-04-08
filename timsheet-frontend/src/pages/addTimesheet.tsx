import React, { useMemo, useState } from "react";

type DayKey = "su" | "mo" | "tu" | "we" | "th" | "fr" | "sa";

type Entry = {
  id: number;
  day: DayKey;
  project: string;
  task: string;
  timeCode: string;
  hours: string;
  notes: string;
};

const dayOrder: { key: DayKey; label: string }[] = [
  { key: "su", label: "Su" },
  { key: "mo", label: "Mo" },
  { key: "tu", label: "Tu" },
  { key: "we", label: "We" },
  { key: "th", label: "Th" },
  { key: "fr", label: "Fr" },
  { key: "sa", label: "Sa" },
];

const projects = ["Project A", "Project B", "Project C", "Client Portal", "Internal Ops"];
const tasks = ["Development", "Testing", "Research", "Meetings", "Design", "Support"];
const timeCodes = [
  { code: "DEV", label: "Development" },
  { code: "MTG", label: "Meetings" },
  { code: "QA", label: "Testing / QA" },
  { code: "DES", label: "Design" },
  { code: "SUP", label: "Support" },
  { code: "RES", label: "Research" },
  { code: "VAC", label: "Vacation" },
  { code: "SICK", label: "Sick Leave" },
  { code: "TRN", label: "Training" },
];

function getWeekDays() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(today.getDate() - today.getDay());

  return dayOrder.map((d, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return {
      key: d.key,
      label: d.label,
      dateLabel: String(date.getDate()),
      longLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });
}

function parseHours(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sumHours(entries: Entry[]) {
  return entries.reduce((total, entry) => total + parseHours(entry.hours), 0);
}

function hoursByDay(entries: Entry[]) {
  return dayOrder.reduce((acc, day) => {
    acc[day.key] = entries
      .filter((e) => e.day === day.key)
      .reduce((sum, e) => sum + parseHours(e.hours), 0);
    return acc;
  }, {} as Record<DayKey, number>);
}

function formatDayName(key: DayKey) {
  return dayOrder.find((d) => d.key === key)?.label ?? key;
}

function stepCircleStyle(active: boolean, done: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: "9999px",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 14,
    border: `2px solid ${active || done ? "#2f7df6" : "#d1d5db"}`,
    background: active ? "#2f7df6" : done ? "#e8f1ff" : "#f8fafc",
    color: active ? "white" : done ? "#2f7df6" : "#9ca3af",
  };
}

function panelStyle(): React.CSSProperties {
  return {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  };
}

function labelStyle(): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
  };
}

function fieldStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 42,
    borderRadius: 14,
    border: "1px solid #dbe3ef",
    background: "#fff",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  };
}

function buttonStyle(variant: "primary" | "outline" | "soft" = "outline"): React.CSSProperties {
  if (variant === "primary") {
    return {
      borderRadius: 14,
      border: "1px solid #2f7df6",
      background: "#2f7df6",
      color: "white",
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
      minWidth: 120,
    };
  }

  if (variant === "soft") {
    return {
      borderRadius: 14,
      border: "1px solid #dbe3ef",
      background: "#f8fafc",
      color: "#0f172a",
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
      minWidth: 120,
    };
  }

  return {
    borderRadius: 14,
    border: "1px solid #dbe3ef",
    background: "white",
    color: "#334155",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 120,
  };
}

function DayPill({
  label,
  dateLabel,
  selected,
  onClick,
}: {
  label: string;
  dateLabel: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 76,
        height: 70,
        borderRadius: 16,
        border: `2px solid ${selected ? "#2f7df6" : "#dde4ee"}`,
        background: selected ? "#eff6ff" : "white",
        boxShadow: selected ? "0 8px 18px rgba(47, 125, 246, 0.15)" : "none",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        padding: 0,
      }}
      type="button"
    >
      <div style={{ textAlign: "center", lineHeight: 1.05 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: selected ? "#2f7df6" : "#475569" }}>{label}</div>
        <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: selected ? "#2f7df6" : "#0f172a" }}>{dateLabel}</div>
      </div>
    </button>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...buttonStyle("soft"),
        minWidth: 110,
        padding: "10px 14px",
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

export default function AddTimesheet() {
  const weekDays = useMemo(() => getWeekDays(), []);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(["mo", "tu", "we", "th", "fr"]);
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 1,
      day: "mo",
      project: "",
      task: "",
      timeCode: "DEV",
      hours: "",
      notes: "",
    },
  ]);

  const totals = useMemo(() => {
    const byDay = hoursByDay(entries);
    return {
      total: sumHours(entries),
      byDay,
    };
  }, [entries]);

  const toggleDay = (day: DayKey) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => dayOrder.findIndex((d) => d.key === a) - dayOrder.findIndex((d) => d.key === b))
    );
  };

  const selectOnly = (days: DayKey[]) => setSelectedDays(days);

  const updateEntry = (id: number, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        day: selectedDays[0] ?? "mo",
        project: "",
        task: "",
        timeCode: "DEV",
        hours: "",
        notes: "",
      },
    ]);
  };

  const removeEntry = (id: number) => {
    setEntries((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const saveTimesheet = () => {
    // Hook this into your API or parent state.
    console.log({ selectedDays, entries, totals });
    alert("Timesheet ready to save. Connect this button to your API.");
  };

  const nextDisabled = step === 1 && selectedDays.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb", padding: 24, color: "#0f172a" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>Add Timesheet</div>
        </div>

        <div style={panelStyle()}>
          <div style={{ padding: 22, borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={stepCircleStyle(step === 1, step > 1)}>1</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step === 1 ? "#0f172a" : "#94a3b8" }}>Select Day(s)</div>
                </div>
                <div style={{ height: 2, flex: 1, background: step > 1 ? "#cfe0ff" : "#e5e7eb" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={stepCircleStyle(step === 2, step > 2)}>2</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step === 2 ? "#0f172a" : "#94a3b8" }}>Add Entries</div>
                </div>
                <div style={{ height: 2, flex: 1, background: step > 2 ? "#cfe0ff" : "#e5e7eb" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={stepCircleStyle(step === 3, false)}>3</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: step === 3 ? "#0f172a" : "#94a3b8" }}>Review &amp; Save</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 22 }}>
            {step === 1 && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Step 1: Select Day(s)</div>
                <div style={{ color: "#64748b", marginBottom: 18 }}>Choose the days you want to add time for.</div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {weekDays.map((d) => (
                    <DayPill
                      key={d.key}
                      label={d.label}
                      dateLabel={d.dateLabel}
                      selected={selectedDays.includes(d.key)}
                      onClick={() => toggleDay(d.key)}
                    />
                  ))}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>Quick Select</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <QuickButton label="Mon - Fri" onClick={() => selectOnly(["mo", "tu", "we", "th", "fr"])} />
                    <QuickButton label="This Week" onClick={() => selectOnly(["su", "mo", "tu", "we", "th", "fr", "sa"])} />
                    <QuickButton
                      label="Today"
                      onClick={() => {
                        const map: DayKey[] = ["su", "mo", "tu", "we", "th", "fr", "sa"];
                        selectOnly([map[new Date().getDay()]]);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Step 2: Add Entries</div>
                <div style={{ color: "#64748b", marginBottom: 18 }}>
                  Add one or more rows for the day(s) you selected.
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {entries.map((entry, index) => (
                    <div key={entry.id} style={{ border: "1px solid #e5e7eb", borderRadius: 20, padding: 16, background: "#fbfdff" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800 }}>Entry {index + 1}</div>
                        <button type="button" style={buttonStyle("outline")} onClick={() => removeEntry(entry.id)}>
                          Remove
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "110px 1.1fr 1.1fr 140px 110px", gap: 12 }}>
                        <div>
                          <div style={labelStyle()}>Day</div>
                          <select
                            style={fieldStyle()}
                            value={entry.day}
                            onChange={(e) => updateEntry(entry.id, { day: e.target.value as DayKey })}
                          >
                            {selectedDays.map((day) => (
                              <option key={day} value={day}>
                                {formatDayName(day)}
                              </option>
                            ))}
                            {selectedDays.length === 0 && <option value="mo">No day selected</option>}
                          </select>
                        </div>

                        <div>
                          <div style={labelStyle()}>Project</div>
                          <select
                            style={fieldStyle()}
                            value={entry.project}
                            onChange={(e) => updateEntry(entry.id, { project: e.target.value })}
                          >
                            <option value="">Select project</option>
                            {projects.map((project) => (
                              <option key={project} value={project}>
                                {project}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div style={labelStyle()}>Task</div>
                          <select
                            style={fieldStyle()}
                            value={entry.task}
                            onChange={(e) => updateEntry(entry.id, { task: e.target.value })}
                          >
                            <option value="">Select task</option>
                            {tasks.map((task) => (
                              <option key={task} value={task}>
                                {task}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div style={labelStyle()}>Time Code</div>
                          <select
                            style={fieldStyle()}
                            value={entry.timeCode}
                            onChange={(e) => updateEntry(entry.id, { timeCode: e.target.value })}
                          >
                            {timeCodes.map((tc) => (
                              <option key={tc.code} value={tc.code}>
                                {tc.code}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div style={labelStyle()}>Hours</div>
                          <input
                            style={{ ...fieldStyle(), textAlign: "center" }}
                            inputMode="decimal"
                            placeholder="0.0"
                            value={entry.hours}
                            onChange={(e) => updateEntry(entry.id, { hours: e.target.value })}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={labelStyle()}>Notes</div>
                        <input
                          style={fieldStyle()}
                          placeholder="Optional note for this entry"
                          value={entry.notes}
                          onChange={(e) => updateEntry(entry.id, { notes: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" onClick={addEntry} style={buttonStyle("soft")}>+ Add Entry</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>Step 3: Review &amp; Save</div>
                <div style={{ color: "#64748b", marginBottom: 18 }}>
                  Review everything before you submit.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, background: "#f8fbff" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Selected days</div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{selectedDays.length}</div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, background: "#f8fbff" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Entries</div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{entries.length}</div>
                  </div>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, background: "#f8fbff" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>Total hours</div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{totals.total.toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 18 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780, background: "white" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Day</th>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Project</th>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Task</th>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Code</th>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Hours</th>
                        <th style={{ padding: 14, fontSize: 12, color: "#64748b" }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                          <td style={{ padding: 14 }}>{formatDayName(entry.day)}</td>
                          <td style={{ padding: 14 }}>{entry.project || "—"}</td>
                          <td style={{ padding: 14 }}>{entry.task || "—"}</td>
                          <td style={{ padding: 14 }}>{entry.timeCode}</td>
                          <td style={{ padding: 14, fontWeight: 700 }}>{parseHours(entry.hours).toFixed(2)}</td>
                          <td style={{ padding: 14 }}>{entry.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 18, padding: 16, background: "#fbfdff" }}>
                  <div style={{ fontWeight: 800, marginBottom: 12 }}>Hours by day</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10 }}>
                    {dayOrder.map((day) => (
                      <div key={day.key} style={{ textAlign: "center", border: "1px solid #e5e7eb", borderRadius: 14, padding: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{day.label}</div>
                        <div style={{ marginTop: 4, fontWeight: 800 }}>{totals.byDay[day.key].toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: 22, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button type="button" style={buttonStyle("outline")} onClick={() => setStep((s) => Math.max(1, (s - 1) as 1 | 2 | 3))} disabled={step === 1}>
              Back
            </button>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                style={buttonStyle("soft")}
                onClick={() => {
                  setSelectedDays(["mo", "tu", "we", "th", "fr"]);
                  setEntries([
                    {
                      id: 1,
                      day: "mo",
                      project: "",
                      task: "",
                      timeCode: "DEV",
                      hours: "",
                      notes: "",
                    },
                  ]);
                  setStep(1);
                }}
              >
                Reset
              </button>

              {step < 3 ? (
                <button type="button" style={buttonStyle("primary")} onClick={() => setStep((s) => ((s + 1) as 1 | 2 | 3))} disabled={nextDisabled}>
                  Next
                </button>
              ) : (
                <button type="button" style={buttonStyle("primary")} onClick={saveTimesheet}>
                  Review Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
