import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    try {
      const localStorageToken = localStorage.getItem("token");
      if (localStorageToken) {
        const res = await axios.get("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${localStorageToken}`,
          },
        });
        if (res.data?.isValid) {
          setToken(localStorageToken);
          setUser(res.data.user);
        } else {
          setToken(null);
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error(error);
      localstorage.removeItem("token");
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = (token, firstLogin) => {
    const decodedToken = jwtDecode(token);
    const userData = {
      username: decodedToken.username,
      id: decodedToken.id,
    };
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    setFirstLogin(firstLogin);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const isAuthenticated = token !== null;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        firstLogin,
        setFirstLogin,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
