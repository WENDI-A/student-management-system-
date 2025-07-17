import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ReferenceField,
  NumberField,
  RichTextField,
  useRecordContext,
  TopToolbar,
  Button,
  useGetIdentity
} from 'react-admin';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import FeedbackIcon from '@mui/icons-material/Feedback';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from '../../config/config';

// Custom actions for the show view
const AssessmentShowActions = () => {
  const record = useRecordContext();
  
  // Check if the assessment has a submission
  const hasSubmission = record?.Grades && 
                        record.Grades.length > 0 && 
                        record.Grades[0].submitted_at;
  
  // Check if the due date has passed
  const dueDatePassed = record?.due_date && new Date(record.due_date) < new Date();
  
  return (
    <TopToolbar>
      {!hasSubmission && !dueDatePassed && (
        <Button
          label="Submit Assignment"
          onClick={() => console.log('Submit clicked for', record.id)}
          startIcon={<UploadFileIcon />}
        />
      )}
      {record?.attachment_url && (
        <Button
          label="Download Instructions"
          onClick={() => window.open(record.attachment_url, '_blank')}
          startIcon={<DownloadIcon />}
        />
      )}
    </TopToolbar>
  );
};

// Assessment type display
const AssessmentType = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'assignment': return '#4caf50';
      case 'quiz': return '#2196f3';
      case 'test': return '#ff9800';
      case 'exam': return '#f44336';
      case 'project': return '#9c27b0';
      default: return '#757575';
    }
  };
  
  return (
    <Chip 
      label={record.type.toUpperCase()} 
      sx={{ 
        backgroundColor: getTypeColor(record.type),
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );
};

// Due date display with status
const DueDateDisplay = () => {
  const record = useRecordContext();
  if (!record || !record.due_date) return null;
  
  const dueDate = new Date(record.due_date);
  const now = new Date();
  const isPastDue = dueDate < now;
  
  // Calculate days remaining or overdue
  const diffTime = Math.abs(dueDate - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
      <CalendarTodayIcon sx={{ mr: 1, color: isPastDue ? '#f44336' : '#4caf50' }} />
      <Box>
        <Typography variant="body2">
          Due: <DateField source="due_date" showTime />
        </Typography>
        <Typography variant="caption" sx={{ color: isPastDue ? '#f44336' : '#4caf50' }}>
          {isPastDue 
            ? `${diffDays} day${diffDays !== 1 ? 's' : ''} overdue` 
            : `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`}
        </Typography>
      </Box>
    </Box>
  );
};

// Grade display component
const GradeDisplay = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  // If there's no grade record
  if (!record.Grades || record.Grades.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          Grade
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Not graded yet
        </Typography>
      </Paper>
    );
  }
  
  const grade = record.Grades[0];
  
  // If not submitted yet
  if (!grade.submitted_at) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle1" gutterBottom>
          Grade
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Not submitted yet
        </Typography>
      </Paper>
    );
  }
  
  // If submitted but not graded
  if (grade.submitted_at && !grade.graded_at) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="subtitle1" gutterBottom>
          Submission Status
        </Typography>
        <Typography variant="body2">
          Submitted on <DateField record={grade} source="submitted_at" showTime />
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Waiting for grading
        </Typography>
      </Paper>
    );
  }
  
  // If graded
  if (grade.score !== null) {
    const percentage = (grade.score / record.max_score) * 100;
    
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: '#e8f5e9' }}>
        <Typography variant="subtitle1" gutterBottom>
          Grade
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GradeIcon sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="h6">
            {grade.score} / {record.max_score} ({percentage.toFixed(1)}%)
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ 
            height: 8, 
            borderRadius: 5,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: percentage >= 70 ? '#4caf50' : percentage >= 60 ? '#ff9800' : '#f44336',
            },
            mb: 2
          }}
        />
        <Typography variant="body2">
          Graded on <DateField record={grade} source="graded_at" showTime />
        </Typography>
        {grade.feedback && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
              <FeedbackIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
              Feedback
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, pl: 2, borderLeft: '2px solid #4caf50' }}>
              {grade.feedback}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }
  
  return null;
};

