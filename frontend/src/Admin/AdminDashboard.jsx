import React from 'react';
import { Title, useGetIdentity } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, Paper } from '@mui/material';
import { School, People, MenuBook, Assignment, Announcement } from '@mui/icons-material';

export const AdminDashboard = () => {
    const { identity } = useGetIdentity();
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const stats = [
        { icon: <School fontSize="large" color="primary" />, title: 'Students', count: 568, link: '#/students' },
        { icon: <People fontSize="large" color="secondary" />, title: 'Teachers', count: 42, link: '#/teachers' },
        { icon: <MenuBook fontSize="large" style={{ color: '#ff9800' }} />, title: 'Courses', count: 36, link: '#/courses' },
        { icon: <Assignment fontSize="large" style={{ color: '#4caf50' }} />, title: 'Assignments', count: 215, link: '#/assignments' },
        { icon: <Announcement fontSize="large" style={{ color: '#f44336' }} />, title: 'Announcements', count: 8, link: '#/announcements' },
    ];

    return (
        <Box p={3}>
            <Title title="Admin Dashboard" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.fullName}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>School Overview</Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
                                        height: '100%'
                                    }}
                                    component="a"
                                    href={stat.link}
                                >
                                    {stat.icon}
                                    <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                                        {stat.count}
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
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
                            <Box>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    New teacher onboarded - Mathematics Department
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    Semester 2 schedule finalized
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    Annual budget review meeting scheduled
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    School maintenance scheduled for next weekend
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>System Notifications</Typography>
                            <Box>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    Database backup scheduled for tonight
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    New system update available
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    15 new user registrations pending approval
                                </Typography>
                                <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                                    Server maintenance scheduled for Sunday, 2 AM
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;