import React from "react";
import { Edit, SimpleForm, TextInput, required } from "react-admin";

const TeacherEdit = (props) => {
  return (
    <Edit {...props}>
      <SimpleForm>
                <TextInput source="firstName" label="First Name" fullWidth validate={[required()]} />
                <TextInput source="lastName" label="Last Name" fullWidth validate={[required()]} />
                <TextInput source="email" label="Email" fullWidth validate={[required()]} />
                <TextInput source="password" type="password" label="Password" fullWidth validate={[required()]} />
                <TextInput source="department" label="Department" fullWidth validate={[required()]} />
                <TextInput source="joinDate" type="date" label="Join Date" fullWidth validate={[required()]} />
                <TextInput source="position" label="Position" fullWidth validate={[required()]} />
                <TextInput source="phone" type="tel" label="Phone Number" fullWidth validate={[required()]} />
      </SimpleForm>
    </Edit>
  );
};

export default TeacherEdit;
