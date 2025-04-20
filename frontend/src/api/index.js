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

const getAvailableUsers = () => {
    return api.get("api/v1/chat-app/chats/users")
}

// create a new chat
const createUserChat = (recieverId) => {
    return api.post(`api/v1/chat-app/chats/c/${recieverId}`)
}

// create new group chat
const createGroupChat = (data = {name, participants : []}) => {
    // The data is required for the group chat which contains name and participants
    return api.post("api/v1/chat-app/chats/group", data)
}

// Api call to change group name
const changeGroupName = (chatId, name) => {
    return api.patch(`api/v1/chat-app/chats/group/${chatId}`, { name } )
}

// Delete one on one chat
const deleteOneOnOneChat = (chatId) => {
    return api.delete(`api/v1/chat-app/chats/remove/${chatId}`)
}

// Delete Group chat
const deleteGroup = (chatId) => {
    return api.delete(`api/v1/chat-app/chats/group/${chatId}`)
}

// Get Group Chat details
const getGroupDetails = (chatId) => {
    return api.get(`api/v1/chat-app/chats/group/${chatId}`)
}

// Add new Particiapants to group chat
const addNewParticipantsToGroup = (chatId, participantId) => {
    return api.post(`api/v1/chat-app/chats/group/${chatId}/${participantId}`)
}

// Remove participants from group chat
const removeGroupParticipants = (chatId, participantId) => {
    return api.delete(`api/v1/chat-app/chats/group/${chatId}/${participantId}`)
}


export {
    loginUser,
    registerUser,
    logoutUser,
    getAllChats,
    getAvailableUsers,
    createUserChat,
    createGroupChat,
    changeGroupName,
    deleteOneOnOneChat,
    deleteGroup,
    getGroupDetails,
    addNewParticipantsToGroup,
    removeGroupParticipants,
}