// Main show component
export const StudentAssessmentDetail = () => {
  const record = useRecordContext();
  console.log('StudentAssessmentDetail record:', record);
  const { identity } = useGetIdentity();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  if (!record) {
    console.log('No record found in StudentAssessmentDetail');
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Unable to load exam details. You may not be enrolled in this course or do not have access.
        </Typography>
      </Box>
    );
  }

  useEffect(() => {
    if (record?.id) {
      console.log('Fetching questions for assessment id:', record.id);
      const fetchQuestions = async () => {
        try {
          const options = await GET_HEADER({ isJson: true });
          console.log('GET_HEADER options:', options);
          const res = await axios.get(
            API_ENDPOINT_FUNCTION(`/questions/assessment/${record.id}`),
            options
          );
          console.log('Questions fetch response:', res);
          if (res.data.success) {
            setQuestions(res.data.data);
            console.log('Questions set:', res.data.data);
          } else {
            console.log('Questions fetch not successful:', res.data);
          }
        } catch (err) {
          setQuestions([]);
          console.log('Error fetching questions:', err);
        }
      };
      fetchQuestions();
    } else {
      console.log('No record.id found in useEffect');
    }
  }, [record?.id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);
    try {
      const options = await GET_HEADER({ isJson: true });
      await axios.post(
        API_ENDPOINT_FUNCTION('/studentAssessments/student/submit-answers'),
        {
          assessment_id: record.id,
          answers: questions.map(q => ({ question_id: q.id, answer: answers[q.id] || '' }))
        },
        options
      );
      setSubmitSuccess('Answers submitted successfully!');
    } catch (err) {
      setSubmitError('Failed to submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Show 
      actions={<AssessmentShowActions />}
      title={<Typography variant="h5"><AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Assessment Details</Typography>}
    >
      <SimpleShowLayout>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4"><TextField source="title" /></Typography>
            <AssessmentType />
          </Box>
          <Box sx={{ mt: 1 }}>
            {record && record.course_id ? (
              <ReferenceField source="course_id" reference="courses" link={false}>
                <Typography variant="subtitle1" color="primary">
                  <TextField source="Course_name" /> (<TextField source="Course_code" />)
                </Typography>
              </ReferenceField>
            ) : (
              <Typography variant="subtitle1" color="error">
                Course information not available
              </Typography>
            )}
          </Box>
          <DueDateDisplay />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>Description</Typography>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <RichTextField source="description" />
          </CardContent>
        </Card>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <List dense>
                <ListItem>
                  <ListItemIcon><GradeIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Maximum Score" 
                    secondary={<NumberField source="max_score" />} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Weight in Final Grade" 
                    secondary={<Typography>{record => `${record.weight * 100}%`}</Typography>} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <GradeDisplay />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        {/* Exam Questions Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Exam Questions</Typography>
          {questions.length === 0 ? (
            <Typography>No questions available for this exam.</Typography>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <List>
                {questions.map((q, idx) => {
                  console.log('Rendering question:', q);
                  return (
                    <ListItem key={q.id} alignItems="flex-start" divider>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1">{idx + 1}. {q.question_text}</Typography>
                        {q.type === 'mcq' && Array.isArray(q.options) ? (
                          <Box sx={{ mt: 1 }}>
                            {q.options.map((opt, i) => (
                              <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={() => handleAnswerChange(q.id, opt)}
                                  disabled={submitting}
                                />
                                <Typography sx={{ ml: 1 }}>{opt}</Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              style={{ width: '100%', padding: 8 }}
                              disabled={submitting}
                            />
                          </Box>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
              {submitError && <Typography color="error" sx={{ mt: 2 }}>{submitError}</Typography>}
              {submitSuccess && <Typography color="success.main" sx={{ mt: 2 }}>{submitSuccess}</Typography>}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={<UploadFileIcon />}
                >
                  {submitting ? 'Submitting...' : 'Submit Answers'}
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </SimpleShowLayout>
    </Show>
  );
};

export default StudentAssessmentDetail;