import axios from "axios";
import { LocalStorage } from "../utils/index.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// Add an interceptor to set authorization with user token before requests
api.interceptors.request.use(
  function (config) {
    // get the user token from local storage
    const token = LocalStorage.get("token");
    // Set authorization header with bearer token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const loginUser = (data) => {
  return api.post("/user/login", data);
};

const registerUser = (data = { username, email, password }) => {
  return api.post("/user/register", data);
};

const logoutUser = () => {
  return api.post("/logout");
};

const getAllChats = () => {
  return api.get("chat-app/chats");
};

const getAvailableUsers = () => {
  return api.get("chat-app/chats/users");
};

// create a new chat
const createUserChat = (recieverId) => {
  return api.post(`chat-app/chats/c/${recieverId}`);
};

// create new group chat
const createGroupChat = (data = { name, participants: [] }) => {
  // The data is required for the group chat which contains name and participants
  return api.post("chat-app/chats/group", data);
};

// Api call to change group name
const changeGroupName = (chatId, name) => {
  return api.patch(`chat-app/chats/group/${chatId}`, { name });
};

// Delete one on one chat
const deleteOneOnOneChat = (chatId) => {
  return api.delete(`chat-app/chats/remove/${chatId}`);
};

// Delete Group chat
const deleteGroup = (chatId) => {
  return api.delete(`chat-app/chats/group/${chatId}`);
};

// Get Group Chat details
const getGroupDetails = (chatId) => {
  return api.get(`chat-app/chats/group/${chatId}`);
};

// Add new Particiapants to group chat
const addNewParticipantsToGroup = (chatId, participantId) => {
  return api.post(`chat-app/chats/group/${chatId}/${participantId}`);
};

// Remove participants from group chat
const removeGroupParticipants = (chatId, participantId) => {
  return api.delete(`chat-app/chats/group/${chatId}/${participantId}`);
};

// Api for deleting message
const deleteChatMessage = (chatId, messageId) => {
  return api.delete(`chat-app/messages/${chatId}/${messageId}`);
};

const getChatMessage = (chatId) => {
  return api.get(`chat-app/messages/${chatId}`);
};

// send message
const sendMessageToChat = (chatId, content, attachment) => {
  // form to handle both content and attachment form users
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  // we map through the attachment array and append it in the form
  attachment?.map((file) => formData.append("attachment", file));

  return api.post(`chat-app/messages/${chatId}`, formData);
};

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
  getChatMessage,
  deleteChatMessage,
  sendMessageToChat,
};
