import React from "react";
import { Create, SimpleForm, TextInput, required, ReferenceInput, SelectInput } from "react-admin";

const CourseCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="Coures_name" label="Course Name" fullWidth validate={[required()]} />
        <TextInput source="Coures_code" label="Course Code" fullWidth validate={[required()]} />
        <ReferenceInput source="teacher_id" reference="teachers" label="Teacher">
          <SelectInput 
            optionText={(record) => record ? `${record.firstName} ${record.lastName} ${record.grade}` : ''}
            fullWidth
            validate={[required()]}
          />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
};

export default CourseCreate;