import { useState } from "react";
import "./App.css";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Chat from "./Chat.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { token, user } = useAuth()
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            token && user?._id ? (
              <Navigate to="/main"/>
            ) : (
              <Navigate to="/login"/>
            )
          }
        />

        {/* Route for registeration */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Route fro login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Route for Chat */}
        <Route
          path="/main"
          element={
            // A private for protectoin
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
