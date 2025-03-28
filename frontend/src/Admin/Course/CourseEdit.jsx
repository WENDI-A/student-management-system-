import React from "react";
import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  ReferenceInput, 
  SelectInput,
  BooleanInput
} from "react-admin";

const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="Coures_name" label="Course Name" fullWidth />
        <TextInput source="Coures_code" label="Course Code" fullWidth />
        <ReferenceInput source="teacher_id" reference="teachers" label="Teacher">
          <SelectInput 
            optionText={(record) => record ? `${record.firstName} ${record.lastName}` : ''}
            fullWidth
          />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
};

export default CourseEdit;