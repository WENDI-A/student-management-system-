import React from "react";
import {   Edit,
  SimpleForm, 
  TextInput, 
  SelectInput, 
  ReferenceArrayInput, 
  SelectArrayInput,
} from "react-admin";
import InputVildcation from "../../components/InputVildcation";
const relationChoices = [
  { id: 'father', name: 'Father' },
  { id: 'mother', name: 'Mother' },
  { id: 'guardian', name: 'Guardian' },
  { id: 'other', name: 'Other' }
];
const parentEdit = (props) => {
  return (
    <Edit {...props}>
      <SimpleForm>
                <TextInput 
                  source="firstName" 
                  label="First Name" 
                  fullWidth 
                  parse={(value) => InputVildcation(value , "letter")}
                 
                />
                <TextInput 
                  source="lastName" 
                  label="Last Name" 
                  fullWidth 
                  parse={(value) => InputVildcation(value , "letter")}
                />
                <TextInput 
                  source="email" 
                  label="Email" 
                  fullWidth 

                />
                <TextInput 
                  source="address" 
                  label="Address" 
                  fullWidth 
                  parse={(value) => InputVildcation(value , "letter")}
                 
                />
                <TextInput 
                  source="phone" 
                  type="tel" 
                  label="Phone Number" 
                  fullWidth 
                  parse={(value) => InputVildcation(value , "phone")}
                 
                />
                <SelectInput 
                  source="relation" 
                  label="Relation" 
                  choices={relationChoices} 
                  fullWidth 
                 
                />
                <TextInput 
                  source="occupation" 
                  label="Occupation" 
                  fullWidth 
                  parse={(value) => InputVildcation(value , "letter")}
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
                    source="student"
                    fullWidth
                    label="Select Students"
                    helperText="Search by student name"
                  />
                </ReferenceArrayInput>
      </SimpleForm>
    </Edit>
  );
};

export default parentEdit;
