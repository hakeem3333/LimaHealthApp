import React, { useState } from "react";

const LoginScreen = ({ onNavigateToSignup, navigate }) => {
  const { login } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    login();
    navigate("dashboard"); // Simulate navigation to the main stack after login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
      <p className="text-gray-500 mb-6">Sign in to continue</p>
      <input
        className="w-full max-w-sm h-12 bg-gray-200 rounded-xl px-4 mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
        type="text"
        placeholder="Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        className="w-full max-w-sm h-12 bg-gray-200 rounded-xl px-4 mb-6 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full max-w-sm h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition duration-200"
        onClick={handleLogin}
      >
        Log In
      </button>
      <button
        className="mt-4 text-indigo-600 hover:underline"
        onClick={() => onNavigateToSignup()}
      >
        Don't have an account? Sign up
      </button>
    </div>
  );
};
