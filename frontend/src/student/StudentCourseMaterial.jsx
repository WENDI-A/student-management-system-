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
import { BASE_URL, API_URL, API_ENDPOINT_FUNCTION, GET_HEADER } from '../config/config';

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

      setSnackbar({
        open: true,
        message: `Preparing ${material.title} for download...`,
        severity: 'info'
      });

      // Get the file name from the URL and decode it to handle special characters
      const fileName = decodeURIComponent(material.fileUrl.split('/').pop());

      // Get auth token from localStorage
      const authData = localStorage.getItem("auth");
      let token = '';

      if (authData) {
        try {
          const parsedAuth = JSON.parse(authData);
          token = parsedAuth.token || '';
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }

      // Create a download URL that points to our API endpoint
      const downloadUrl = `${API_URL}/CourseMaterial/download`;
      console.log('Attempting to download from API endpoint');

      // Use axios to make a request to our download endpoint
      const options = {
        method: 'POST',
        url: downloadUrl,
        responseType: 'blob', // Important: this tells axios to handle the response as a binary blob
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          filePath: material.fileUrl
        }
      };

      // Show loading message
      setSnackbar({
        open: true,
        message: `Downloading ${material.title}...`,
        severity: 'info'
      });

      // Make the request
      const response = await axios(options);

      // Get the content type from the response
      const contentType = response.headers['content-type'];

      // Create a blob with the correct content type
      const blob = new Blob([response.data], { type: contentType });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Set the file name
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      // Show success message
      setSnackbar({
        open: true,
        message: `Downloaded ${material.title} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading file:', error);

      // If the API endpoint fails, try direct download as fallback
      try {
        console.log('Falling back to direct download');

        // Log the file name for debugging
        console.log('File name:', decodeURIComponent(material.fileUrl.split('/').pop()));

        // Create a proper download URL with download=true parameter to force download
        // Make sure to encode the URL properly to handle spaces and special characters
        const filePath = material.fileUrl.startsWith('/') ? material.fileUrl.substring(1) : material.fileUrl;
        const encodedPath = encodeURI(filePath); // Use encodeURI to preserve the URL structure but encode spaces
        const directUrl = `${BASE_URL}${encodedPath}?download=true`;

        console.log('Direct download URL:', directUrl);

        // Open the URL in a new window with download attribute
        window.open(directUrl, '_blank');

        // Show success message
        setSnackbar({
          open: true,
          message: `Download initiated for ${material.title}. If the file doesn't download automatically, check your browser's download settings.`,
          severity: 'success'
        });
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);

        // Last resort: try iframe approach
        try {
          console.log('Trying iframe approach as last resort');

          // Create an iframe for downloading
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';

          // Set the source to the file URL with download parameter
          const filePath = material.fileUrl.startsWith('/') ? material.fileUrl.substring(1) : material.fileUrl;
          const encodedPath = encodeURI(filePath); // Use encodeURI to preserve the URL structure but encode spaces
          const fileUrl = `${BASE_URL}${encodedPath}?download=true`;
          iframe.src = fileUrl;

          // Add to document
          document.body.appendChild(iframe);

          // Remove after a delay
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 5000);

          setSnackbar({
            open: true,
            message: `Attempting to download ${material.title}. Please check your downloads folder.`,
            severity: 'info'
          });
        } catch (iframeError) {
          console.error('All download methods failed:', iframeError);
          setSnackbar({
            open: true,
            message: `Failed to download file: ${error.message}`,
            severity: 'error'
          });
        }
      }
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
                  <Typography variant="body2" sx={{ mb: 2 }}>
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
