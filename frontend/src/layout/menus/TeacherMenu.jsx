import React from 'react';
import { Menu } from 'react-admin';
import {
    Dashboard as DashboardIcon,
    MenuBook as MenuBookIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarTodayIcon,
    Announcement as AnnouncementIcon,
} from '@mui/icons-material';

export const TeacherMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/classes"
            primaryText="My Classes"
            leftIcon={<MenuBookIcon />}
        />
        <Menu.Item
            to="/students"
            primaryText="Students"
            leftIcon={<PeopleIcon />}
        />
        <Menu.Item
            to="/assignments"
            primaryText="Assignments"
            leftIcon={<AssignmentIcon />}
        />
        <Menu.Item
            to="/exams"
            primaryText="Exams"
            leftIcon={<AssessmentIcon />}
        />
        <Menu.Item
            to="/attendance"
            primaryText="Attendance"
            leftIcon={<CalendarTodayIcon />}
        />
        <Menu.Item
            to="/announcements"
            primaryText="Announcements"
            leftIcon={<AnnouncementIcon />}
        />
    </Menu>
);
