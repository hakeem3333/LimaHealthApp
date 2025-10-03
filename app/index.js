import React from "react";

const DashboardScreen = ({ moods, biometricData, onNavigateToMoodLog }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h1>
      <div className="bg-teal-50 p-6 rounded-2xl shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          How are you feeling?
        </h2>
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md mb-4 transition duration-200 transform hover:scale-[1.01]"
          onClick={onNavigateToMoodLog}
        >
          + Log Your Mood
        </button>
        <h3 className="text-md font-semibold text-gray-600 mb-3">
          Recent Moods
        </h3>
        {moods.length > 0 ? (
          <div className="flex flex-wrap justify-around bg-teal-200 rounded-xl p-4">
            {moods.slice(-5).map((log, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-4xl">{log.mood}</span>
                <span className="text-xs text-gray-600 mt-1">{log.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">
            No recent moods. Log one now!
          </p>
        )}
      </div>
      <div className="bg-purple-50 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Your Biometrics
        </h2>
        <div className="flex justify-between items-center space-x-3">
          <BiometricCard icon="👣" value={biometricData.steps} label="Steps" />
          <BiometricCard
            icon="❤️"
            value={biometricData.heartRate}
            label="BPM"
          />
          <BiometricCard
            icon="🛌"
            value={biometricData.sleep}
            label="Hrs Sleep"
          />
        </div>
      </div>
    </div>
  );
};
