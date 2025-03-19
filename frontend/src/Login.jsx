import axios from "axios";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/user/login", { email, password })

      if (response.status === 200) {
        navigate("/main")
      }
    } catch (error) {
      console.log("Failed to login :", error)
    }
  }



  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full h-1/2 max-w-sm border rounded-3xl p-4">
        <h2 className="text-center font-bold mb-4 text-2xl">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute top-3.5 left-3 text-gray-500" />
            <input
              className="w-full border rounded-lg focus:ring focus:ring-blue-600 p-3 pl-12"
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              type="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-500" />
            <input
              className="w-full border rounded-lg focus:ring focus:ring-blue-600 p-3 pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
          </div>

          <button className="w-full border rounded-lg p-2 text-white cursor-pointer bg-blue-500 hover:bg-blue-600 transition">Login</button>
        </form>
        <p className="text-sm mt-5 text-center">Don't have an account <a href='/register' className="text-blue-600 underline">sign up</a> here</p>
      </div>
    </div>
  );
}

export default Login;
