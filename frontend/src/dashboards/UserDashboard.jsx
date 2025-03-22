import React from 'react';
import { Title, useGetIdentity } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { Announcement, EventNote, Info, School, CalendarMonth } from '@mui/icons-material';

export const UserDashboard = () => {
    const { identity } = useGetIdentity();
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // School information
    const schoolInfo = {
        name: 'HU Model Community School',
        address: '123 Education Street, Academic City',
        phone: '+1 (555) 123-4567',
        email: 'info@humcs.edu',
        website: 'www.humcs.edu'
    };

    // Upcoming events
    const upcomingEvents = [
        { title: 'School Opening Day', date: 'March 15, 2023', time: '8:00 AM - 2:00 PM' },
        { title: 'Science Fair', date: 'March 22, 2023', time: '9:00 AM - 3:00 PM' },
        { title: 'School Sports Day', date: 'April 5, 2023', time: 'All Day' },
        { title: 'End of Term Ceremony', date: 'April 28, 2023', time: '10:00 AM - 12:00 PM' },
    ];

    // School announcements
    const announcements = [
        { 
            title: 'School Closure - Staff Development Day', 
            date: 'March 10, 2023', 
            content: 'The school will be closed for students on March 10 as teachers will be attending a professional development workshop.' 
        },
        { 
            title: 'COVID-19 Safety Protocols Update', 
            date: 'March 5, 2023', 
            content: 'Updated safety protocols will be implemented starting next week. All visitors must check in at the front office.' 
        },
        { 
            title: 'New Library Hours', 
            date: 'March 1, 2023', 
            content: 'The school library will now be open from 8:00 AM to 5:00 PM on weekdays and 10:00 AM to 2:00 PM on Saturdays.' 
        },
        { 
            title: 'Scholarship Applications Now Open', 
            date: 'February 25, 2023', 
            content: 'Applications for the annual merit scholarships are now being accepted. Deadline is April 15, 2023.' 
        },
    ];

    // Academic calendar highlights
    const calendarHighlights = [
        { event: 'First Day of School', date: 'September 5, 2022' },
        { event: 'Fall Break', date: 'October 10-14, 2022' },
        { event: 'Winter Break', date: 'December 19, 2022 - January 2, 2023' },
        { event: 'Spring Break', date: 'March 13-17, 2023' },
        { event: 'Last Day of School', date: 'June 9, 2023' },
    ];

    return (
        <Box p={3}>
            <Title title="School Information Portal" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.fullName || 'Guest'}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <School color="primary" sx={{ mr: 1, fontSize: 28 }} />
                        <Typography variant="h5">School Information</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>{schoolInfo.name}</Typography>
                                <Typography variant="body1" paragraph>
                                    Address: {schoolInfo.address}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Phone: {schoolInfo.phone}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    Email: {schoolInfo.email}
                                </Typography>
                                <Typography variant="body1">
                                    Website: {schoolInfo.website}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <CalendarMonth color="secondary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Academic Calendar Highlights</Typography>
                                </Box>
                                <List dense>
                                    {calendarHighlights.map((item, index) => (
                                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                            <ListItemText
                                                primary={item.event}
                                                secondary={item.date}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <EventNote color="primary" sx={{ mr: 1 }} />
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
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Info color="error" sx={{ mr: 1 }} />
                                <Typography variant="h6">Important Information</Typography>
                            </Box>
                            <Typography variant="body1" paragraph>
                                School hours are from 8:00 AM to 3:30 PM, Monday through Friday.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Visitors must sign in at the front office and wear a visitor badge at all times.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                The school cafeteria is open from 7:30 AM to 1:30 PM daily.
                            </Typography>
                            <Typography variant="body1">
                                For emergency closures or delays, please check the school website or call the main office.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Announcement color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">School Announcements</Typography>
                            </Box>
                            <List>
                                {announcements.map((announcement, index) => (
                                    <Paper 
                                        elevation={1} 
                                        sx={{ mb: 2, p: 2, bgcolor: 'background.default' }}
                                        key={index}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            {announcement.title}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                            Posted on: {announcement.date}
                                        </Typography>
                                        <Typography variant="body2">
                                            {announcement.content}
                                        </Typography>
                                    </Paper>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserDashboard;
