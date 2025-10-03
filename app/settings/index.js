const SettingsScreen = ({ onLogout }) => {
  const { consentGiven, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout(); // Navigates back to the 'login' screen
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Settings</h1>
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 transition duration-150 hover:shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 border-gray-100">
          Device Connection
        </h2>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-800">Connect a Biometric Device</span>
          <span className="text-gray-500 font-bold text-xl">&gt;</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-gray-800">Disconnect Device</span>
          <span className="text-gray-500 font-bold text-xl">&gt;</span>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md transition duration-150 hover:shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 border-gray-100">
          Privacy
        </h2>
        <div className="flex justify-between items-center py-3">
          <span className="text-gray-800">Consent Status</span>
          <span
            className={`font-bold text-sm p-1 rounded-full px-3 ${
              consentGiven
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {consentGiven ? "Consent Given" : "No Consent"}
          </span>
        </div>
      </div>
      <button
        className="w-full mt-6 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition duration-200 transform hover:scale-[1.01]"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
};
