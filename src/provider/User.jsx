import React, { useContext, useEffect, useState } from "react";
import { useGetProfileQuery } from "../redux/apiSlices/profileSlice";

export const UserContext = React.createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { data, isFetching, error } = useGetProfileQuery();

  useEffect(() => {
    if (data && !isFetching && !error) {
      setUser(data);
    }
  }, [data, isFetching, error]);

  return (
    <UserContext.Provider value={{ user, setUser, isFetching, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
