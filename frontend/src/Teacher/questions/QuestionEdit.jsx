import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  ReferenceInput,
  required
} from 'react-admin';

const typeChoices = [
  { id: 'mcq', name: 'Multiple Choice' },
  { id: 'short', name: 'Short Answer' }
];

const QuestionEdit = props => (
  <Edit {...props} title="Edit Question">
    <SimpleForm>
      <ReferenceInput source="assessment_id" reference="Assessment" label="Assessment">
        <SelectInput optionText="id" validate={[required()]} />
      </ReferenceInput>
      <TextInput source="question_text" label="Question" validate={[required()]} fullWidth />
      <SelectInput source="type" label="Type" choices={typeChoices} validate={[required()]} />
      <TextInput source="options" label="Options (JSON for MCQ)" fullWidth />
      <TextInput source="correct_answer" label="Correct Answer" validate={[required()]} fullWidth />
      <TextInput source="explanation" label="Explanation" fullWidth multiline />
    </SimpleForm>
  </Edit>
);

export default QuestionEdit; 