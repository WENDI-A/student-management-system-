import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  DeleteButton,
  FunctionField,
  CreateButton,
  ExportButton,
  TopToolbar
} from 'react-admin';
import { Card, CardContent, Box } from '@mui/material';


const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

// Format time from HH:MM:SS to HH:MM AM/PM
const formatTime = (time) => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  
  return `${formattedHour}:${minutes} ${ampm}`;
};

// Format room number to display as grade
const formatGrade = (room) => {
  if (room === '9') return 'Grade 9';
  if (room === '10') return 'Grade 10';
  return room;
};

const ScheduleList = () => {
  return (
    <Box>
      <Card>
        <CardContent>
          <List 
            actions={<ListActions />}
            sort={{ field: 'day_of_week', order: 'ASC' }}
          >
            <Datagrid>
              <ReferenceField source="course_id" reference="course" label="Course">
                <TextField source="Course_name" />
              </ReferenceField>
              <TextField source="day_of_week" label="Day" />
              <FunctionField
                label="Start Time"
                render={record => formatTime(record.start_time)}
              />
              <FunctionField
                label="End Time"
                render={record => formatTime(record.end_time)}
              />
              <FunctionField
                label="Grade"
                render={record => formatGrade(record.room_number)}
              />
              <EditButton />
              <DeleteButton />
            </Datagrid>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScheduleList;
