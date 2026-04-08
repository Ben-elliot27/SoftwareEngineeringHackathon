import React, { useMemo, useState } from "react";

type DayKey = "su" | "mo" | "tu" | "we" | "th" | "fr" | "sa";
type Status = "Pending" | "Approved" | "Rejected";

type TimesheetRow = {
  id: number;
  date: string;
  user: string;
  project: string;
  task: string;
  timeCode: string;
  hours: number;
  status: Status;
};

const dayLabels: { key: DayKey; label: string }[] = [
  { key: "su", label: "Su" },
  { key: "mo", label: "Mo" },
  { key: "tu", label: "Tu" },
  { key: "we", label: "We" },
  { key: "th", label: "Th" },
  { key: "fr", label: "Fr" },
  { key: "sa", label: "Sa" },
];

const users = ["Camila Adams", "Mark Patel", "Liam Whitehead", "Sarah Lin"];
const projects = ["Project A", "Project B", "Project C", "Client Portal", "Internal Ops"];
const tasks = ["Development", "Testing", "Research", "Meetings", "Design", "Support"];
const billingActions = ["Billable", "Non-billable"];

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

const initialRows: TimesheetRow[] = [
  { id: 1, date: "2024-04-24", user: "Camila Adams", project: "Project A", task: "Development", timeCode: "DEV", hours: 8, status: "Pending" },
  { id: 2, date: "2024-04-23", user: "Mark Patel", project: "Project A", task: "Development", timeCode: "DEV", hours: 7.5, status: "Approved" },
  { id: 3, date: "2024-04-23", user: "Mark Patel", project: "Project B", task: "Testing", timeCode: "QA", hours: 6, status: "Pending" },
  { id: 4, date: "2024-04-22", user: "Liam Whitehead", project: "Project C", task: "Research", timeCode: "RES", hours: 5, status: "Approved" },
  { id: 5, date: "2024-04-21", user: "Sarah Lin", project: "Project B", task: "Development", timeCode: "DEV", hours: 6.5, status: "Pending" },
  { id: 6, date: "2024-04-21", user: "Sarah Lin", project: "Project A", task: "Development", timeCode: "DEV", hours: 6.5, status: "Rejected" },
];

function parseHours(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sumDays(days: Record<DayKey, string>) {
  return dayLabels.reduce((total, d) => total + parseHours(days[d.key]), 0);
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, React.CSSProperties> = {
    Pending: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    Approved: { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" },
    Rejected: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: 600,
        ...styles[status],
      }}
    >
      {status}
    </span>
  );
}

function StatPill({
  label,
  value,
  background,
}: {
  label: string;
  value: string;
  background: string;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 8 }}>{children}</div>;
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  };
}

function selectStyle(): React.CSSProperties {
  return {
    ...inputStyle(),
    height: 42,
  };
}

