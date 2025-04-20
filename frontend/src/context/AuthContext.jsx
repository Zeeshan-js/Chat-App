import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorage, requestHandler } from "../utils/index.js";
import { loginUser, logoutUser, registerUser } from "../api/index.js";
import Loader from "../components/Loader.jsx";

// Context to manage to authentication-related data and function
export const AuthContext = createContext({
  user: null,
  token: null,
  login: async (data) => {},
  register: async (data) => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  // Function to handle user login
  const login = async (data) => {
    await requestHandler(
      // Make the API request
      async () => await loginUser(data),
      setLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        LocalStorage.set("token", data.accessToken);
        navigate("/main");
      },
      alert
    );
  };

  // Function to handle User registeration
  const register = async (data) => {
    await requestHandler(
      async () => await registerUser(data),
      setLoading,
      () => {
        alert("Account created successfully go ahead and login");
        navigate("/login");
      },
      alert // In case if the registeration failed
    );
  };

  // Function to handle User logout
  const logout = async () => {
    await requestHandler(
      async () => await logoutUser(),
      setLoading,
      () => {
        setUser(null);
        setToken(null);
        LocalStorage.clear(); // clear the local storage
        navigate("/login");
      },
      alert
    );
  };

  useEffect(() => {
    setLoading(true);

    // get the token and user when this component mount
    const _token = LocalStorage.get("token");
    const _user = LocalStorage.get("user");

    // if we got both then set them in state variable
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};
