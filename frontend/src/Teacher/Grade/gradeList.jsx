import {
    useNotify,
    useDataProvider,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid,  
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
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import moment from 'moment';

const GradeList = () => {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [publishedAssessments, setPublishedAssessments] = useState([]);
    const [grades, setGrades] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState('');
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const navigate = useNavigate();

    const fetchGradesAndAssessments = async () => {
        setLoading(true);
        try {
            const response = await dataProvider.getGradeList('grade', {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'id', order: 'ASC' },
                filter: {
                    assessment_id: selectedAssessment
                }
            });

            if (response.data && response.data[0]) {
                setStudents(response.data[0].enrolledStudents || []);
                setPublishedAssessments(response.data[0].publishedAssessments || []);
                setGrades(response.data[0].grades || []);
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            notify('Error fetching grades data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGradesAndAssessments();
    }, [selectedAssessment]);

    const handleAssessmentChange = (event) => {
        setSelectedAssessment(event.target.value);
    };

    const calculatePercentage = (score, maxScore) => {
        if (!maxScore) return 0;
        return ((score / maxScore) * 100).toFixed(1);
    };

    const handleEditGrade = (studentId, gradeId) => {
        if (gradeId) {
            navigate(`/grade/${gradeId}`);
        } else if (selectedAssessment) {
            // Create new grade
            navigate(`/grade/create`, {
                state: {
                    student_id: studentId,
                    assessment_id: selectedAssessment,
                    record: {
                        student_id: studentId,
                        assessment_id: selectedAssessment
                    }
                }
            });
        } else {
            notify('Please select an assessment first', 'warning');
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
                <Typography variant="h6" gutterBottom>Grade Management</Typography>
                
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Select Assessment</InputLabel>
                            <Select
                                value={selectedAssessment}
                                onChange={handleAssessmentChange}
                                label="Select Assessment"
                            >
                                {publishedAssessments.map((assessment) => (
                                    <MenuItem 
                                        key={assessment.id} 
                                        value={assessment.id}
                                    >
                                        {`${assessment.Course.Course_code} - ${assessment.title}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Assessment</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Percentage</TableCell>
                            <TableCell>Feedback</TableCell>
                            <TableCell>Submitted</TableCell>
                            <TableCell>Graded</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((enrollment) => {
                            const studentGrade = grades.find(g => 
                                g.student_id === enrollment.Student.id && 
                                (!selectedAssessment || g.assessment_id === selectedAssessment)
                            );
                            const assessment = publishedAssessments.find(a => 
                                a.id === (studentGrade?.assessment_id || selectedAssessment)
                            );

                            return (
                                <TableRow key={enrollment.Student.id}>
                                    <TableCell>
                                        {`${enrollment.Student.firstName} ${enrollment.Student.lastName}`}
                                    </TableCell>
                                    <TableCell>
                                        {assessment?.Course.Course_name || ''}
                                    </TableCell>
                                    <TableCell>
                                        {assessment?.title || ''}
                                    </TableCell>
                                    <TableCell>
                                        {studentGrade ? `${studentGrade.score}/${assessment?.max_score}` : 'Not graded'}
                                    </TableCell>
                                    <TableCell>
                                        {studentGrade ? 
                                            `${calculatePercentage(studentGrade.score, assessment?.max_score)}%` : 
                                            'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {studentGrade?.feedback || ''}
                                    </TableCell>
                                    <TableCell>
                                        {studentGrade?.submitted_at ? 
                                            moment(studentGrade.submitted_at).format('MMM D, YYYY h:mm A') : 
                                            'Not submitted'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {studentGrade?.graded_at ? 
                                            moment(studentGrade.graded_at).format('MMM D, YYYY h:mm A') : 
                                            'Not graded'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditGrade(
                                                enrollment.Student.id,
                                                studentGrade?.id
                                            )}
                                            disabled={!selectedAssessment}
                                        >
                                            {studentGrade ? 'Edit' : 'Set Grade'}
                                        </Button>
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

export default GradeList;