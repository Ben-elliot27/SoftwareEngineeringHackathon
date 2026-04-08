import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import TimesheetApprovals from "./pages/DirectorPage";
import AddTimesheet from "./pages/addTimesheet";
import TimesheetWebsite from "./pages/Home";
import WeeklyTimesheetPage from "./pages/ViewTimesheet";
import History from "./pages/history";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<TimesheetWebsite />} />
        <Route path="/add-timesheet" element={<AddTimesheet />} />
        <Route path="/history" element={<History />} />
        <Route path="/approvals" element={<TimesheetApprovals />} />
        <Route path="/director-page" element={<TimesheetApprovals />} />
        <Route path="/view-timesheet" element={<WeeklyTimesheetPage />} />
      </Routes>
    </BrowserRouter>
  );
}