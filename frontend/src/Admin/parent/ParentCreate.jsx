import React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceArrayInput,
  SelectArrayInput,
  required,
  email,
  minLength,
  regex
} from "react-admin";
import InputVildcation from "../../components/InputVildcation";

// Phone number validation - must start with 0 followed by 9 or 7, then 8 more digits
const validatePhone = [
  required(),
  regex(/^0[97]\d{8}$/, 'Phone number must start with 09 or 07 followed by 8 digits')
];

const relationChoices = [
  { id: 'father', name: 'Father' },
  { id: 'mother', name: 'Mother' },
  { id: 'guardian', name: 'Guardian' },
  { id: 'other', name: 'Other' }
];

const ParentCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput
          source="firstName"
          label="First Name"
          fullWidth
          parse={(value) => InputVildcation(value , "letter")}
          validate={[required()]}
        />
        <TextInput
          source="lastName"
          label="Last Name"
          fullWidth
          parse={(value) => InputVildcation(value , "letter")}
          validate={[required()]}
        />
        <TextInput
          source="email"
          label="Email"
          fullWidth
          validate={[required(), email()]}
        />
        <TextInput
          source="address"
          label="Address"
          fullWidth
          validate={[required()]}
        />
        <TextInput
          source="phone"
          type="tel"
          label="Phone Number"
          parse={(value) => InputVildcation(value , "phone")}
          fullWidth
          validate={validatePhone}
          helperText="Must start with 09 or 07 followed by 8 digits"
        />
        <SelectInput
          source="relation"
          label="Relation"
          choices={relationChoices}
          fullWidth
          validate={[required()]}
        />
        <TextInput
          source="occupation"
          label="Occupation"
          parse={(value) => InputVildcation(value , "letter")}
          fullWidth
        />
        <ReferenceArrayInput
          source="studentIds"
          reference="students"
          label="Children"
          filter={{ isActive: true }}
        >
          <SelectArrayInput
            optionText={(record) =>
              record ? `${record.firstName} ${record.lastName} (Grade: ${record.grade})` : ''
            }
            filter={{ isActive: true }}
            filterToQuery={searchText => ({
              q: searchText,
              _sort: 'firstName',
              _order: 'ASC',
            })}
            fullWidth
            label="Select Students"
            helperText="Search by student name"
          />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  );
};

export default ParentCreate;