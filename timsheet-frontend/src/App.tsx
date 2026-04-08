import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TimesheetApprovals from "./pages/DirectorPage.tsx";
import AddTimesheet from "./pages/addTimesheet.tsx";
import TimesheetWebsite from "./pages/Home.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimesheetWebsite />} />
        <Route path="/add-timesheet" element={<AddTimesheet />} />
        <Route path="/approvals" element={<TimesheetApprovals />} />
      </Routes>
    </Router>
  );
}