import React from 'react';
import { Title, useGetIdentity } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, Avatar, Tabs, Tab } from '@mui/material';
import { Person, Assignment, Assessment, EventNote, Announcement, School } from '@mui/icons-material';
import { useState } from 'react';

export const ParentDashboard = () => {
    const { identity } = useGetIdentity();
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const [selectedChild, setSelectedChild] = useState(0);

    // Mock data for children
    const children = identity?.children || [
        { id: 1, name: 'Alex Smith', class: 'Grade 10 B', attendance: '96%' },
    ];

    // Academic performance data
    const academicPerformance = [
        { subject: 'Mathematics', midterm: 'B+', final: 'Pending', teacher: 'Mr. Johnson' },
        { subject: 'Physics', midterm: 'A-', final: 'Pending', teacher: 'Ms. Williams' },
        { subject: 'Chemistry', midterm: 'C+', final: 'Pending', teacher: 'Mr. Davis' },
        { subject: 'Biology', midterm: 'A', final: 'Pending', teacher: 'Mrs. Miller' },
        { subject: 'English', midterm: 'B', final: 'Pending', teacher: 'Mr. Wilson' },
    ];

    // Upcoming events
    const upcomingEvents = [
        { title: 'Parent-Teacher Meeting', date: 'March 15, 2023', time: '4:00 PM - 6:00 PM' },
        { title: 'Science Fair', date: 'March 22, 2023', time: '9:00 AM - 3:00 PM' },
        { title: 'School Sports Day', date: 'April 5, 2023', time: 'All Day' },
        { title: 'End of Term Ceremony', date: 'April 28, 2023', time: '10:00 AM - 12:00 PM' },
    ];

    // Recent announcements
    const announcements = [
        { title: 'School Closure - Staff Development Day', date: 'March 10, 2023' },
        { title: 'COVID-19 Safety Protocols Update', date: 'March 5, 2023' },
        { title: 'Scholarship Applications Now Open', date: 'March 1, 2023' },
    ];

    return (
        <Box p={3}>
            <Title title="Parent Dashboard" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.fullName}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            {children.length > 1 ? (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={selectedChild} onChange={(e, newValue) => setSelectedChild(newValue)}>
                        {children.map((child, index) => (
                            <Tab label={child.name} key={index} />
                        ))}
                    </Tabs>
                </Box>
            ) : null}
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <School />
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{children[selectedChild]?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {children[selectedChild]?.class} • Attendance: {children[selectedChild]?.attendance}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Assessment color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Academic Performance</Typography>
                            </Box>
                            <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Subject</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Midterm</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Final</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {academicPerformance.map((subject, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{subject.subject}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{subject.midterm}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{subject.final}</td>
                                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{subject.teacher}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <EventNote color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Upcoming Events</Typography>
                            </Box>
                            <List>
                                {upcomingEvents.map((event, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={event.title}
                                                secondary={
                                                    <Typography variant="body2" color="textSecondary">
                                                        {event.date} • {event.time}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < upcomingEvents.length - 1 && <Divider />}
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
                                <Announcement color="error" sx={{ mr: 1 }} />
                                <Typography variant="h6">Recent Announcements</Typography>
                            </Box>
                            <List>
                                {announcements.map((announcement, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={announcement.title}
                                                secondary={`Announced on: ${announcement.date}`}
                                            />
                                        </ListItem>
                                        {index < announcements.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentDashboard;