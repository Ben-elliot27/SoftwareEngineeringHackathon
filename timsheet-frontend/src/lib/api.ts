export type UserRole = "employee" | "manager" | "admin";
export type EntryStatus = "pending" | "approved" | "rejected";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

export type TimeCode = {
  id: number;
  code: string;
  description: string | null;
  is_active: boolean;
};

export type TimesheetEntry = {
  id: number;
  user_id: number;
  time_code_id: number;
  entry_date: string;
  hours: number;
  description: string | null;
  status: EntryStatus;
  rejection_reason: string | null;
  user?: User | null;
  time_code?: TimeCode | null;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

const FALLBACK_API_BASE = "http://localhost:8000";

function getApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const candidate = configured?.trim() || FALLBACK_API_BASE;

  try {
    return new URL(candidate).origin;
  } catch {
    return FALLBACK_API_BASE;
  }
}

export const API_BASE = getApiBase();

function buildUrl(path: string) {
  return `${API_BASE}${path}`;
}

function toApiErrorText(error: unknown, fallback: string) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "detail" in error) {
    const detail = (error as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(toApiErrorText(payload, `Request failed (${response.status})`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const token = await request<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  return token.access_token;
}

export function getStoredToken() {
  return window.localStorage.getItem("access_token");
}

export function storeToken(token: string) {
  window.localStorage.setItem("access_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("access_token");
}

export function getCurrentUser(token: string) {
  return request<User>("/api/v1/users/me", {}, token);
}

export function listUsers(token: string) {
  return request<User[]>("/api/v1/users/", {}, token);
}

export function listTimeCodes(token: string) {
  return request<TimeCode[]>("/api/v1/time-codes/?active_only=true", {}, token);
}

export function listTimesheets(token: string) {
  return request<TimesheetEntry[]>("/api/v1/timesheets/", {}, token);
}

export function createTimesheet(
  token: string,
  payload: {
    user_id: number;
    time_code_id: number;
    entry_date: string;
    hours: number;
    description?: string;
  },
) {
  return request<TimesheetEntry>(
    "/api/v1/timesheets/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function approveTimesheet(token: string, entryId: number) {
  return request<TimesheetEntry>(`/api/v1/timesheets/${entryId}/approve`, { method: "POST" }, token);
}

export function rejectTimesheet(token: string, entryId: number, rejectionReason: string) {
  return request<TimesheetEntry>(
    `/api/v1/timesheets/${entryId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ rejection_reason: rejectionReason || null }),
    },
    token,
  );
}
