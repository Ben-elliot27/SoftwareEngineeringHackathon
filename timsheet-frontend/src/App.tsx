<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

>>>>>>> 2ff4b6416fdaea3bc14e6ddbc65f71c1a62c324d
import TimesheetApprovals from "./pages/DirectorPage.tsx";
import AddTimesheet from "./pages/addTimesheet.tsx";
>>>>>>> aa967abee4741f572b19f681b1a3c9ca1bdd8fd0
import TimesheetWebsite from "./pages/Home.tsx";

export default function App() {
<<<<<<< HEAD
  return <>
  
   {/* <AddTimesheet /> */}
   {/* <TimesheetWebsite /> */}
   <TimesheetApprovals />

  </>
;
}
<<<<<<< HEAD
=======

 
>>>>>>> aa967abee4741f572b19f681b1a3c9ca1bdd8fd0
=======
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
>>>>>>> 2ff4b6416fdaea3bc14e6ddbc65f71c1a62c324d
