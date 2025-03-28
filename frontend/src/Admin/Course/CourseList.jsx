import React from "react";
import { 
  List, 
  Datagrid, 
  TextField, 
  ReferenceField, 
  EditButton, 
  DeleteButton,
  BooleanField
} from "react-admin";

const CourseList = () => {
  return (
    <List>
      <Datagrid>
        <TextField source="Course_name" label="Course Name" />
        <TextField source="Course_code" label="Course Code" />
        <ReferenceField source="teacher_id" reference="teachers" label="Teacher">
          <TextField source="firstName" />
        </ReferenceField>
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default CourseList;