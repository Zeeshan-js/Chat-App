import { useState } from "react";
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Component from "./Component.jsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/main" element={<Component />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
