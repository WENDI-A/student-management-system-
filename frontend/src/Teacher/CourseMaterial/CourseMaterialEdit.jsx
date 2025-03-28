
import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  FileInput,
  FileField,
  required
} from 'react-admin';

const CourseMaterialEdit = (props) => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="title" label="Title" validate={[required()]} fullWidth />
        <TextInput 
            source="content" 
            label="Content" 
            multiline 
            fullWidth
            rows={10}
          />
        <FileInput source="file" label="Replace File" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*">
          <FileField source="src" title="title" />
        </FileInput>
        <TextInput source="fileUrl" label="Or External File URL" fullWidth />
      </SimpleForm>
    </Edit>
  );
};

export default CourseMaterialEdit;
