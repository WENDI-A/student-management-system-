
import React from "react";
import { Resource } from "react-admin";

// Student components
import StudentList from "../Admin/Student/StudentList";
import StudentCreate from "../Admin/Student/StudentCreate";
import StudentEdit from "../Admin/Student/StudentEdit";

// Dashboard components
import AdminDashboard from "../Admin/AdminDashboard";
import TeacherDashboard from "../dashboards/TeacherDashboard";
import StudentDashboard from "../dashboards/StudentDashboard";
import ParentDashboard from "../dashboards/ParentDashboard";
import UserDashboard from "../dashboards/UserDashboard";


const DASHBOARDS = {
  admin: AdminDashboard,
  teacher: TeacherDashboard,
  student: StudentDashboard,
  parent: ParentDashboard,
  user: UserDashboard, 
};

const RESOURCES = {
  admin: [
    { key: "students", name: "students", options: { label: "Students" }, list: StudentList, create: StudentCreate, edit: StudentEdit },
    { key: "teachers", name: "teachers", options: { label: "Teachers" } },
    { key: "parents", name: "parents", options: { label: "Parents" } },
    { key: "courses", name: "courses", options: { label: "Courses" } },
    { key: "assignments", name: "assignments", options: { label: "Assignments" } },
    { key: "exams", name: "exams", options: { label: "Exams" } },
    { key: "attendance", name: "attendance", options: { label: "Attendance" } },
    { key: "announcements", name: "announcements", options: { label: "Announcements" } }
  ],
  teacher: [
    { key: "students", name: "students", options: { label: "Students" } },
    { key: "courses", name: "courses", options: { label: "Courses" } },
    { key: "assignments", name: "assignments", options: { label: "Assignments" } },
    { key: "exams", name: "exams", options: { label: "Exams" } },
    { key: "attendance", name: "attendance", options: { label: "Attendance" } }
  ],
  student: [
    { key: "courses", name: "courses", options: { label: "My Courses" } },
    { key: "assignments", name: "assignments", options: { label: "My Assignments" } },
    { key: "exams", name: "exams", options: { label: "My Exams" } },
    { key: "attendance", name: "attendance", options: { label: "My Attendance" } }
  ],
  parent: [
    { key: "students", name: "students", options: { label: "My Children" } },
    { key: "courses", name: "courses", options: { label: "Courses" } },
    { key: "assignments", name: "assignments", options: { label: "Assignments" } },
    { key: "exams", name: "exams", options: { label: "Exams" } },
    { key: "attendance", name: "attendance", options: { label: "Attendance" } }
  ],
  user: [
    { key: "announcements", name: "announcements", options: { label: "Announcements" } }
  ]
};

export const DashboardSelector = () => {
  const role = localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth')).user.role
    : 'user';
  
  const Dashboard = DASHBOARDS[role] || DASHBOARDS.user;
  return <Dashboard />;
};


export const getResources = (role) => {
  const roleConfig = RESOURCES[role] || RESOURCES.user;
  return roleConfig.map(resource => (
    <Resource
      key={resource.key}
      name={resource.name}
      options={resource.options}
      list={resource.list}
      create={resource.create}
      edit={resource.edit}
    />
  ));
};
