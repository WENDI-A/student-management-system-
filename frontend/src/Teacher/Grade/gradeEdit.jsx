
import {
    useParams,
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    useNotify,
    useDataProvider,
} from 'react-admin';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GradeEdit = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const notify = useNotify();
    const dataProvider = useDataProvider();
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [gradeData, setGradeData] = useState({
        id: '',
        score: '',
        feedback: '',
        student: null,
        assessment: null
    });

    const isCreating = !id;

    useEffect(() => {
        const fetchGradeData = async () => {
            if (isCreating) {
                // For creation, use the state passed through navigation
                if (location.state?.record) {
                    setGradeData(prev => ({
                        ...prev,
                        student_id: location.state.record.student_id,
                        assessment_id: location.state.record.assessment_id
                    }));
                }
                return;
            }

            setLoading(true);
            try {
                const response = await dataProvider.getOne('grade', { id });
                
                // Check if the response has the expected structure
                if (response.data && response.data.grade) {
                    setGradeData({
                        id: response.data.grade.id,
                        score: response.data.grade.score || '',
                        feedback: response.data.grade.feedback || '',
                        student: {
                            id: response.data.id,
                            firstName: response.data.name ? response.data.name.split(' ')[0] : '',
                            lastName: response.data.name ? response.data.name.split(' ')[1] : '',
                            email: response.data.email
                        },
                        assessment: {
                            id: response.data.Assessmentid,
                            title: response.data.title,
                            type: response.data.type,
                            max_score: response.data.max_score,
                            weight: response.data.weight
                        }
                    });
                } else {
                    // Fallback for different response structure
                    setGradeData({
                        id: response.data.id || id,
                        score: response.data.score || '',
                        feedback: response.data.feedback || '',
                        student: response.data.student,
                        assessment: response.data.assessment
                    });
                }
            } catch (error) {
                console.error('Error fetching grade:', error);
                setError('Failed to load grade data');
                notify('Error loading grade data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchGradeData();
    }, [id, isCreating, location.state, dataProvider]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const saveData = {
                score: parseFloat(gradeData.score),
                feedback: gradeData.feedback,
                ...(isCreating && {
                    student_id: location.state?.record.student_id,
                    assessment_id: location.state?.record.assessment_id
                })
            };

            if (isCreating) {
                await dataProvider.create('grade', { data: saveData });
                notify('Grade created successfully', 'success');
            } else {
                await dataProvider.update('grade', {
                    id,
                    data: saveData
                });
                notify('Grade updated successfully', 'success');
            }
            
            navigate('/grade');
        } catch (error) {
            console.error('Error saving grade:', error);
            setError(error.message || 'Error saving grade');
            notify('Error saving grade', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    {isCreating ? 'Create New Grade' : 'Edit Grade'}
                </Typography>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/grade')}
                >
                    Back to List
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {gradeData.student && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Student: {`${gradeData.student.firstName} ${gradeData.student.lastName}`}
                            </Typography>
                            {gradeData.student.email && (
                                <Typography variant="body2" color="textSecondary">
                                    Email: {gradeData.student.email}
                                </Typography>
                            )}
                        </Grid>
                    )}

                    {gradeData.assessment && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Assessment: {gradeData.assessment.title}
                                {gradeData.assessment.max_score && 
                                    ` (Max Score: ${gradeData.assessment.max_score})`}
                            </Typography>
                            {gradeData.assessment.type && (
                                <Typography variant="body2" color="textSecondary">
                                    Type: {gradeData.assessment.type}
                                </Typography>
                            )}
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Score"
                            type="number"
                            value={gradeData.score}
                            onChange={(e) => setGradeData(prev => ({
                                ...prev,
                                score: e.target.value
                            }))}
                            inputProps={{
                                min: 0,
                                max: gradeData.assessment?.max_score || 100,
                                step: "0.1"
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Feedback"
                            multiline
                            rows={4}
                            value={gradeData.feedback}
                            onChange={(e) => setGradeData(prev => ({
                                ...prev,
                                feedback: e.target.value
                            }))}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                            startIcon={<SaveIcon />}
                        >
                            {saving ? 'Saving...' : 'Save Grade'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default GradeEdit;
