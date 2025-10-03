import React from "react";

const BiometricCard = ({ icon, value, label }) => (
  <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm w-1/3 transition duration-150 transform hover:shadow-lg">
    <span className="text-3xl">{icon}</span>
    <span className="text-xl font-bold mt-2 text-gray-900">{value}</span>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);
