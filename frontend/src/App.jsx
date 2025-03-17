import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SchoolLogin from "./Auth/StudentLogIn";
import StudentDashboard from "./Student/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SchoolLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
