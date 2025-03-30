import React from "react";
import { Resource } from "react-admin";

// Import Material-UI icons
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import HowToRegIcon from '@mui/icons-material/HowToReg';

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
import { AttendanceList , AttendanceEdit} from "../Teacher/Attendance/AttendanceList";
import PendingEnrollments from "../Teacher/courseEnrollments/courseEnrollmentsList";
import Assessment from "../Teacher/assessments/index";

const DASHBOARDS = {
  admin: AdminDashboard,
  teacher: TeacherDashboard,
  student: StudentDashboard,
  parent: ParentDashboard,
  user: UserDashboard, 
};

const RESOURCES = {
  admin: [
    { key: "students", name: "students", options: { label: "Students" }, list: StudentList, create: StudentCreate, edit: StudentEdit, icon: SchoolIcon },
    { key: "teachers", name: "teachers", options: { label: "Teachers" } , list: TeacherList , create:TeacherCreate , edit: TeacherEdit, icon: PersonIcon },
    { key: "parents", name: "parents", options: { label: "Parents" } ,list :ParentList , create : parentCreate , edit : parentEdit, icon: FamilyRestroomIcon },
    { key: "course", name: "course", options: { label: "courses" } ,list : CourseList , create : CourseCreate  , edit : CourseEdit, icon: MenuBookIcon },
    { key: "Notfication", name: "Notfication", options: { label: "Notfication" }, list : Notification, icon: NotificationsIcon },
    { key: "Settings", name: "Settings", options: { label: "Settings" } ,list :  UpdatePasswordEdit, icon: SettingsIcon },
  ],
  teacher: [
    { key: "CourseMaterial", name: "CourseMaterial", options: { label: "CourseMaterial" }  ,list :CourseMaterialList, create : CourseMaterialCreate , edit : CourseMaterialEdit, icon: LibraryBooksIcon },
    { key: "courseEnrollments", name: "courseEnrollments", options: { label: "Course Enrollments" }, icon: HowToRegIcon  ,list : PendingEnrollments },
    { key: "Assessment", name: "Assessment", options: { label: "Assessment" }, icon: AssessmentIcon  , list : Assessment.AssessmentList ,create  : Assessment.AssessmentCreate , edit :  Assessment.AssessmentEdit },
    { key: "attendance", name: "attendance", options: { label: "Attendance" } , list: AttendanceList, edit : AttendanceEdit , icon: EventIcon },
    { key: "notifications", name: "notifications", options: { label: "notifications" } ,list :NotificationTeacher, icon: NotificationsIcon },
    { key: "settings", name: "settings", options: { label: "settings" } , list:UpdatePasswordEditTeacher, icon: SettingsIcon },
    
  ],
  student: [
    { key: "courses", name: "courses", options: { label: "My Courses" }, icon: MenuBookIcon },
    { key: "assignments", name: "assignments", options: { label: "My Assignments" }, icon: AssignmentIcon },
    { key: "exams", name: "exams", options: { label: "My Exams" }, icon: AssessmentIcon },
    { key: "attendance", name: "attendance", options: { label: "My Attendance" }, icon: EventIcon }
  ],
  parent: [
    { key: "students", name: "students", options: { label: "My Children" }, icon: SchoolIcon },
    { key: "courses", name: "courses", options: { label: "Courses" }, icon: MenuBookIcon },
    { key: "assignments", name: "assignments", options: { label: "Assignments" }, icon: AssignmentIcon },
    { key: "exams", name: "exams", options: { label: "Exams" }, icon: AssessmentIcon },
    { key: "attendance", name: "attendance", options: { label: "Attendance" }, icon: EventIcon }
  ],
  user: [
    { key: "announcements", name: "announcements", options: { label: "Announcements" }, icon: AnnouncementIcon }
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
  const roleConfig = RESOURCES[role];

  return roleConfig.map(resource => (
    <Resource
      key={resource.key}
      name={resource.name}
      options={resource.options}
      list={resource.list}
      create={resource.create}
      edit={resource.edit}
      icon={resource.icon}
    />
  ));
};
