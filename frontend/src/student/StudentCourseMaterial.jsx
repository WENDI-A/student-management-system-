import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  CircularProgress, 
  Snackbar, 
  Tooltip, 
  Box, 
  Paper,
  Alert
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Book as BookIcon, 
  Description as FileTextIcon, 
  PictureAsPdf as PdfIcon,
  InsertDriveFile as WordIcon,
  TableChart as ExcelIcon,
  Slideshow as PptIcon,
  Archive as ZipIcon,
  Photo as ImageIcon,
  Help as UnknownIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { BASE_URL, API_ENDPOINT_FUNCTION, GET_HEADER } from '../config/config';

const Root = styled('div')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

const TitleWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const CourseCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const CourseTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const SpinnerWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(4),
}));

const EmptyState = styled('div')(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const FileIconStyle = styled('span')(({ theme }) => ({
  fontSize: 40,
}));

const StudentCourseMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedMaterials, setGroupedMaterials] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchCourseMaterials();
  }, []);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      const options = await GET_HEADER({ isJson: true });
      const response = await axios.get(
        API_ENDPOINT_FUNCTION('/CourseMaterial/student'), 
        options
      );
      
      if (response.data.success) {
        setMaterials(response.data.data);
        
        const grouped = {};
        response.data.data.forEach(material => {
          const courseId = material.Course?.id;
          if (courseId) {
            if (!grouped[courseId]) {
              grouped[courseId] = {
                courseInfo: material.Course,
                materials: []
              };
            }
            grouped[courseId].materials.push(material);
          }
        });
        
        setGroupedMaterials(grouped);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course materials:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load course materials',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      if (!material.fileUrl) {
        setSnackbar({
          open: true,
          message: 'No file available for download',
          severity: 'error'
        });
        return;
      }


        const downloadUrl = `${BASE_URL}${material.fileUrl}`;
        
        console.log('Downloading from:', downloadUrl);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', "book");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
      
      setSnackbar({
        open: true,
        message: `Downloaded ${material.title} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <UnknownIcon sx={{ fontSize: 40 }} />;
    
    const extension = fileUrl.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <PdfIcon sx={{ fontSize: 40, color: '#f44336' }} />;
      case 'doc':
      case 'docx':
        return <WordIcon sx={{ fontSize: 40, color: '#2196f3' }} />;
      case 'xls':
      case 'xlsx':
        return <ExcelIcon sx={{ fontSize: 40, color: '#4caf50' }} />;
      case 'ppt':
      case 'pptx':
        return <PptIcon sx={{ fontSize: 40, color: '#ff9800' }} />;
      case 'zip':
      case 'rar':
        return <ZipIcon sx={{ fontSize: 40, color: '#9c27b0' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon sx={{ fontSize: 40, color: '#00bcd4' }} />;
      default:
        return <FileTextIcon sx={{ fontSize: 40, color: '#757575' }} />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <SpinnerWrapper>
        <CircularProgress />
      </SpinnerWrapper>
    );
  }

  if (materials.length === 0) {
    return (
      <Paper sx={{ textAlign: 'center', padding: 4 }}>
        <Typography variant="h6">No course materials available</Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have any course materials available for your enrolled courses.
        </Typography>
      </Paper>
    );
  }

  return (
    <Root>
      <Card>
        <CardContent>
          <TitleWrapper>
            <BookIcon />
            <Typography variant="h5">Course Materials</Typography>
          </TitleWrapper>
          <Typography variant="body2" color="text.secondary">
            View and download materials for your enrolled courses
          </Typography>
          
          <Divider sx={{ margin: '16px 0' }} />
          
          {Object.keys(groupedMaterials).length > 0 ? (
            Object.entries(groupedMaterials).map(([courseId, { courseInfo, materials }]) => (
              <CourseCard key={courseId} variant="outlined">
                <CardContent>
                  <CourseTitle>
                    <BookIcon />
                    <Typography variant="h6">{courseInfo.title}</Typography>
                  </CourseTitle>
                  <Typography variant="body2" paragraph>
                    {courseInfo.description}
                  </Typography>
                  
                  <List>
                    {materials.map((material) => (
                      <ListItem key={material.id} divider>
                        <ListItemAvatar>
                          {getFileIcon(material.fileUrl)}
                        </ListItemAvatar>
                        <ListItemText
                          primary={material.title}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2">
                                {material.content}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2" color="text.secondary">
                                Added: {new Date(material.createdAt).toLocaleDateString()}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                        <Tooltip title="Download Material">
                          <DownloadButton
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(material)}
                            disabled={!material.fileUrl}
                          >
                            Download
                          </DownloadButton>
                        </Tooltip>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </CourseCard>
            ))
          ) : (
            <EmptyState>
              <Typography variant="h6">No course materials available</Typography>
            </EmptyState>
          )}
        </CardContent>
      </Card>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Root>
  );
};

export default StudentCourseMaterial;
