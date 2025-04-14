import { useEffect, useState } from 'react';
import {
  useNotify,
  useDataProvider,
} from 'react-admin';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,  
  ToggleButton, 
  ToggleButtonGroup,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import moment from 'moment';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', icon: <CheckCircleIcon color="success" /> },
  { value: 'absent', label: 'Absent', icon: <CancelIcon color="error" /> },
  { value: 'late', label: 'Late', icon: <AccessTimeIcon color="warning" /> },
  { value: 'excused', label: 'Excused', icon: <CheckCircleIcon color="info" /> }
];

// Function to get status icon and label
const getStatusDisplay = (status) => {
  const statusOption = STATUS_OPTIONS.find(option => option.value === status);
  return statusOption ? (
    <Tooltip title={statusOption.label}>
      <Box display="flex" alignItems="center" gap={1}>
        {statusOption.icon}
        <Typography variant="body2">{statusOption.label}</Typography>
      </Box>
    </Tooltip>
  ) : (
    <Typography variant="body2" color="text.secondary">Not Set</Typography>
  );
};

// Function to generate week options
const getWeekOptions = () => {
  const currentDate = moment();
  const currentWeek = currentDate.week();
  const currentYear = currentDate.year();
  
  // Get semester start and end dates
  const semesterStart = moment().month(0).startOf('month'); // January
  const semesterEnd = moment().month(11).endOf('month'); // December
  
  const weeks = [];
  let weekIterator = semesterStart.clone();
  
  while (weekIterator.isBefore(semesterEnd)) {
    const weekNum = weekIterator.week();
    const yearNum = weekIterator.year();
    
    const weekStart = weekIterator.clone().startOf('week').add(1, 'days');
    const weekEnd = weekIterator.clone().endOf('week').subtract(1, 'days');
    
    weeks.push({
      week: weekNum,
      year: yearNum,
      label: `Week ${weekNum} (${weekStart.format('MMM D')} - ${weekEnd.format('MMM D')})`,
      isCurrent: weekNum === currentWeek && yearNum === currentYear
    });
    
    weekIterator.add(1, 'week');
  }
  
  return weeks;
};

const AttendanceList = props => {
  const [selectedWeekday, setSelectedWeekday] = useState('monday');
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState({
    week: moment().week(),
    year: moment().year()
  });
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Calculate the specific date for the selected week and weekday
      const selectedDate = moment()
        .year(selectedWeek.year)
        .week(selectedWeek.week)
        .day(selectedWeekday === 'monday' ? 1 
          : selectedWeekday === 'tuesday' ? 2 
          : selectedWeekday === 'wednesday' ? 3 
          : selectedWeekday === 'thursday' ? 4 
          : 5)
        .format('YYYY-MM-DD');

      const response = await dataProvider.getAttendanceList('attendance', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
        filter: {
          week: selectedWeek.week,
          year: selectedWeek.year,
          date: selectedDate // Add date to filter
        }
      });

      // Transform the attendance data for easier access
      const attendanceMap = {};
      if (response.data.data?.attendance) {
        response.data.data.attendance.forEach(record => {
          // Only include attendance records for the selected date
          if (moment(record.date).format('YYYY-MM-DD') === selectedDate) {
            attendanceMap[record.studentId] = record;
          }
        });
      }

      setStudents(response.data?.data?.enrolledStudents || []);
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      notify('Error fetching attendance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [selectedWeek, selectedWeekday]);

  const handleWeekdayChange = (event, newWeekday) => {
    if (newWeekday !== null) {
      setSelectedWeekday(newWeekday);
    }
  };

  const handleWeekChange = (event) => {
    const [week, year] = event.target.value.split('-');
    setSelectedWeek({
      week: parseInt(week),
      year: parseInt(year)
    });
  };

  const handleStatusChange = async (studentId, status) => {
    try {
      const date = moment()
        .year(selectedWeek.year)
        .week(selectedWeek.week)
        .day(selectedWeekday === 'monday' ? 1 
          : selectedWeekday === 'tuesday' ? 2 
          : selectedWeekday === 'wednesday' ? 3 
          : selectedWeekday === 'thursday' ? 4 
          : 5)
        .format('YYYY-MM-DD');

      await dataProvider.create('attendance', {
        data: {
          studentId,
          date,
          status,
          notes: ''
        }
      });
      
      notify('Attendance updated successfully', 'success');
      fetchStudentsAndAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      notify('Error updating attendance', 'error');
    }
  };

  // Get week options for the dropdown
  const weekOptions = getWeekOptions();
  
  // Add selected date display
  const getSelectedDateDisplay = () => {
    return moment()
      .year(selectedWeek.year)
      .week(selectedWeek.week)
      .day(selectedWeekday === 'monday' ? 1 
        : selectedWeekday === 'tuesday' ? 2 
        : selectedWeekday === 'wednesday' ? 3 
        : selectedWeekday === 'thursday' ? 4 
        : 5)
      .format('MMMM D, YYYY');
  };

  return (
    <>
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>Attendance Management</Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Week</InputLabel>
              <Select
                value={`${selectedWeek.week}-${selectedWeek.year}`}
                onChange={handleWeekChange}
                label="Select Week"
              >
                {weekOptions.map((option) => (
                  <MenuItem 
                    key={`${option.week}-${option.year}`} 
                    value={`${option.week}-${option.year}`}
                  >
                    {option.label}
                    {option.isCurrent && " (Current)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>Select Day:</Typography>
            <ToggleButtonGroup
              value={selectedWeekday}
              exclusive
              onChange={handleWeekdayChange}
              aria-label="weekday selection"
              fullWidth
            >
              <ToggleButton value="monday">Monday</ToggleButton>
              <ToggleButton value="tuesday">Tuesday</ToggleButton>
              <ToggleButton value="wednesday">Wednesday</ToggleButton>
              <ToggleButton value="thursday">Thursday</ToggleButton>
              <ToggleButton value="friday">Friday</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mt: 2, color: 'text.secondary' }}>
          Selected Date: {getSelectedDateDisplay()}
        </Typography>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Current Status</TableCell>
              <TableCell>Update Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => {
              const attendanceRecord = attendanceData[student.Student.id];
              return (
                <TableRow key={student.Student.id}>
                  <TableCell>
                    {`${student.Student.firstName} ${student.Student.lastName}`}
                  </TableCell>
                  <TableCell>
                    {getStatusDisplay(attendanceRecord?.status)}
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={attendanceRecord?.status || ''}
                        onChange={(e) => handleStatusChange(student.Student.id, e.target.value)}
                        displayEmpty
                      >
                      <MenuItem value="" disabled>
                        Select Status
                      </MenuItem>
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {option.icon}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export { AttendanceList };
