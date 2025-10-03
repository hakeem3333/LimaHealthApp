import React, { useState, useEffect, useContext, createContext } from "react";

// Create the Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [user, setUser] = useState(null); 

  const login = () => {
    // call API, save token
    setIsLoggedIn(true);
    setUser({ id: "user-abc", username: "student_101" });
  };

  const logout = () => {
    // clear token, clear state
    setIsLoggedIn(false);
    setUser(null);
  };

  const signup = () => {
    setIsLoggedIn(true);
    setUser({ id: "user-xyz", username: "new_student" });
  };

  const value = {
    isLoggedIn,
    consentGiven,
    user,
    setConsentGiven,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth state
const useAuth = () => useContext(AuthContext);
