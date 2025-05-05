import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  FunctionField,
  ExportButton,
  TopToolbar,
  useGetIdentity
} from 'react-admin';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Custom toolbar without filter button
const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

// Custom empty component
const Empty = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" align="center">
        No assessments found
      </Typography>
      <Typography variant="body2" align="center">
        There are no assessments available for your courses yet.
      </Typography>
    </CardContent>
  </Card>
);

// Assessment type icon selector
const AssessmentTypeIcon = ({ type }) => {
  switch (type) {
    case 'assignment':
      return <AssignmentIcon />;
    case 'quiz':
    case 'test':
      return <QuizIcon />;
    case 'exam':
      return <SchoolIcon />;
    default:
      return <AssignmentIcon />;
  }
};

// Status chip component
const StatusChip = ({ record }) => {
  // If there's no grade record at all
  if (!record.Grades || record.Grades.length === 0) {
    return (
      <Chip
        icon={<HourglassEmptyIcon />}
        label="Not Submitted"
        color="default"
        size="small"
      />
    );
  }

  const grade = record.Grades[0];
  
  // If submitted but not graded
  if (grade.submitted_at && !grade.graded_at) {
    return (
      <Chip
        icon={<PendingIcon />}
        label="Submitted - Pending Grade"
        color="primary"
        size="small"
      />
    );
  }
  
  // If graded
  if (grade.graded_at) {
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="Graded"
        color="success"
        size="small"
      />
    );
  }
  
  // Default case
  return (
    <Chip
      icon={<HourglassEmptyIcon />}
      label="Not Submitted"
      color="default"
      size="small"
    />
  );
};

// Score display with progress bar
const ScoreDisplay = ({ record }) => {
  if (!record.Grades || record.Grades.length === 0 || !record.Grades[0].score) {
    return <Typography variant="body2">-</Typography>;
  }
  
  const grade = record.Grades[0];
  const score = grade.score;
  const maxScore = record.max_score;
  const percentage = (score / maxScore) * 100;
  
  return (
    <Box sx={{ width: '100%', mr: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2">{score}/{maxScore}</Typography>
        <Typography variant="body2">{percentage.toFixed(1)}%</Typography>
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
          }
        }}
      />
    </Box>
  );
};

// Main list component
export const StudentAssessmentList = () => {
  const { identity } = useGetIdentity();
  const studentId = identity?.id;

  return (
    <List
      actions={<ListActions />}
      empty={<Empty />}
      sort={{ field: 'due_date', order: 'ASC' }}
      perPage={10}
      title="My Assessments"
    >
      <Datagrid
        bulkActionButtons={false}
        rowClick="show"
        sx={{
          '& .RaDatagrid-headerCell': {
            fontWeight: 'bold',
          },
          '& .RaDatagrid-row': {
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          },
        }}
      >
        <FunctionField
          label="Type"
          render={record => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentTypeIcon type={record.type} />
              <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                {record.type}
              </Typography>
            </Box>
          )}
        />
        <TextField source="title" label="Assessment" />
        <DateField source="due_date" label="Due Date" showTime />
        <FunctionField
          label="Status"
          render={record => <StatusChip record={record} />}
        />
        <FunctionField
          label="Score"
          render={record => <ScoreDisplay record={record} />}
        />
      </Datagrid>
    </List>
  );
};

export default StudentAssessmentList;
