import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import TimesheetApprovals from "./pages/DirectorPage";
import AddTimesheet from "./pages/addTimesheet";
import TimesheetWebsite from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<TimesheetWebsite />} />
        <Route path="/add-timesheet" element={<AddTimesheet />} />
        <Route path="/director-page" element={<TimesheetApprovals />} />
      </Routes>
    </BrowserRouter>
  );
}