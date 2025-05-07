
import React, { useEffect, useState, useRef } from 'react';
import { Layout, useGetIdentity, useRefresh } from 'react-admin';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { CustomAppBar } from './CustomAppBar';

export const CustomLayout = (props) => {
    const { isLoading, identity } = useGetIdentity();
    const [menuKey, setMenuKey] = useState(0); // Key to force menu refresh
    const location = useLocation();
    const refresh = useRefresh();
    const initialRenderRef = useRef(true);
    const previousPathRef = useRef(location.pathname);

    // Refresh only when identity changes, but not on initial render
    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            return;
        }

        if (identity) {
            // Increment the key to force re-render of the menu
            setMenuKey(prevKey => prevKey + 1);
            console.log('Layout refreshed due to identity change');
        }
    }, [identity]);

    // Refresh menu when URL path changes but don't refresh data
    // Also skip the initial render and only update when path actually changes
    useEffect(() => {
        if (initialRenderRef.current) {
            return;
        }

        if (previousPathRef.current !== location.pathname) {
            previousPathRef.current = location.pathname;
            setMenuKey(prevKey => prevKey + 1);
            console.log('Menu refreshed due to navigation');
        }
    }, [location.pathname]);

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Layout
            {...props}
            appBar={CustomAppBar}
            className="flex flex-col h-screen"
            menu={props.menu ? React.cloneElement(props.menu, { key: `menu-${menuKey}` }) : undefined}
        />
    );
};
