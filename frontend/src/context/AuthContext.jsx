import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorage, requestHandler } from "../utils/index.js";
import { loginUser, logoutUser, registerUser } from "../api/index.js";
import Loader from "../components/Loader.jsx";


// Context to manage to authentication-related data and function
const AuthContext = createContext({
    user: null,
    token: null,
    login: async (data) => {},
    register: async (data) => {},
    logout: async () => {}
})

const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    const navigate = useNavigate()

    // Function to handle user login
    const login = async (data) => {
        await requestHandler(
            // Make the API request
            async () => loginUser(data),
            setLoading,
            (res) => {
                const { data } = res
                setUser(data.user)
                setToken(data.accessToken)
                LocalStorage.set("user", data.user)
                LocalStorage.set("token", data.accessToken)
                navigate("/main")
                console.log("Logged In")
            },
            alert
        )
    }

    // Function to handle User registeration
    const register = async (data = {username, email, password}) => {
        await requestHandler(
            async () => registerUser(data),
            setLoading,
            () => {
                alert ("Account created successfully go ahead and login")
                navigate("/login")
            },
            alert // In case if the registeration failed
        )
    }

    // Function to handle User logout
    const logout = async () => {
        await requestHandler(
            async () => logoutUser(),
            setLoading,
            () => {
                setUser(null)
                setToken(null)
                LocalStorage.clear() // clear the local storage
                navigate("/login")
            },
            alert 
        )
    }

    useEffect(() => {
        setLoading(true)
        const _token = LocalStorage.get("token")
        const _user = LocalStorage.get("user")

        if (_token && _user?._id) {
            setUser(_user)
            setToken(_token)
        }
        setLoading(false)
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, register, logout, token}}>{loading ? <Loader /> : children}</AuthContext.Provider>
    )
}

export { useAuth, AuthContext, AuthProvider }