function buttonStyle(variant: "primary" | "ghost" | "outline" | "danger" = "outline"): React.CSSProperties {
  if (variant === "primary") {
    return {
      borderRadius: 12,
      border: "1px solid #2563eb",
      background: "#2563eb",
      color: "white",
      padding: "10px 16px",
      fontWeight: 600,
      cursor: "pointer",
    };
  }
  if (variant === "danger") {
    return {
      borderRadius: 12,
      border: "1px solid #fecaca",
      background: "#fef2f2",
      color: "#b91c1c",
      padding: "10px 16px",
      fontWeight: 600,
      cursor: "pointer",
    };
  }
  if (variant === "ghost") {
    return {
      borderRadius: 12,
      border: "1px solid transparent",
      background: "transparent",
      color: "#334155",
      padding: "10px 16px",
      fontWeight: 600,
      cursor: "pointer",
    };
  }
  return {
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

export default function AddTimesheet() {
  const [rows, setRows] = useState<TimesheetRow[]>(initialRows);

  const [form, setForm] = useState({
    user: "",
    date: "",
    project: "",
    timeCode: "DEV",
    task: "Development",
    hours: "",
    notes: "",
  });

  const [projectHours, setProjectHours] = useState({
    project: "",
    activity: "",
    sourceType: "10000",
    category: "10100",
    subcategory: "",
    payrollCategory: "",
    billingAction: "Billable",
    su: "",
    mo: "",
    tu: "",
    we: "",
    th: "",
    fr: "",
    sa: "",
  });

  const [nonWorked, setNonWorked] = useState<Record<string, Record<DayKey, string>>>({
    Administration: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
    Training: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
    Vacation: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
    "Sick Leave": { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
  });

  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.date, row.user, row.project, row.task, row.timeCode, row.status, String(row.hours)].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [search, rows]);

  const stats = useMemo(() => {
    return {
      pending: rows.filter((r) => r.status === "Pending").length,
      approved: rows.filter((r) => r.status === "Approved").length,
      rejected: rows.filter((r) => r.status === "Rejected").length,
      hours: rows.reduce((sum, r) => sum + r.hours, 0),
    };
  }, [rows]);

  const projectTotal = useMemo(() => {
    return dayLabels.reduce((total, d) => total + parseHours(projectHours[d.key]), 0);
  }, [projectHours]);

  const approve = (id: number) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  const reject = (id: number) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));

  const updateNonWorked = (row: string, day: DayKey, value: string) => {
    setNonWorked((prev) => ({
      ...prev,
      [row]: {
        ...prev[row],
        [day]: value,
      },
    }));
  };

  const submitAdd = () => {
    if (!form.user || !form.date || !form.project || !form.hours) return;

    setRows((prev) => [
      {
        id: Date.now(),
        user: form.user,
        date: form.date,
        project: form.project,
        timeCode: form.timeCode,
        task: form.task,
        hours: Number(form.hours),
        status: "Pending",
      },
      ...prev,
    ]);

    setForm({
      user: "",
      date: "",
      project: "",
      timeCode: "DEV",
      task: "Development",
      hours: "",
      notes: "",
    });
  };

  const clearAll = () => {
    setForm({
      user: "",
      date: "",
      project: "",
      timeCode: "DEV",
      task: "Development",
      hours: "",
      notes: "",
    });

    setProjectHours({
      project: "",
      activity: "",
      sourceType: "10000",
      category: "10100",
      subcategory: "",
      payrollCategory: "",
      billingAction: "Billable",
      su: "",
      mo: "",
      tu: "",
      we: "",
      th: "",
      fr: "",
      sa: "",
    });

    setNonWorked({
      Administration: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
      Training: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
      Vacation: { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
      "Sick Leave": { su: "", mo: "", tu: "", we: "", th: "", fr: "", sa: "" },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", color: "#0f172a" }}>
      <div style={{ maxWidth: 1450, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            borderRadius: 28,
            border: "1px solid #e2e8f0",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 18px 60px rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", minHeight: "calc(100vh - 32px)" }}>
            <aside
              style={{
                width: 290,
                borderRight: "1px solid #e2e8f0",
                background: "rgba(255,255,255,0.7)",
                padding: 24,
                display: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #d946ef, #4f46e5)" }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>Timesheet Hub</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Entry capture</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {["Approvals", "Add Entry", "My Entries", "API & Integrations"].map((item) => (
                  <div
                    key={item}
                    style={{
                      borderRadius: 12,
                      padding: "12px 16px",
                      background: item === "Add Entry" ? "#0f172a" : "#fff",
                      color: item === "Add Entry" ? "#fff" : "#475569",
                      border: "1px solid #e2e8f0",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "auto", paddingTop: 24 }}>
                <div style={{ borderRadius: 20, border: "1px solid #e2e8f0", background: "#fff", padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Public REST API</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                    Integrate timesheets with payroll, ERP, and other tools.
                  </div>
                </div>
              </div>
            </aside>

            <main style={{ flex: 1, minWidth: 0 }}>
              <div style={{ borderBottom: "1px solid #e2e8f0", background: "#fff", padding: "18px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <h1 style={{ fontSize: 30, lineHeight: 1.2, margin: 0, fontWeight: 700 }}>Create Time Report</h1>
                    <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14 }}>
                      Enter project hours and non-worked hours in the same layout as your enterprise timesheet.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 12px", background: "#f8fafc" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 9999, background: "#0f172a", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
                        L
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Liam Whitehead</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, display: "grid", gap: 24 }}>
                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                  <div style={{ padding: 20, borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      Create Time Report
                    </div>
                    <div style={{ marginTop: 4, fontSize: 24, fontWeight: 700 }}>Time Report Summary</div>
                    <div style={{ marginTop: 4, fontSize: 14, color: "#64748b" }}>Carina Jose</div>
                  </div>

                  <div style={{ padding: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    {[
                      ["Empl ID", "548271"],
                      ["Period End Date", "11/04/2026"],
                      ["Time Report ID", "NEXT"],
                      ["Version", "Original"],
                      ["GL Business Unit", "GB014"],
                      ["Operating Unit", "1035"],
                      ["Finance Department", "23405"],
                      ["Service Type", "120"],
                      ["Job Code", "201"],
                      ["Tax Location Code", ""],
                    ].map(([label, value]) => (
                      <div key={label} style={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 16 }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>{value || "—"}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "0 20px 20px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1d4ed8", marginBottom: 12 }}>Attachments</div>

                    <FieldLabel>Comment</FieldLabel>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Add a note about this time report..."
                    />

                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#475569" }}>
                      <input type="checkbox" />
                      <span>Show descriptions</span>
                    </div>
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff" }}>
                  <div style={{ padding: 20, borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Project Hours Details</div>
                        <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                          Enter project time by day, then total is calculated for the row.
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: "#64748b" }}>Personalize • Find • Info</div>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: 1280 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 120px 120px 110px 150px 140px 130px repeat(7, 78px) 80px 60px",
                          gap: 0,
                          padding: "10px 12px",
                          borderBottom: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {["Project", "Activity", "Source Type", "Category", "Project Subcategory", "Payroll Category", "Billing Action"].map((col) => (
                          <div key={col} style={{ padding: "0 4px" }}>
                            {col}
                          </div>
                        ))}
                        {dayLabels.map((d) => (
                          <div key={d.key} style={{ textAlign: "center", padding: "0 4px" }}>
                            {d.label}
                          </div>
                        ))}
                        <div style={{ textAlign: "center", padding: "0 4px" }}>Total</div>
                        <div />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 120px 120px 110px 150px 140px 130px repeat(7, 78px) 80px 60px",
                          alignItems: "center",
                          padding: "12px 12px",
                        }}
                      >
                        <div style={{ padding: "0 4px" }}>
                          <select
                            style={selectStyle()}
                            value={projectHours.project}
                            onChange={(e) => setProjectHours((p) => ({ ...p, project: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {projects.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <select
                            style={selectStyle()}
                            value={projectHours.activity}
                            onChange={(e) => setProjectHours((p) => ({ ...p, activity: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {tasks.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <input
                            style={inputStyle()}
                            value={projectHours.sourceType}
                            onChange={(e) => setProjectHours((p) => ({ ...p, sourceType: e.target.value }))}
                            placeholder="10000"
                          />
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <input
                            style={inputStyle()}
                            value={projectHours.category}
                            onChange={(e) => setProjectHours((p) => ({ ...p, category: e.target.value }))}
                            placeholder="10100"
                          />
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <input
                            style={inputStyle()}
                            value={projectHours.subcategory}
                            onChange={(e) => setProjectHours((p) => ({ ...p, subcategory: e.target.value }))}
                          />
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <input
                            style={inputStyle()}
                            value={projectHours.payrollCategory}
                            onChange={(e) => setProjectHours((p) => ({ ...p, payrollCategory: e.target.value }))}
                          />
                        </div>
                        <div style={{ padding: "0 4px" }}>
                          <select
                            style={selectStyle()}
                            value={projectHours.billingAction}
                            onChange={(e) => setProjectHours((p) => ({ ...p, billingAction: e.target.value }))}
                          >
                            {billingActions.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                        </div>

                        {dayLabels.map((d) => (
                          <div key={d.key} style={{ padding: "0 4px" }}>
                            <input
                              style={{ ...inputStyle(), textAlign: "center" }}
                              value={projectHours[d.key]}
                              onChange={(e) => setProjectHours((p) => ({ ...p, [d.key]: e.target.value }))}
                              placeholder="0.0"
                            />
                          </div>
                        ))}

                        <div style={{ textAlign: "center", fontWeight: 700 }}>{projectTotal.toFixed(2)}</div>
                        <div style={{ textAlign: "right" }}>+</div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid #e2e8f0",
                          padding: "12px",
                          fontSize: 14,
                          color: "#475569",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "120px 120px 120px 110px 150px 140px 130px repeat(7, 78px) 80px 60px",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ gridColumn: "span 8", textAlign: "right", paddingRight: 12, fontWeight: 600 }}>
                            Total Project Related Hours:
                          </div>
                          {dayLabels.map((d) => (
                            <div key={d.key} style={{ textAlign: "center" }}>
                              {parseHours(projectHours[d.key]).toFixed(2)}
                            </div>
                          ))}
                          <div style={{ textAlign: "center", fontWeight: 700 }}>{projectTotal.toFixed(2)}</div>
                          <div />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff" }}>
                  <div style={{ padding: 20, borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Internal and Non-Worked hours details</div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                      Use these rows for leave, training, and internal time.
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: 1100 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "280px repeat(7, 78px) 80px",
                          padding: "10px 12px",
                          background: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        <div>Description</div>
                        {dayLabels.map((d) => (
                          <div key={d.key} style={{ textAlign: "center" }}>
                            {d.label}
                          </div>
                        ))}
                        <div style={{ textAlign: "center" }}>Total</div>
                      </div>

                      {Object.entries(nonWorked).map(([label, values]) => {
                        const total = sumDays(values);
                        return (
                          <div
                            key={label}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "280px repeat(7, 78px) 80px",
                              alignItems: "center",
                              padding: "10px 12px",
                              borderBottom: "1px solid #e2e8f0",
                              fontSize: 14,
                            }}
                          >
                            <div>{label}</div>
                            {dayLabels.map((d) => (
                              <div key={d.key} style={{ padding: "0 4px" }}>
                                <input
                                  style={{ ...inputStyle(), textAlign: "center" }}
                                  value={values[d.key]}
                                  onChange={(e) => updateNonWorked(label, d.key, e.target.value)}
                                  placeholder="0.0"
                                />
                              </div>
                            ))}
                            <div style={{ textAlign: "center", fontWeight: 700 }}>{total.toFixed(2)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff", padding: 20 }}>
                  <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    <div>
                      <FieldLabel>User</FieldLabel>
                      <select
                        style={selectStyle()}
                        value={form.user}
                        onChange={(e) => setForm((f) => ({ ...f, user: e.target.value }))}
                      >
                        <option value="">Select user</option>
                        {users.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Date</FieldLabel>
                      <input
                        style={inputStyle()}
                        value={form.date}
                        onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                        type="date"
                      />
                    </div>

                    <div>
                      <FieldLabel>Project</FieldLabel>
                      <select
                        style={selectStyle()}
                        value={form.project}
                        onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
                      >
                        <option value="">Select project</option>
                        {projects.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Time Code</FieldLabel>
                      <select
                        style={selectStyle()}
                        value={form.timeCode}
                        onChange={(e) => setForm((f) => ({ ...f, timeCode: e.target.value }))}
                      >
                        {timeCodes.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.code} - {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Task</FieldLabel>
                      <select
                        style={selectStyle()}
                        value={form.task}
                        onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
                      >
                        {tasks.map((task) => (
                          <option key={task} value={task}>
                            {task}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Hours</FieldLabel>
                      <input
                        style={inputStyle()}
                        value={form.hours}
                        onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                        placeholder="8.0"
                        type="number"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <FieldLabel>Notes</FieldLabel>
                    <textarea
                      style={{ ...inputStyle(), minHeight: 110, resize: "vertical" }}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Add details for the timesheet entry..."
                    />
                  </div>

                  <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button style={buttonStyle("primary")} onClick={submitAdd}>
                      Save entry
                    </button>
                    <button style={buttonStyle("outline")} onClick={clearAll}>
                      Clear
                    </button>
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 16, background: "#0f172a" }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Entry preview</div>
                      <div style={{ fontSize: 14, color: "#64748b" }}>How the new row will appear after submission.</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 18, borderRadius: 16, border: "1px solid #e2e8f0", background: "#f8fafc", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{form.project || "Project name"}</div>
                        <div style={{ marginTop: 4, fontSize: 14, color: "#64748b" }}>
                          {form.user || "User"} • {form.date || "Date"}
                        </div>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gap: 8, fontSize: 14, color: "#475569" }}>
                      <div>
                        <strong>Time code:</strong> {form.timeCode}
                      </div>
                      <div>
                        <strong>Task:</strong> {form.task}
                      </div>
                      <div>
                        <strong>Hours:</strong> {form.hours || "0"}
                      </div>
                    </div>

                    <div style={{ marginTop: 16, borderRadius: 12, background: "#fff", padding: 12, fontSize: 14, color: "#475569" }}>
                      {form.notes || "Notes will appear here."}
                    </div>
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff", padding: 20 }}>
                  <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 16 }}>Quick stats</div>
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                    <StatPill label="Total hours" value={`${stats.hours.toFixed(1)}h`} background="#eff6ff" />
                    <StatPill label="Pending" value={`${stats.pending}`} background="#fffbeb" />
                    <StatPill label="Approved" value={`${stats.approved}`} background="#ecfdf5" />
                  </div>
                </section>

                <section style={{ borderRadius: 24, border: "1px solid #e2e8f0", background: "#fff", padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>Recent entries</div>
                      <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Approve or reject directly from the list.</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 12, padding: "8px 12px" }}>
                      <span style={{ color: "#94a3b8" }}>Search</span>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search entries..."
                        style={{ border: 0, background: "transparent", outline: "none", fontSize: 14 }}
                      />
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: 980 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px 160px 1.1fr 1fr 90px 120px 180px",
                          padding: "12px 12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderBottom: 0,
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        <div>Date</div>
                        <div>User</div>
                        <div>Project</div>
                        <div>Task</div>
                        <div>Hours</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>

                      <div style={{ border: "1px solid #e2e8f0", borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: "hidden" }}>
                        {filteredRows.map((row) => (
                          <div
                            key={row.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 160px 1.1fr 1fr 90px 120px 180px",
                              alignItems: "center",
                              padding: "14px 12px",
                              borderTop: "1px solid #e2e8f0",
                              fontSize: 14,
                              background: "#fff",
                            }}
                          >
                            <div style={{ color: "#334155" }}>{row.date}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155" }}>
                              <div style={{ width: 28, height: 28, borderRadius: 9999, background: "#e2e8f0" }} />
                              <span>{row.user}</span>
                            </div>
                            <div style={{ color: "#334155" }}>{row.project}</div>
                            <div style={{ color: "#334155" }}>{row.task}</div>
                            <div style={{ color: "#334155" }}>{row.hours}</div>
                            <div>
                              <StatusBadge status={row.status} />
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                style={buttonStyle("outline")}
                                onClick={() => approve(row.id)}
                              >
                                Approve
                              </button>
                              <button
                                style={buttonStyle("danger")}
                                onClick={() => reject(row.id)}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button style={buttonStyle("primary")} onClick={submitAdd}>
                    Submit
                  </button>
                  <button style={buttonStyle("outline")} onClick={clearAll}>
                    Cancel
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}