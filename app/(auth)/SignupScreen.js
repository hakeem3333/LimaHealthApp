import React, { useState } from "react";

const SignupScreen = ({ onNavigateToLogin, navigate }) => {
  const { signup, consentGiven, setConsentGiven } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const canSignup = userName && password && consentGiven;

  const handleSignup = () => {
    signup();
    navigate("dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Join BioAware</h1>
      <p className="text-gray-500 mb-6">Create your account</p>
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
      <div className="flex items-center w-full max-w-sm mb-6">
        <input
          type="checkbox"
          className="form-checkbox text-indigo-600 w-6 h-6 rounded-md focus:ring-2 focus:ring-indigo-500"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
        />
        <span className="ml-3 text-sm text-gray-600">
          I consent to my data being shared with counselors.
        </span>
      </div>
      <button
        className={`w-full max-w-sm h-12 text-white font-bold rounded-xl shadow-lg transition duration-200 ${
          !canSignup
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        onClick={handleSignup}
        disabled={!canSignup}
      >
        Sign Up
      </button>
      <button
        className="mt-4 text-indigo-600 hover:underline"
        onClick={() => onNavigateToLogin()}
      >
        Already have an account? Log in
      </button>
    </div>
  );
};
