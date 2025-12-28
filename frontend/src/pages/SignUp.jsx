import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

const SignUp = () => {
  const [Values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
  });

  const navigate = useNavigate(); 

  const change = (e) => {
    const { name, value } = e.target;
    setValues({
      ...Values,
      [name]: value,
    });
  };

  const submit = async () => {
    try {
      if (
        Values.username === "" ||
        Values.email === "" ||
        Values.password === "" ||
        Values.address === ""
      ) {
        alert("All fields are required");
      } else {
        const response = await axios.post("http://localhost:3000/api/user/sign-up", Values);
        alert(response.data.message);
        navigate("/Login"); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="h-auto min-h-screen bg-white flex items-center justify-center px-6 py-10">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-10 w-full md:w-3/6 lg:w-2/6 shadow-lg">
        <p className="text-red-700 text-2xl font-semibold text-center">Create an Account</p>

        {/* Username */}
        <div className="mt-6">
          <label htmlFor="username" className="text-red-600 font-medium">Username</label>
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

        {/* Email */}
        <div className="mt-4">
          <label htmlFor="email" className="text-red-600 font-medium">Email</label>
          <input
            type="email"
            className="w-full mt-2 border border-red-300 focus:border-red-500 rounded-md p-2 outline-none bg-white text-gray-800"
            placeholder="xyz@example.com"
            name="email"
            required
            value={Values.email}
            onChange={change}
          />
        </div>

        {/* Password */}
        <div className="mt-4">
          <label htmlFor="password" className="text-red-600 font-medium">Password</label>
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

        {/* Address */}
        <div className="mt-4">
          <label htmlFor="address" className="text-red-600 font-medium">Address</label>
          <textarea
            className="w-full mt-2 border border-red-300 focus:border-red-500 rounded-md p-2 outline-none bg-white text-gray-800"
            rows="4"
            placeholder="Enter your address"
            name="address"
            required
            value={Values.address}
            onChange={change}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition duration-200"
            onClick={submit}
          >
            Sign Up
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
