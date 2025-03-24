import React from 'react';
import { Title, useGetIdentity } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, LinearProgress } from '@mui/material';
import { MenuBook, Assignment, Assessment, Schedule, Announcement } from '@mui/icons-material';

export const StudentDashboard = () => {
    const { identity } = useGetIdentity();
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Course progress data
    const courses = [
        { name: 'Mathematics', progress: 65, grade: 'B+' },
        { name: 'Physics', progress: 78, grade: 'A-' },
        { name: 'Chemistry', progress: 45, grade: 'C+' },
        { name: 'Biology', progress: 82, grade: 'A' },
        { name: 'English', progress: 70, grade: 'B' },
    ];

    // Upcoming assignments
    const upcomingAssignments = [
        { subject: 'Mathematics', title: 'Logarithm Problems', deadline: 'Tomorrow' },
        { subject: 'Physics', title: 'Lab Report', deadline: 'Friday' },
        { subject: 'Chemistry', title: 'Periodic Table Quiz', deadline: 'Wednesday' },
        { subject: 'Biology', title: 'Cell Structure Diagram', deadline: 'Next Monday' },
    ];

    // Today's timetable
    const todaysTimetable = [
        { time: '08:00 - 08:45', subject: 'Mathematics', room: 'Room 15' },
        { time: '09:00 - 09:45', subject: 'Physics', room: 'Lab 3' },
        { time: '10:00 - 10:45', subject: 'Chemistry', room: 'Lab 2' },
        { time: '11:15 - 12:00', subject: 'English', room: 'Room 8' },
        { time: '12:45 - 13:30', subject: 'Biology', room: 'Lab 1' },
    ];

    return (
        <Box p={3}>
            <Title title="Student Dashboard" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.fullName}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            <Box mb={3}>
                <Typography variant="h5" gutterBottom>Class: {identity?.class || 'Grade 10 B'}</Typography>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Schedule color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Today's Timetable</Typography>
                            </Box>
                            <List>
                                {todaysTimetable.map((period, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1">{period.subject}</Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {period.time}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={period.room}
                                            />
                                        </ListItem>
                                        {index < todaysTimetable.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Assignment color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Upcoming Assignments</Typography>
                            </Box>
                            <List>
                                {upcomingAssignments.map((assignment, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body1">{assignment.title}</Typography>
                                                        <Typography 
                                                            variant="body2" 
                                                            color={assignment.deadline === 'Tomorrow' ? 'error' : 'textSecondary'}
                                                        >
                                                            Due: {assignment.deadline}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={assignment.subject}
                                            />
                                        </ListItem>
                                        {index < upcomingAssignments.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <MenuBook color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Course Progress</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                {courses.map((course, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box mb={1}>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body1">{course.name}</Typography>
                                                <Typography variant="body2">Grade: {course.grade}</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={course.progress} 
                                                color={
                                                    course.progress >= 70 ? "success" : 
                                                    course.progress >= 50 ? "warning" : "error"
                                                }
                                                sx={{ height: 8, borderRadius: 5 }}
                                            />
                                            <Typography variant="body2" align="right" color="textSecondary">
                                                {course.progress}% Complete
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentDashboard;