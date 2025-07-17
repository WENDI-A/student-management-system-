import React, { useState, useEffect } from 'react';
import { Title, useGetIdentity, useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemText, Divider, CircularProgress, Tabs, Tab } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../config/config';
import StudentAssessmentList from './studentAssessments/AssessmentList';

// Days of the week for tab navigation
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const StudentDashboard = () => {
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [currentDay, setCurrentDay] = useState(0); // Default to Monday (index 0)
    
    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Get the current day of the week (0 = Monday, 4 = Friday)
    useEffect(() => {
        const today = new Date().getDay();
        // Convert Sunday (0) to Monday (0) based system
        const adjustedDay = today === 0 ? 6 : today - 1;
        // Only set if it's a weekday (Monday-Friday)
        if (adjustedDay >= 0 && adjustedDay <= 4) {
            setCurrentDay(adjustedDay);
        }
    }, []);

    // Fetch schedules based on student grade
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                
                // Use the config functions to get the API endpoint and headers
                const endpoint = API_ENDPOINT_FUNCTION('/schedules/student');
                const options = await GET_HEADER({ isJson: true });
                
                const response = await axios.get(endpoint, {
                    headers: options.headers
                });
                
                if (response.data.success) {
                    setSchedules(response.data.data);
                } else {
                    notify('Failed to load schedules', 'error');
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
                notify('Error loading your schedule. Please try again later.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [notify]);

    // Filter schedules by the selected day
    const filteredSchedules = schedules.filter(
        schedule => schedule.day_of_week === DAYS_OF_WEEK[currentDay]
    );

    // Sort schedules by start time
    const sortedSchedules = [...filteredSchedules].sort((a, b) => {
        return new Date('1970/01/01 ' + a.start_time) - new Date('1970/01/01 ' + b.start_time);
    });

    // Handle tab change
    const handleDayChange = (event, newValue) => {
        setCurrentDay(newValue);
    };

    // Format time from 24-hour to 12-hour format
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    return (
        <Box p={3}>
            <Title title="Student Schedule" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.firstName}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Schedule color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">My Weekly Schedule</Typography>
                    </Box>

                    <Tabs 
                        value={currentDay} 
                        onChange={handleDayChange} 
                        variant="fullWidth" 
                        indicatorColor="primary"
                        textColor="primary"
                        sx={{ mb: 2 }}
                    >
                        {DAYS_OF_WEEK.map((day, index) => (
                            <Tab key={day} label={day} value={index} />
                        ))}
                    </Tabs>

                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : sortedSchedules.length > 0 ? (
                        <List>
                            {sortedSchedules.map((schedule, index) => (
                                <React.Fragment key={schedule.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body1">
                                                        {schedule.course?.Course_name || 'Unknown Course'}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2">
                                                        Course Code: {schedule.course?.Course_code || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Room: {schedule.room_number || 'TBA'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < sortedSchedules.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box p={2} textAlign="center">
                            <Typography variant="body1" color="textSecondary">
                                No classes scheduled for {DAYS_OF_WEEK[currentDay]}.
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Exam Dashboard Section */}
            <Box mt={4}>
                <Typography variant="h5" gutterBottom>Exam Dashboard</Typography>
                <StudentAssessmentList />
            </Box>
        </Box>
    );
};

export default StudentDashboard;
