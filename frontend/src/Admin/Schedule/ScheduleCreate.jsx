import React from 'react';
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  required,
  useNotify,
  useRedirect
} from 'react-admin';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import TimeInput from '../../components/TimeInput';

const dayOptions = [
  { id: 'Monday', name: 'Monday' },
  { id: 'Tuesday', name: 'Tuesday' },
  { id: 'Wednesday', name: 'Wednesday' },
  { id: 'Thursday', name: 'Thursday' },
  { id: 'Friday', name: 'Friday' },
  { id: 'Saturday', name: 'Saturday' },
  { id: 'Sunday', name: 'Sunday' },
];

const roomOptions = [
  { id: '9', name: 'Grade 9' },
  { id: '10', name: 'Grade 10' },
];


const ScheduleCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const onSuccess = () => {
    notify('Schedule created successfully');
    redirect('list', 'schedules');
  };

  const onError = (error) => {
    notify(`Error: ${error.message}`, { type: 'error' });
  };

  return (
    <Create 
      title="Create Schedule" 
      redirect="list"
      mutationOptions={{ onSuccess, onError }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create Class Schedule
          </Typography>
          <SimpleForm>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ReferenceInput 
                  source="course_id" 
                  reference="course"
                  fullWidth
                >
                  <SelectInput 
                    optionText="Course_name" 
                    label="Course" 
                    validate={required()}
                    helperText="Select the course for this schedule"
                    fullWidth
                  />
                </ReferenceInput>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <SelectInput 
                  source="day_of_week" 
                  choices={dayOptions} 
                  validate={required()}
                  label="Day of Week"
                  helperText="Select the day for this class"
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimeInput
                  source="start_time"
                  label="Start Time"
                  helperText="Class start time (24-hour format)"
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TimeInput
                  source="end_time"
                  label="End Time"
                  helperText="Class end time (24-hour format)"
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12}>
                <SelectInput 
                  source="room_number" 
                  choices={roomOptions}
                  label="Grade"
                  validate={required()}
                  helperText="Select the grade for this class"
                  fullWidth
                />
              </Grid>
            </Grid>
          </SimpleForm>
        </CardContent>
      </Card>
    </Create>
  );
};

export default ScheduleCreate;
