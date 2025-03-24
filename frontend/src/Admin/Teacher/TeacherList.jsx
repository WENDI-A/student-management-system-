import React from "react";
import { 
  List, 
  Datagrid, 
  TextField, 
  EditButton, 
  DeleteButton, 
} from "react-admin";

const TeacherList = () => (
  <List 
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid
    >
        <TextField source="firstName" label="First Name"  />
        <TextField source="lastName" label="Last Name"  />
        <TextField source="email" label="Email"  />
        <TextField source="department" label="department"  />
        <TextField source="joinDate" type="date" label="Enrollment Date"  />
        <TextField source="position" label="position"  />
        <TextField source="phone" type="tel" label="phone Number"  />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default TeacherList;