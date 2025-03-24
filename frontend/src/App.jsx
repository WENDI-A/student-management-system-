import React from "react";
import { Admin } from "react-admin";
import dataProvider from "./hooks/dataProvider";
import authProvider from "./hooks/authProvider";
import { CustomLayout } from "./layout/CustomLayout";
import LoginPage from "./Auth/LoginPage";
import { getResources, DashboardSelector } from "./layout/resources";

const App = () => {
  const getUserRole = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).user.role : null;
  };

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={DashboardSelector}
      layout={CustomLayout}
      loginPage={LoginPage}
      requireAuth
    >
      {getResources(getUserRole())}
    </Admin>
  );
};

export default App;
