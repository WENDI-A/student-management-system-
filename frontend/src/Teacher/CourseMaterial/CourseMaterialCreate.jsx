import React, { useState } from 'react';
import {
  Create,
  SimpleForm,
  TextInput,
  FileInput,
  FileField,
  required,
  useDataProvider,
  useNotify,
  useRedirect,
  Button
} from 'react-admin';
import { API_ENDPOINT_FUNCTION, GET_HEADER } from "../../config/config";

const CourseMaterialCreate = (props) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {

      if (values.materialFile && values.materialFile.rawFile) {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('materialFile', values.materialFile.rawFile);
        
        if (values.fileUrl) {
          formData.append('fileUrl', values.fileUrl);
        }
        const url = API_ENDPOINT_FUNCTION('/CourseMaterial');
        const options = await GET_HEADER();
        delete options.headers['Content-Type'];
        
        options.method = 'POST';
        options.body = formData;

        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const result = await response.json();
        notify('Course material created successfully');
        redirect('list', 'CourseMaterial');
      } else {
        await dataProvider.create('CourseMaterial', {
          data: {
            title: values.title,
            content: values.content,
            fileUrl: values.fileUrl || null
          }
        });
        notify('Course material created successfully');
        redirect('list', 'CourseMaterial');
      }
    } catch (error) {
      console.error('Error creating course material:', error);
      notify(`Error: ${error.message || 'Could not create course material'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Create {...props}>
      <SimpleForm onSubmit={handleSubmit}>
        <TextInput source="title" label="Title" validate={[required()]} fullWidth />
        <TextInput 
          source="content" 
          label="Content" 
          multiline 
          fullWidth
          rows={10}
        />
        <FileInput 
          source="materialFile" 
          label="Upload File" 
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,video/*,audio/*"
        >
          <FileField source="src" title="title" />
        </FileInput>
        <TextInput source="fileUrl" label="Or External File URL" fullWidth />
        {loading && <div>Uploading...</div>}
      </SimpleForm>
    </Create>
  );
};

export default CourseMaterialCreate;