
import React from "react";
import { Resource } from "react-admin";

// Student components
import StudentList from "../Admin/Student/StudentList";
import StudentCreate from "../Admin/Student/StudentCreate";
import StudentEdit from "../Admin/Student/StudentEdit";

// Dashboard components
import AdminDashboard from "../Admin/AdminDashboard";
import TeacherDashboard from "../Teacher/TeacherDashboard";
import StudentDashboard from "../dashboards/StudentDashboard";
import ParentDashboard from "../dashboards/ParentDashboard";
import UserDashboard from "../dashboards/UserDashboard";

// Teacher components
import TeacherList from "../Admin/Teacher/TeacherList";
import TeacherEdit from "../Admin/Teacher/TeacherEdit";
import TeacherCreate from "../Admin/Teacher/TeacherCreate";
import ParentList from "../Admin/parent/ParentList";
import parentCreate from "../Admin/parent/ParentCreate";
import parentEdit from "../Admin/parent/ParentEdit";
import { UpdatePasswordEdit } from "../Admin/UpdatePassword";
import Notification from "../Admin/Notifcation/notifcationList";
// Course components
import CourseCreate from "../Admin/Course/CourseCreate";
import CourseEdit from "../Admin/Course/CourseEdit";
import CourseList from "../Admin/Course/CourseList";

import StudentListTeacher from "../Teacher/Student/StudentList";
import CourseMaterialList from "../Teacher/CourseMaterial/CourseMaterialList";
import CourseMaterialCreate from "../Teacher/CourseMaterial/CourseMaterialCreate";
import CourseMaterialEdit from "../Teacher/CourseMaterial/CourseMaterialEdit";
import NotificationTeacher from "../Teacher/Notifcation/notifcationList";
import {UpdatePasswordEditTeacher } from "../Teacher/UpdatePassword";


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
    { key: "teachers", name: "teachers", options: { label: "Teachers" } , list: TeacherList , create:TeacherCreate , edit: TeacherEdit },
    { key: "parents", name: "parents", options: { label: "Parents" } ,list :ParentList , create : parentCreate , edit : parentEdit },
    { key: "course", name: "course", options: { label: "courses" } ,list : CourseList , create : CourseCreate  , edit : CourseEdit },
    { key: "Notfication", name: "Notfication", options: { label: "Notfication" }, list : Notification },
    { key: "Settings", name: "Settings", options: { label: "Settings" } ,list :  UpdatePasswordEdit },
  ],
  teacher: [
    { key: "students", name: "students", options: { label: "Students" } , list :StudentListTeacher },
    { key: "CourseMaterial", name: "CourseMaterial", options: { label: "CourseMaterial" }  ,list :CourseMaterialList, create : CourseMaterialCreate , edit : CourseMaterialEdit },
    { key: "Assessment", name: "Assessment", options: { label: "Assessment" } },
    { key: "attendance", name: "attendance", options: { label: "Attendance" } },
    { key: "notifications", name: "notifications", options: { label: "notifications" } ,list :NotificationTeacher },
    { key: "settings", name: "settings", options: { label: "settings" } , list:UpdatePasswordEditTeacher },
    
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
