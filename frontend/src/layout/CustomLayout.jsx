
import React, { useEffect, useState, useRef } from 'react';
import { Layout, useGetIdentity } from 'react-admin';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { CustomAppBar } from './CustomAppBar';

export const CustomLayout = (props) => {
    const { isLoading, identity } = useGetIdentity();
    const [menuKey, setMenuKey] = useState(0); // Key to force menu refresh
    const location = useLocation();
    const initialRenderRef = useRef(true);
    const previousPathRef = useRef(location.pathname);
    const previousIdentityRef = useRef(null);

    // Handle identity changes
    useEffect(() => {
        // Skip initial render
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            previousIdentityRef.current = identity;
            return;
        }

        // Check if identity has actually changed
        const identityChanged =
            (previousIdentityRef.current?.id !== identity?.id) ||
            (previousIdentityRef.current?.role !== identity?.role);

        if (identity && identityChanged) {
            // Update the reference
            previousIdentityRef.current = identity;

            // Increment the key to force re-render of the menu
            setMenuKey(prevKey => prevKey + 1);
            console.log('Layout refreshed due to identity change');
        }
    }, [identity]);

    // Handle path changes
    useEffect(() => {
        // Skip if this is the initial render
        if (initialRenderRef.current) {
            return;
        }

        // Only update if the path has actually changed
        if (previousPathRef.current !== location.pathname) {
            previousPathRef.current = location.pathname;
            setMenuKey(prevKey => prevKey + 1);
            console.log('Menu refreshed due to navigation to:', location.pathname);
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
