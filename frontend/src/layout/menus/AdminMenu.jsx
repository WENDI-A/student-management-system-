import React from 'react';
import { Menu } from 'react-admin';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    AccountCircle as AccountCircleIcon,
    ListAlt as ListAltIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon, // Import Notifications icon
} from '@mui/icons-material';

export const AdminMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <Menu.Item
            to="/students"
            primaryText="Students"
            leftIcon={<SchoolIcon />}
        />
        <Menu.Item
            to="/teachers"
            primaryText="Teachers"
            leftIcon={<PeopleIcon />}
        />
        <Menu.Item
            to="/parents"
            primaryText="Parents"
            leftIcon={<AccountCircleIcon />}
        />
        <Menu.Item
            to="/course"
            primaryText="Courses"
            leftIcon={<MenuBookIcon />}
        />       
         <Menu.Item
            to="/notfication"
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
