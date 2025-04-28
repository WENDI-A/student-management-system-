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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Student components
import StudentList from "../Admin/Student/StudentList";
import StudentCreate from "../Admin/Student/StudentCreate";
import StudentEdit from "../Admin/Student/StudentEdit";

// Dashboard components
import AdminDashboard from "../Admin/AdminDashboard";
import TeacherDashboard from "../Teacher/TeacherDashboard";
import StudentDashboard from "../student/StudentDashboard";
import ParentDashboard from "../parent/ParentDashboard";
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

import CourseMaterialList from "../Teacher/CourseMaterial/CourseMaterialList";
import CourseMaterialCreate from "../Teacher/CourseMaterial/CourseMaterialCreate";
import CourseMaterialEdit from "../Teacher/CourseMaterial/CourseMaterialEdit";
import NotificationTeacher from "../Teacher/Notifcation/notifcationList";
import {UpdatePasswordEditTeacher } from "../Teacher/UpdatePassword";
import { AttendanceList} from "../Teacher/Attendance/AttendanceList";
import PendingEnrollments from "../Teacher/courseEnrollments/courseEnrollmentsList";
import Assessment from "../Teacher/assessments/index";
import GradeList from "../Teacher/Grade/gradeList";
import GradeEdit from "../Teacher/Grade/gradeEdit";

// Schedule components
import ScheduleList from "../Admin/Schedule/ScheduleList";
import ScheduleCreate from "../Admin/Schedule/ScheduleCreate";
import ScheduleEdit from "../Admin/Schedule/ScheduleEdit";
import StudentCourseMaterial from "../student/StudentCourseMaterial";
import StudentAssessmentList from "../student/studentAssessments/AssessmentList";

import NotificationList from "../student/notifications/NotificationList";
import ParentNotificationList from "../parent/notifications/NotificationList";

const RESOURCES = {
  admin: [
    { key: "dashboard", name: "dashboard", options: { label: "Dashboard" }, list: AdminDashboard, icon: DashboardIcon },
    { key: "students", name: "students", options: { label: "Students" }, list: StudentList, create: StudentCreate, edit: StudentEdit, icon: SchoolIcon },
    { key: "teachers", name: "teachers", options: { label: "Teachers" }, list: TeacherList, create: TeacherCreate, edit: TeacherEdit, icon: PersonIcon },
    { key: "parents", name: "parents", options: { label: "Parents" }, list: ParentList, create: parentCreate, edit: parentEdit, icon: FamilyRestroomIcon },
    { key: "course", name: "course", options: { label: "courses" }, list: CourseList, create: CourseCreate, edit: CourseEdit, icon: MenuBookIcon },
    { key: "schedules", name: "schedules", options: { label: "Schedules" }, list: ScheduleList, create: ScheduleCreate, edit: ScheduleEdit, icon: CalendarTodayIcon },
    { key: "Notfication", name: "Notfication", options: { label: "Notfication" }, list: Notification, icon: NotificationsIcon },
    { key: "Settings", name: "Settings", options: { label: "Settings" }, list: UpdatePasswordEdit, icon: SettingsIcon },
  ],
  teacher: [
    { key: "dashboard", name: "dashboard", options: { label: "Dashboard" }, list: TeacherDashboard, icon: DashboardIcon },
    { key: "CourseMaterial", name: "CourseMaterial", options: { label: "CourseMaterial" }, list: CourseMaterialList, create: CourseMaterialCreate, edit: CourseMaterialEdit, icon: LibraryBooksIcon },
    { key: "courseEnrollments", name: "courseEnrollments", options: { label: "Course Enrollments" }, icon: HowToRegIcon, list: PendingEnrollments },
    { key: "Assessment", name: "Assessment", options: { label: "Assessment" }, icon: AssessmentIcon, list: Assessment.AssessmentList, create: Assessment.AssessmentCreate, edit: Assessment.AssessmentEdit },
    { key: "attendance", name: "attendance", options: { label: "Attendance" }, list: AttendanceList, icon: EventIcon },
    { key: "grade", name: "grade", options: { label: "grade" }, list: GradeList, create: GradeEdit, edit: GradeEdit, icon: AssessmentIcon },
    { key: "notifications", name: "notifications", options: { label: "notifications" }, list: NotificationTeacher, icon: NotificationsIcon },
    { key: "settings", name: "settings", options: { label: "settings" }, list: UpdatePasswordEditTeacher, icon: SettingsIcon },
  ],
  student: [
    { key: "dashboard", name: "dashboard", options: { label: "Dashboard" }, list: StudentDashboard, icon: DashboardIcon },
    { key: "CourseMaterial", name: "CourseMaterial", options: { label: "My Course Material" }, icon: MenuBookIcon, list: StudentCourseMaterial },
    { key: "myAssessment", name: "myAssessment", options: { label: "My Assessment" }, icon: AssignmentIcon, list: StudentAssessmentList },
    { key: "Notifcation", name: "Notifcation", options: { label: "Notifcation" }, icon: NotificationsIcon, list: NotificationList },
    { key: "settings", name: "settings", options: { label: "settings" }, list: UpdatePasswordEditTeacher, icon: SettingsIcon },
  ],
  parent: [
    { key: "dashboard", name: "dashboard", options: { label: "Dashboard" }, list: ParentDashboard, icon: DashboardIcon },
    { key: "students", name: "students", options: { label: "My Children" }, icon: SchoolIcon },
    { key: "Notifcation", name: "Notifcation", options: { label: "Notifcation" }, icon: NotificationsIcon, list: ParentNotificationList },
    { key: "settings", name: "settings", options: { label: "settings" }, list: UpdatePasswordEditTeacher, icon: SettingsIcon },
  ],
  user: [
    { key: "dashboard", name: "dashboard", options: { label: "Dashboard" }, list: UserDashboard, icon: DashboardIcon },
    { key: "announcements", name: "announcements", options: { label: "Announcements" }, icon: AnnouncementIcon }
  ]
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
