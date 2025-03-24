import React from 'react';
import { Layout, useGetIdentity } from 'react-admin';
import { CircularProgress } from '@mui/material';
import { AdminMenu } from './menus/AdminMenu';
import { StudentMenu } from './menus/StudentMenu';
import { TeacherMenu } from './menus/TeacherMenu';
import { ParentMenu } from './menus/ParentMenu';
import { UserMenu } from './menus/UserMenu';
import { CustomAppBar } from './CustomAppBar';

export const CustomLayout = (props) => {
    const { identity, isLoading } = useGetIdentity();
    
    if (isLoading) {
        return <CircularProgress />;
    }

    const getMenuComponent = () => {
        if (!identity) return undefined;
        
        switch (identity.role) {
            case 'admin':
                return AdminMenu;
            case 'student':
                return StudentMenu;
            case 'teacher':
                return TeacherMenu;
            case 'parent':
                return ParentMenu;
            case 'user':
                return UserMenu;
            default:
                return undefined;
        }
    };

    return (
        <Layout 
            {...props} 
            appBar={CustomAppBar}
            menu={getMenuComponent()}
            className="flex flex-col h-screen"
        />
    );
};
