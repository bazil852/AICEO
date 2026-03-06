import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(500);

  const login = (email) => {
    setUser({
      name: 'Marko Filipovic',
      email: email,
      avatar: null,
      plan: 'Growth',
    });
  };

  const signup = (email, plan) => {
    setUser({
      name: 'New User',
      email: email,
      avatar: null,
      plan: plan,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, credits, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
