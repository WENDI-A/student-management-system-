
import React, { useEffect, useState } from 'react';
import { Layout, useGetIdentity, useGetPermissions, useRefresh } from 'react-admin';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { CustomAppBar } from './CustomAppBar';

export const CustomLayout = (props) => {
    const { isLoading, identity } = useGetIdentity();
    const [menuKey, setMenuKey] = useState(0); // Key to force menu refresh
    const location = useLocation();
    const refresh = useRefresh();
    
    // Refresh sidebar menu when URL changes or identity changes
    useEffect(() => {
        // Increment the key to force re-render of the menu
        setMenuKey(prevKey => prevKey + 1);
        
        // Optional: refresh data if needed
        refresh();
        
        console.log('Sidebar menu refreshed due to navigation or identity change');
    }, [location.pathname, identity, refresh]);
    
    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Layout 
            {...props} 
            appBar={CustomAppBar}
            className="flex flex-col h-screen"
            key={`layout-${menuKey}`}
            menu={props.menu ? React.cloneElement(props.menu, { key: `menu-${menuKey}` }) : undefined}
        />
    );
};
