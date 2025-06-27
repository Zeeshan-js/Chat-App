import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";

function Login() {
  const [data, setData] = useState({
    email: "",
    password: "",
  })

  const { login } = useAuth()

  const handleChange = (name) => (e) => {
    setData({ ...data, [name]: e.target.value })
  }


  const handleSubmit = async () => await login(data)
  



  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full h-1/2 max-w-sm border rounded-3xl p-4">
        <h2 className="text-center font-bold mb-4 text-2xl">Login</h2>

        <p className="text-xl font-semibold">Mock Login</p>
        <p>email:- <b>one@mail</b></p>
        <p>password:- <b>one</b></p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute top-3.5 left-3 text-gray-500" />
            <input
              className="w-full border rounded-lg focus:ring focus:ring-blue-600 p-3 pl-12"
              name='email'
              value={data.email}
              onChange={handleChange("email")}
              placeholder="email"
              type="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-500" />
            <input
              className="w-full border rounded-lg focus:ring focus:ring-blue-600 p-3 pl-12"
              value={data.password}
              onChange={handleChange("password")}
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
