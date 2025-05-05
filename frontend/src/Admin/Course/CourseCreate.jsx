import React from "react";
import { Create, SimpleForm, TextInput, required, ReferenceInput, SelectInput  } from "react-admin";
import InputVildcation from "../../components/InputVildcation";

  const gradeChoices = [
    { id: '9', name: 'Grade 9' },
    { id: '10', name: 'Grade 10' },
  ];


const CourseCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="Coures_name" label="Course Name" fullWidth validate={[required()]
        }
        parse={(value) => InputVildcation(value , "letter")}
        />
        <TextInput source="Coures_code" label="Course Code" fullWidth validate={[required()]} 
        parse={(value) => InputVildcation(value , "number")}
        />
        <ReferenceInput source="teacher_id" reference="teachers" label="Teacher">
          <SelectInput 
            optionText={(record) => record ? `${record.firstName} ${record.lastName} ${record.grade}` : ''}
            fullWidth
            validate={[required()]}
          />
        </ReferenceInput>
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

export default CourseCreate;