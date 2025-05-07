import React from "react";
import { Create, SimpleForm, TextInput, required, SelectInput, regex } from "react-admin";
import InputVildcation from "../../components/InputVildcation";

// Phone number validation - must start with 0 followed by 9 or 7, then 8 more digits
const validatePhone = [
  required(),
  regex(/^0[97]\d{8}$/, 'Phone number must start with 09 or 07 followed by 8 digits')
];
  const gradeChoices = [
    { id: '9', name: 'Grade 9' },
    { id: '10', name: 'Grade 10' },
  ];


const TeacherCreate = () => {

  return (
    <Create>
      <SimpleForm>
        <TextInput source="firstName" label="First Name" fullWidth validate={[required()]}
        parse={(value) => InputVildcation(value , "letter")} />
        <TextInput source="lastName" label="Last Name" fullWidth validate={[required()]}
        parse={(value) => InputVildcation(value , "letter")} />
        <TextInput source="email" label="Email" fullWidth validate={[required()]} />
        <TextInput
          source="phone"
          type="tel"
          label="Phone Number"
          fullWidth
          validate={validatePhone}
          parse={(value) => InputVildcation(value , "phone")}
          helperText="Must start with 09 or 07 followed by 8 digits"
        />
        <SelectInput
          source="grade"
          label="Grade"
          choices={gradeChoices}
          fullWidth
          validate={[required()]}
        />

      </SimpleForm>
    </Create>
  );
};

export default TeacherCreate;