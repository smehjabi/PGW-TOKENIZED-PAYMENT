import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { authActions } from "../redux/auth";
import { useDispatch } from 'react-redux';
import axios from 'axios'; 

const Login = () => {
  const [Values, setValues] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate(); 
  const dispatch = useDispatch();

  const change = (e) => {
    const { name, value } = e.target;
    setValues({
      ...Values,
      [name]: value,
    });
  };

  const submit = async () => {
    try {
      if (Values.username === "" || Values.password === "") {
        alert("All fields are required");
      } else {
        const response = await axios.post("http://localhost:3000/api/user/sign-in", Values);
        
        dispatch(authActions.login());
        dispatch(authActions.changeRole(response.data.role));
        
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);

        alert("Login successful!");
        navigate("/Profile"); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="h-auto min-h-screen bg-white flex items-center justify-center px-6 py-10">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-10 w-full md:w-3/6 lg:w-2/6 shadow-lg">
        <p className="text-red-700 text-2xl font-semibold text-center">Welcome Back</p>

        {/* Username */}
        <div className="mt-6">
          <label htmlFor="username" className="text-red-600 font-medium">
            Username
          </label>
          <input
            type="text"
            className="w-full mt-2 border border-red-300 focus:border-red-500 rounded-md p-2 outline-none bg-white text-gray-800"
            placeholder="Enter your username"
            name="username"
            required
            value={Values.username}
            onChange={change}
          />
        </div>

        {/* Password */}
        <div className="mt-4">
          <label htmlFor="password" className="text-red-600 font-medium">
            Password
          </label>
          <input
            type="password"
            className="w-full mt-2 border border-red-300 focus:border-red-500 rounded-md p-2 outline-none bg-white text-gray-800"
            placeholder="Enter your password"
            name="password"
            required
            value={Values.password}
            onChange={change}
          />
        </div>

        {/* Button */}
        <div className="mt-6">
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition duration-200"
            onClick={submit}
          >
            Log In
          </button>
        </div>

        {/* Sign up link */}
        <div className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-red-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
