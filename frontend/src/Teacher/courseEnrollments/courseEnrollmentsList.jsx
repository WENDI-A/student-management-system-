import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  CircularProgress, 
  Alert, 
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import dataProvider from '../../hooks/dataProvider';

const PendingEnrollments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);

  useEffect(() => {
    const fetchPendingEnrollments = async () => {
      try {
        setLoading(true);
        const response = await dataProvider.getList('courseEnrollments');
        
        if (response.data) {
          console.log('Enrollment data:', response.data);
          setEnrollmentData(response.data);
        } else {
          setError('Failed to fetch enrollment data');
        }
      } catch (err) {
        console.error('Error fetching pending enrollments:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEnrollments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!enrollmentData || !enrollmentData.courses || enrollmentData.courses.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        No enrollments found for your courses.
      </Alert>
    );
  }

  const getAvatarColor = (courseId) => {
    const hash = courseId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
  };
  const getCourseInitial = (courseName) => {
    return courseName ? courseName.charAt(0).toUpperCase() : 'C';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Course Enrollments
      </Typography>

      <Grid container spacing={3}>
        {enrollmentData.courses.map((course) => (
          <Grid item xs={12} key={course.courseId}>
            <Card elevation={2}>
              <CardHeader
                avatar={
                  <Avatar 
                    sx={{ bgcolor: getAvatarColor(course.courseId) }}
                    aria-label={course.courseName}
                  >
                    {getCourseInitial(course.courseName)}
                  </Avatar>
                }
                title={
                  <Typography variant="h6">
                    {course.courseName}
                  </Typography>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <ClassIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Course ID: {course.courseId}
                    </Typography>
                    <Chip 
                      label={`${course.totalPending} Students`} 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {course.pendingStudents.map((student) => (
                    <React.Fragment key={student.enrollmentId}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {student.studentName}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={student.status} 
                                color={student.status === 'pending' ? 'warning' : (student.status === 'approved' ? 'success' : 'error')} 
                              />
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    Student ID: {student.studentId}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    Grade: {student.grade}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Email: {student.email}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PendingEnrollments;