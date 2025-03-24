// src/components/DepartmentFileCreate.tsx
import React from "react";
import { Create, SimpleForm, TextInput, required } from "react-admin";

const StudentCreate = () => {

  return (
    <Create>
      <SimpleForm>
        <TextInput source="firstName" label="First Name" fullWidth validate={[required()]} />
        <TextInput source="lastName" label="Last Name" fullWidth validate={[required()]} />
        <TextInput source="student_id" label="Student Id" defaultValue="1746/14" fullWidth  validate={[required()]} />
        <TextInput source="email" label="Email" fullWidth validate={[required()]} />
        <TextInput source="password" type="password" label="password" fullWidth validate={[required()]} />
        <TextInput source="dateOfBirth" type="date" label="Date Of Birth" fullWidth validate={[required()]} />
        <TextInput source="enrollmentDate" type="date" label="Enrollment Date" fullWidth validate={[required()]} />
        <TextInput source="grade" label="Grade" fullWidth validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};

export default StudentCreate;