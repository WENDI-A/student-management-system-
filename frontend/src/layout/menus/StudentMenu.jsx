import React from 'react';
import { Menu } from 'react-admin';
import {
    Dashboard as DashboardIcon,
    MenuBook as MenuBookIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarTodayIcon,
    Announcement as AnnouncementIcon,
    LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';

export const StudentMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/courses"
            primaryText="My Courses"
            leftIcon={<MenuBookIcon />}
        />
        <Menu.Item
            to="/assignments"
            primaryText="Assignments"
            leftIcon={<LibraryBooksIcon />}
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