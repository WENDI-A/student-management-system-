import React from "react";
import { 
  Edit, 
  SimpleForm, 
  TextInput, 
  ReferenceInput, 
  SelectInput,
  BooleanInput
} from "react-admin";
import InputVildcation from "../../components/InputVildcation";

const gradeChoices = [
  { id: '9', name: 'Grade 9' },
  { id: '10', name: 'Grade 10' },
];

const CourseEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="Coures_name" label="Course Name" fullWidth
                parse={(value) => InputVildcation(value , "letter")} />
        <TextInput source="Coures_code" label="Course Code" fullWidth
                parse={(value) => InputVildcation(value , "number")} />
        <ReferenceInput source="teacher_id" reference="teachers" label="Teacher">
          <SelectInput 
            optionText={(record) => record ? `${record.firstName} ${record.lastName}` : ''}
            fullWidth
          />
        </ReferenceInput>
                <SelectInput 
                  source="grade" 
                  label="Grade" 
                  choices={gradeChoices} 
                  fullWidth 
                />
      </SimpleForm>
    </Edit>
  );
};

export default CourseEdit;