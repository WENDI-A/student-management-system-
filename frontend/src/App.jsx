import React from "react";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider";
import authProvider from "./hooks/authProvider";
import { CustomLayout } from "./layout/CustomLayout";
import LoginPage from "./Auth/LoginPage";

// Import role-specific dashboards
import AdminDashboard from "./dashboards/AdminDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";
import ParentDashboard from "./dashboards/ParentDashboard";
import UserDashboard from "./dashboards/UserDashboard";

// Dashboard selector based on user role
const DashboardSelector = () => {
  const role = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth')).user.role
    : 'user';

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return <UserDashboard />;
  }
};

const App = () => {
  // Check user role from local storage
  const getUserRole = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).user.role : null;
  };

  const getResources = (role) => {
    const resources = [];
    
    switch (role) {
      case 'admin':
        resources.push(
          <Resource key="students" name="students" options={{ label: "Students" }} />,
          <Resource key="teachers" name="teachers" options={{ label: "Teachers" }} />,
          <Resource key="parents" name="parents" options={{ label: "Parents" }} />,
          <Resource key="courses" name="courses" options={{ label: "Courses" }} />,
          <Resource key="assignments" name="assignments" options={{ label: "Assignments" }} />,
          <Resource key="exams" name="exams" options={{ label: "Exams" }} />,
          <Resource key="attendance" name="attendance" options={{ label: "Attendance" }} />,
          <Resource key="announcements" name="announcements" options={{ label: "Announcements" }} />
        );
        break;
      case 'teacher':
        resources.push(
          <Resource key="students" name="students" options={{ label: "Students" }} />,
          <Resource key="courses" name="courses" options={{ label: "Courses" }} />,
          <Resource key="assignments" name="assignments" options={{ label: "Assignments" }} />,
          <Resource key="exams" name="exams" options={{ label: "Exams" }} />,
          <Resource key="attendance" name="attendance" options={{ label: "Attendance" }} />
        );
        break;
      case 'student':
        resources.push(
          <Resource key="courses" name="courses" options={{ label: "My Courses" }} />,
          <Resource key="assignments" name="assignments" options={{ label: "My Assignments" }} />,
          <Resource key="exams" name="exams" options={{ label: "My Exams" }} />,
          <Resource key="attendance" name="attendance" options={{ label: "My Attendance" }} />
        );
        break;
      case 'parent':
        resources.push(
          <Resource key="students" name="students" options={{ label: "My Children" }} />,
          <Resource key="courses" name="courses" options={{ label: "Courses" }} />,
          <Resource key="assignments" name="assignments" options={{ label: "Assignments" }} />,
          <Resource key="exams" name="exams" options={{ label: "Exams" }} />,
          <Resource key="attendance" name="attendance" options={{ label: "Attendance" }} />
        );
        break;
      default:
        resources.push(
          <Resource key="announcements" name="announcements" options={{ label: "Announcements" }} />
        );
    }

    return resources;
  };

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={DashboardSelector}
      layout={CustomLayout}
      loginPage={LoginPage}
      requireAuth
    >
      {getResources(getUserRole())}
    </Admin>
  );
};

export default App;
