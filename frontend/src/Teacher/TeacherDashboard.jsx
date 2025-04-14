
import React, { useState, useEffect } from 'react';
import { Title } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { Assignment, MenuBook, Group, Schedule, Assessment } from '@mui/icons-material';
import dataProvider from '../hooks/dataProvider';

export const TeacherDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [dashboardData, setDashboardData] = useState({
        teacherName: '',
        currentDate: new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }),
        stats: {
            students: 0,
            classes: 0,
            assignments: 0,
            exams: 0
        },
        todaySchedule: []
    });
    
    // Define stats with mapping to dashboardData properties
    const stats = [
        { title: 'My Students', link: '#/courseEnrollments', dataKey: 'students', icon: <Group fontSize="large" color="primary" /> },
        { title: 'My Classes', dataKey: 'classes', icon: <MenuBook fontSize="large" color="secondary" /> },
        { title: 'Assignments', link: '#/Assessment', dataKey: 'assignments', icon: <Assignment fontSize="large" style={{ color: '#4caf50' }} /> },
        { title: 'Exams', link: '#/Assessment', dataKey: 'exams', icon: <Assessment fontSize="large" style={{ color: '#f44336' }} /> },
    ];

    useEffect(() => {
        // Get user name from JWT token
        const getUserFromToken = () => {
            try {
                const auth = JSON.parse(localStorage.getItem('auth'));
                if (auth) {
                    const decodedToken = jwtDecode(auth.token);
                    setUserName(decodedToken.name || decodedToken.fullName || decodedToken.username || '');
                }
            } catch (error) {
                console.error('Error decoding JWT token:', error);
            }
        };

        getUserFromToken();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await dataProvider.getDashboard('TeacherDashboard');
                
                if (response && response.data) {
                    // Update the dashboard data with the response
                    setDashboardData({
                        teacherName: response.data.teacherName || userName || '',
                        currentDate: response.data.currentDate || new Date().toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        }),
                        stats: response.data.stats || {
                            students: 0,
                            classes: 0,
                            assignments: 0,
                            exams: 0
                        },
                        todaySchedule: response.data.todaySchedule || []
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
                // Set default values if there's an error
                setDashboardData({
                    teacherName: userName || '',
                    currentDate: new Date().toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    stats: {
                        students: 0,
                        classes: 0,
                        assignments: 0,
                        exams: 0
                    },
                    todaySchedule: []
                });
            }
        };

        fetchDashboardData();
    }, [userName]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Title title="Teacher Dashboard" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {userName || dashboardData.teacherName || "Teacher"} </Typography>
                <Typography variant="subtitle1" color="textSecondary">{dashboardData.currentDate}</Typography>
            </Box>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Teaching Overview</Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: stat.link ? 'pointer' : 'default',
                                        '&:hover': stat.link ? { bgcolor: 'rgba(0, 0, 0, 0.05)' } : {},
                                        height: '100%'
                                    }}
                                    component={stat.link ? "a" : "div"}
                                    href={stat.link}
                                >
                                    {stat.icon}
                                    <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                                        {dashboardData.stats[stat.dataKey]}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" align="center">
                                        {stat.title}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
            
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Schedule color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">Today's Schedule</Typography>
                    </Box>
                    {dashboardData.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                        <List>
                            {dashboardData.todaySchedule.map((schedule, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body1">{schedule.class}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {schedule.time}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={`${schedule.grade} • ${schedule.room}`}
                                        />
                                    </ListItem>
                                    {index < dashboardData.todaySchedule.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                            No classes scheduled for today
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default TeacherDashboard;
