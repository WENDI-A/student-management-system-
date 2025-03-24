import React from "react";
import { Edit, SimpleForm, TextInput, required } from "react-admin";

const StudentEdit = (props) => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="firstName" label="First Name" fullWidth validate={[required()]} />
        <TextInput source="lastName" label="Last Name" fullWidth validate={[required()]} />
        <TextInput source="student_id" label="Student ID" defaultValue="1746/14" fullWidth validate={[required()]} />
        <TextInput source="email" label="Email" fullWidth validate={[required()]} />
        <TextInput source="password" label="password" fullWidth validate={[required()]} />
        <TextInput source="dateOfBirth" label="Date Of Birth" fullWidth validate={[required()]} />
        <TextInput source="enrollmentDate" label="Enrollment Date" fullWidth validate={[required()]} />
        <TextInput source="grade" label="Grade" fullWidth validate={[required()]} />
      </SimpleForm>
    </Edit>
  );
};

export default StudentEdit;
