import React from 'react';
import { Menu } from 'react-admin';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    AccountCircle as AccountCircleIcon,
    ListAlt as ListAltIcon,
    Settings as SettingsIcon,
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
            to="/classes"
            primaryText="Classes"
            leftIcon={<MenuBookIcon />}
        />
        <Menu.Item
            to="/courses"
            primaryText="Courses"
            leftIcon={<ListAltIcon />}
        />
        <Menu.Item
            to="/settings"
            primaryText="Settings"
            leftIcon={<SettingsIcon />}
        />
    </Menu>
);
