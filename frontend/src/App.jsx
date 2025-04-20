import { useState } from "react";
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Chat from "./Chat.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <div>
      <Routes>
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
