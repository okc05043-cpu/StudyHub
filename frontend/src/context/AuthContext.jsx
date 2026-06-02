import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,    setToken]    = useState(() => localStorage.getItem('token'));
  const [nickname, setNickname] = useState(() => localStorage.getItem('nickname'));

  const login = (token, nickname) => {
    localStorage.setItem('token',    token);
    localStorage.setItem('nickname', nickname);
    setToken(token);
    setNickname(nickname);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    setToken(null);
    setNickname(null);
  };

  return (
    <AuthContext.Provider value={{ token, nickname, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
