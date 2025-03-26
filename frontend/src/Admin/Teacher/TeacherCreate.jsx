// src/components/DepartmentFileCreate.tsx
import React from "react";
import { Create, SimpleForm, TextInput, required } from "react-admin";

const TeacherCreate = () => {

  return (
    <Create>
      <SimpleForm>
        <TextInput source="firstName" label="First Name" fullWidth validate={[required()]} />
        <TextInput source="lastName" label="Last Name" fullWidth validate={[required()]} />
        <TextInput source="email" label="Email" fullWidth validate={[required()]} />
        <TextInput source="department" label="department" fullWidth validate={[required()]} />
        <TextInput source="joinDate" type="date" label="Enrollment Date" fullWidth validate={[required()]} />
        <TextInput source="position" label="position" fullWidth validate={[required()]} />
        <TextInput source="phone" type="tel" label="phone Number" fullWidth validate={[required()]} />
      </SimpleForm>
    </Create>
  );
};

export default TeacherCreate;