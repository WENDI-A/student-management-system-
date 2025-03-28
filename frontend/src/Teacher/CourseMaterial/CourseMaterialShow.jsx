import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  ReferenceField,
  UrlField
} from 'react-admin';
import { Card, CardContent, Typography, Box } from '@mui/material';
import RichTextInput from 'ra-input-rich-text';

const ContentField = ({ record }) => {
  if (!record || !record.content) return null;
  return (
    <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Content</Typography>
        <div dangerouslySetInnerHTML={{ __html: record.content }} />
      </CardContent>
    </Card>
  );
};

const FilePreview = ({ record }) => {
  if (!record || !record.fileUrl) return null;
  const isImage = /\.(jpeg|jpg|gif|png)$/i.test(record.fileUrl);
  
  return (
    <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Attached File</Typography>
        {isImage ? (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={record.fileUrl} 
              alt="Material preview" 
              style={{ maxWidth: '100%', maxHeight: '400px' }} 
            />
          </Box>
        ) : (
          <Box>
            <UrlField source="fileUrl" />
            <Box sx={{ mt: 1 }}>
              <a 
                href={record.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#1976d2', 
                  color: 'white', 
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Download File
              </a>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CourseMaterialShow = (props) => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="title" label="Title" />
        <ReferenceField source="course_id" reference="courses" label="Course">
          <TextField source="Course_name" />
        </ReferenceField>
        <ContentField />
        <FilePreview />
        <DateField source="createdAt" label="Created At" />
        <DateField source="updatedAt" label="Updated At" />
      </SimpleShowLayout>
    </Show>
  );
};

export default CourseMaterialShow;