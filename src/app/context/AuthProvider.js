'use client'

import { createContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      setAccessToken, 
      user, 
      setUser, 
      clearAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;