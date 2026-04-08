import { NavLink } from "react-router-dom";

export default function NavBar() {
  const baseClass =
    "rounded-2xl px-4 py-2 text-sm font-semibold transition";
  const activeClass = "bg-slate-900 text-white";
  const inactiveClass = "text-slate-600 hover:bg-slate-100";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d71920] to-[#6f2dbd] text-sm font-bold text-white shadow-md">
            CGI
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">CGI</div>
            <div className="text-xs text-slate-500">Timesheet Management</div>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/add-timesheet"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Add Timesheet
          </NavLink>

          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Approvals
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
