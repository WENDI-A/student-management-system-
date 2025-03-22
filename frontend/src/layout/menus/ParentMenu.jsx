
import React from 'react';
import { Menu } from 'react-admin';
import {
    Dashboard as DashboardIcon,
    MenuBook as MenuBookIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    CalendarToday as CalendarTodayIcon,
    Announcement as AnnouncementIcon,
    Payment as PaymentIcon,
} from '@mui/icons-material';

export const ParentMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/children"
            primaryText="My Children"
            leftIcon={<PersonIcon />}
        />
        <Menu.Item
            to="/progress"
            primaryText="Academic Progress"
            leftIcon={<AssessmentIcon />}
        />
        <Menu.Item
            to="/attendance"
            primaryText="Attendance"
            leftIcon={<CalendarTodayIcon />}
        />
        <Menu.Item
            to="/courses"
            primaryText="Courses"
            leftIcon={<MenuBookIcon />}
        />
        <Menu.Item
            to="/payments"
            primaryText="Payments"
            leftIcon={<PaymentIcon />}
        />
        <Menu.Item
            to="/announcements"
            primaryText="Announcements"
            leftIcon={<AnnouncementIcon />}
        />
    </Menu>
);