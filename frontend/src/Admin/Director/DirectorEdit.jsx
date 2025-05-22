import React from "react";
import { Edit, SimpleForm, TextInput, PasswordInput } from "react-admin";
import InputVildcation from "../../components/InputVildcation";

const validateName = (value) => {
  const valid = InputVildcation(value, "letter");
  if (!valid || valid.length < 2) return "Name must contain at least 2 letters";
  return undefined;
};

const validateEmail = (value) => {
  if (!value || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    return "Invalid email address";
  }
  return undefined;
};

const validatePassword = (value) => {
  if (value && value.length < 6) return "Password must be at least 6 characters";
  return undefined;
};

const DirectorEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" required validate={validateName} parse={value => InputVildcation(value, "letter")} />
      <TextInput source="email" required validate={validateEmail} />
    </SimpleForm>
  </Edit>
);

export default DirectorEdit; 