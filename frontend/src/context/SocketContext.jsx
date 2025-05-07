import socketio from "socket.io-client";
import { LocalStorage } from "../utils/index.js";
import React, { createContext, useContext, useEffect, useState } from "react";

// Function to establish connect with authorization token
const getSocket = () => {
  const token = LocalStorage.get("token");

  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
  });
};

// Create a context to hold the initial socket instance
const SocketContext = createContext({ socket: null });

// Custom hook to access the socket instance from context
const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  // State variable to manage socket
  const [socket, setSocket] = useState(null);

  // set the socket initail value when the component mount
  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    // the value of this provider is socket state variable
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
