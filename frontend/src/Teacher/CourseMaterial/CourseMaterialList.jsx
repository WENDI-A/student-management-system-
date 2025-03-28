import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ShowButton,
  EditButton,
  DeleteButton,
  ReferenceField,
  Filter,
  TextInput,
  ReferenceInput,
  SelectInput
} from 'react-admin';


const CourseMaterialList = (props) => {
  return (
    <List 
      {...props} 
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid>
        <TextField source="title" label="Title" />
        {/* <ReferenceField source="course_id" reference="courses" label="Course">
          <TextField source="Course_name" />
        </ReferenceField> */}
        <TextField source="content" label="Content" />
        {/* <TextField source="fileUrl" label="File URL" /> */}
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default CourseMaterialList;