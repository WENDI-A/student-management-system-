import React from "react";
import { List, Datagrid, TextField, EmailField, EditButton, DeleteButton } from "react-admin";

const DirectorList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default DirectorList; 