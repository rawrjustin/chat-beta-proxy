import React, { ReactElement } from 'react';

const UserStateContext = React.createContext<any>(undefined);

export const UserProvider = ({
  user = {},
  children,
}: {
  user?: {};
  children: ReactElement;
}) => {
  return (
    <UserStateContext.Provider value={user}>
      {children}
    </UserStateContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserStateContext);
  return context;
};
