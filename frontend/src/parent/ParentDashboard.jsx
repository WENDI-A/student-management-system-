import React, { useState, useEffect } from 'react';
import { Title, useGetIdentity, Loading, Error } from 'react-admin';
import { Box, Card, CardContent, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, Avatar, Tabs, Tab } from '@mui/material';
import { Person, Assignment, Assessment, School } from '@mui/icons-material';
import dataProvider from '../hooks/dataProvider';

export const ParentDashboard = () => {
    const { identity } = useGetIdentity();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [data, setData] = useState({ students: [], upcomingAssessments: [] });
    const [selectedChild, setSelectedChild] = useState(0);

    const currentDate = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Use the getDashboard function directly from the imported dataProvider
                const response = await dataProvider.getDashboard('ParentDashboard');
                setData(response.data || { students: [], upcomingAssessments: [] });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching parent dashboard data:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Loading />;
    if (error) return <Error error={error} />;

    // Safely extract data with fallbacks
    const students = data?.students || [];
    const upcomingAssessments = data?.upcomingAssessments || [];

    // Safety check for selectedChild index
    if (selectedChild >= students.length && students.length > 0) {
        setSelectedChild(0);
    }

    const currentStudent = students[selectedChild] || {};

    return (
        <Box p={3}>
            <Title title="Parent Dashboard" />
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Welcome, {identity?.fullName || 'Parent'}</Typography>
                <Typography variant="subtitle1" color="textSecondary">{currentDate}</Typography>
            </Box>
            
            {students.length > 1 ? (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={selectedChild} onChange={(e, newValue) => setSelectedChild(newValue)}>
                        {students.map((student, index) => (
                            <Tab label={`${student.firstName || ''} ${student.lastName || ''}`} key={index} />
                        ))}
                    </Tabs>
                </Box>
            ) : null}
            
            {students.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <School />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">
                                    {currentStudent.firstName || ''} {currentStudent.lastName || ''}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Grade {currentStudent.grade || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Assessment color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Academic Performance</Typography>
                            </Box>
                            {students.length > 0 && currentStudent.grades && currentStudent.grades.length > 0 ? (
                                <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Course</th>
                                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Assessment</th>
                                                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Score</th>
                                                {/* <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Grade</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentStudent.grades.map((grade, index) => (
                                                <tr key={index}>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                                        {grade.course?.Course_name || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                                        {grade.assessment?.title || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                                        {grade.score || 0}/{grade.assessment?.max_score || 0}
                                                    </td>
                                                    {/* <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                                                        {grade.letterGrade || 'N/A'}
                                                    </td> */}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No grades available at this time.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Assignment color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Upcoming Assessments</Typography>
                            </Box>
                            {upcomingAssessments.length > 0 ? (
                                <List>
                                    {upcomingAssessments.map((assessment, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={assessment.title || 'Untitled Assessment'}
                                                    secondary={
                                                        <Typography variant="body2" color="textSecondary">
                                                            {assessment.Course?.Course_name || 'N/A'} • Due: {assessment.due_date ? new Date(assessment.due_date).toLocaleDateString() : 'N/A'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                            {index < upcomingAssessments.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No upcoming assessments at this time.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <School color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Enrolled Courses</Typography>
                            </Box>
                            {students.length > 0 && currentStudent.courses && currentStudent.courses.length > 0 ? (
                                <Grid container spacing={2}>
                                    {currentStudent.courses.map((course, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Paper elevation={2} sx={{ p: 2 }}>
                                                <Typography variant="subtitle1">{course.Course_name || 'Untitled Course'}</Typography>
                                                <Typography variant="body2" color="textSecondary">Code: {course.Course_code || 'N/A'}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    No courses available at this time.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ParentDashboard;
