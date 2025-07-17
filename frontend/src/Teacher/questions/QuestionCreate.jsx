import React, { useState } from 'react';
import {
  Create,
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

const QuestionCreate = props => {
  const [type, setType] = useState('mcq');
  const [options, setOptions] = useState({ A: '', B: '', C: '', D: '' });

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleOptionChange = (e) => {
    setOptions({ ...options, [e.target.name]: e.target.value });
  };

  return (
    <Create {...props} title="Add Question">
      <SimpleForm
        transform={data => {
          if (type === 'mcq') {
            data.options = JSON.stringify(options);
          }
          return data;
        }}
      >
        <ReferenceInput source="assessment_id" reference="Assessment" label="Assessment">
          <SelectInput optionText="title" validate={[required()]} />
        </ReferenceInput>
        <TextInput source="question_text" label="Question" validate={[required()]} fullWidth />
        <SelectInput source="type" label="Type" choices={typeChoices} validate={[required()]} onChange={handleTypeChange} />
        {type === 'mcq' && (
          <>
            <TextInput source={null} name="A" label="Option A" value={options.A} onChange={handleOptionChange} validate={[required()]} fullWidth />
            <TextInput source={null} name="B" label="Option B" value={options.B} onChange={handleOptionChange} validate={[required()]} fullWidth />
            <TextInput source={null} name="C" label="Option C" value={options.C} onChange={handleOptionChange} validate={[required()]} fullWidth />
            <TextInput source={null} name="D" label="Option D" value={options.D} onChange={handleOptionChange} validate={[required()]} fullWidth />
          </>
        )}
        <TextInput source="correct_answer" label="Correct Answer" validate={[required()]} />
        <TextInput source="explanation" label="Explanation" multiline fullWidth />
      </SimpleForm>
    </Create>
  );
};

export default QuestionCreate; 