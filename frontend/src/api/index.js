import axios from "axios";
import { LocalStorage } from "../utils";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URI,
    withCredentials: true,
    timeout: 120000
})


// Add an interceptor to set authorization with user token before requests
api.interceptors.request.use(
    function (config) {
        // get the user token from local storage
        const token  = LocalStorage.get("token")
        // Set authorization header with bearer token
        config.headers.Authorization = `Bearer ${token}`
        return config;
    },
    function (error) {
        return Promise.reject(error)
    }
)

const loginUser = (data) => {
    return api.post("api/v1/user/login", data)
}

const registerUser = (data = {username, email, password}) => {
    return api.post("api/v1/user/register", data)
}

const logoutUser = () => {
    return api.post("api/v1/user/logout")
}

const getAllChats = () => {
    return api.get("api/v1/chat-app/chats")
}


export {
    loginUser,
    registerUser,
    logoutUser,
    getAllChats,
}