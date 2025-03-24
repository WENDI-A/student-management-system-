import React from 'react';
import { Menu } from 'react-admin';
import {
    Dashboard as DashboardIcon,
    MenuBook as MenuBookIcon,
    Info as InfoIcon,
    CalendarToday as CalendarTodayIcon,
    Announcement as AnnouncementIcon,
    ContactMail as ContactMailIcon,
} from '@mui/icons-material';

export const UserMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/about"
            primaryText="About School"
            leftIcon={<InfoIcon />}
        />
        <Menu.Item
            to="/courses"
            primaryText="Courses Offered"
            leftIcon={<MenuBookIcon />}
        />
        <Menu.Item
            to="/events"
            primaryText="Events"
            leftIcon={<CalendarTodayIcon />}
        />
        <Menu.Item
            to="/announcements"
            primaryText="Announcements"
            leftIcon={<AnnouncementIcon />}
        />
        <Menu.Item
            to="/contact"
            primaryText="Contact Us"
            leftIcon={<ContactMailIcon />}
        />
    </Menu>
);
