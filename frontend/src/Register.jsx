import axios from "axios";
import { Upload, User, Mail, Lock, ConstructionIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",
  });

  const { username, email, password, avatar } = formData;

  const { register } = useAuth()

  const handleClick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("avatar", formData.avatar);

    try {
      const response = register(data)
    } catch (error) {
      console.log("Error while registering user :", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md border p-6 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl mb-3 font-bold text-center ">Register</h2>
        {/* Avatar section */}
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-gray-300 border-gray-500 rounded-full cursor-pointer">
          <label htmlFor="fname">
            <input
              id="fname"
              type="file"
              onChange={handleClick}
              accept="image/*"
              className="hidden"
            />
            {formData.avatar ? (
              <img
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                src={URL.createObjectURL(formData.avatar)}
                alt=""
              />
            ) : (
              <div>
                <Upload className="cursor-pointer w-8 h-8 text-gray-500" />
              </div>
            )}
          </label>
        </div>

        {/* input form */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 p-3 border rounded-lg focus:ring focus:ring-blue-400"
              name="username"
              value={username}
              onChange={handleChange}
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 p-3 border rounded-lg focus:ring focus:ring-blue-400"
              name="email"
              value={email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 p-3 border rounded-lg focus:ring focus:ring-blue-400"
              name="password"
              value={password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
            />
          </div>

          <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
            Register
          </button>
        </form>
        <p className="text-sm mt-3">
          Already have an accont{" "}
          <a href="/login" className="text-blue-600 underline">
            sign in
          </a>{" "}
          here
        </p>
      </div>
    </div>
  );
}

export default Register;
