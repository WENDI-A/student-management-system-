import React from 'react';
import { Menu } from 'react-admin';
import {
    MenuBook as MenuBookIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarTodayIcon,
    Announcement as AnnouncementIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';

export const TeacherMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/courseMaterial"
            primaryText="CourseMaterial"
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
            to="/assessment"
            primaryText="Assessment"
            leftIcon={<CalendarTodayIcon />}
        />
        <Menu.Item
            to="/notifications"
            primaryText="Notifications"
            leftIcon={<NotificationsIcon />}
        />
        <Menu.Item
            to="/settings"
            primaryText="Settings"
            leftIcon={<SettingsIcon />}
        />
    </Menu>
);