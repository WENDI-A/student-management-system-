import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  ReferenceField
} from 'react-admin';

const QuestionList = (props) => {
  return (
    <List {...props} title="Questions">
      <Datagrid>
        <TextField source="question_text" label="Question" />
        <TextField source="type" label="Type" />
        <TextField source="correct_answer" label="Correct Answer" />
        <TextField source="explanation" label="Explanation" />
        <ReferenceField source="assessment_id" reference="Assessment" label="Assessment">
          <TextField source="title" />
        </ReferenceField>
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default QuestionList; 