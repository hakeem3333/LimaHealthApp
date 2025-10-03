import React, { useState, useEffect } from "react";

const RootAppLayout = () => {
  const { isLoggedIn, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("login"); // Simulates Expo Router state
  const [moods, setMoods] = useState([]);
  const [showSplash, setShowSplash] = useState(true);
  const [biometricData] = useState({
    steps: 8543,
    heartRate: 78,
    sleep: 7.5,
  });

  // Simulate startup load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Central state update logic
  const handleMoodSave = (newMood, newMoodNote) => {
    if (newMood) {
      const moodLog = {
        mood: newMood,
        note: newMoodNote,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
      setMoods([...moods, moodLog]);
      setCurrentScreen("dashboard");
    }
  };

  const renderNavbar = () => {
    // This would typically be defined in the main Tab Navigator layout
    const navItems = [
      { name: "dashboard", icon: "🏠", activeIcon: "🏡" },
      { name: "trends", icon: "📈", activeIcon: "📊" },
      { name: "resources", icon: "💡", activeIcon: "🧠" },
      { name: "settings", icon: "⚙️", activeIcon: "⚙️" },
    ];

    // Mood Log is often presented as a modal or special button, but here we treat it as a nav item for simplicity
    const handleNavClick = (name) => {
      if (name === "moodLog") {
        // In a real app: router.push('/moodLog', {modal: true})
        setCurrentScreen("moodLog");
      } else {
        // In a real app: router.replace('/' + name)
        setCurrentScreen(name);
      }
    };

    return (
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-lg flex justify-around items-center border-t border-gray-200 z-10">
        {navItems.map((item) => (
          <button
            key={item.name}
            className="flex flex-col items-center p-2 transform transition duration-150 hover:scale-105"
            onClick={() => handleNavClick(item.name)}
          >
            <span className="text-2xl">
              {currentScreen === item.name ? item.activeIcon : item.icon}
            </span>
            <span
              className={`text-xs mt-1 font-semibold ${
                currentScreen === item.name
                  ? "text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </span>
          </button>
        ))}
        {/* Special Mood Log button that acts like a route */}
        <button
          className="flex flex-col items-center p-2 transform transition duration-150 hover:scale-105"
          onClick={() => handleNavClick("moodLog")}
        >
          <span className="text-2xl">🙂</span>
          <span
            className={`text-xs mt-1 font-semibold ${
              currentScreen === "moodLog" ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            Log Mood
          </span>
        </button>
      </nav>
    );
  };

  const renderScreen = () => {
    // Expo Router logic: If not logged in, render the (auth) group screens
    if (!isLoggedIn) {
      if (currentScreen === "login") {
        return (
          <LoginScreen
            navigate={setCurrentScreen}
            onNavigateToSignup={() => setCurrentScreen("signup")}
          />
        );
      } else {
        // Default to signup if not explicitly navigating to login
        return (
          <SignupScreen
            navigate={setCurrentScreen}
            onNavigateToLogin={() => setCurrentScreen("login")}
          />
        );
      }
    }

    // Expo Router logic: If logged in, render the main tab/stack screens
    switch (currentScreen) {
      case "dashboard":
        return (
          <DashboardScreen
            moods={moods}
            biometricData={biometricData}
            onNavigateToMoodLog={() => setCurrentScreen("moodLog")}
          />
        );
      case "moodLog":
        // Note: In Expo Router, this would likely be a full-screen modal
        return (
          <MoodLogScreen
            onSave={handleMoodSave}
            onNavigateBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "trends":
        return <TrendsScreen moods={moods} />;
      case "resources":
        return <ResourcesScreen />;
      case "settings":
        return <SettingsScreen onLogout={() => setCurrentScreen("login")} />;
      default:
        // Fallback for an unknown route
        return (
          <div className="min-h-screen p-6 bg-red-100 text-red-800">
            404 - Screen Not Found
          </div>
        );
    }
  };

  const renderSplashScreen = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-indigo-600 z-50 transition-opacity duration-1000">
        <h1 className="text-white text-5xl font-extrabold animate-pulse">
          BioAware
        </h1>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {showSplash && renderSplashScreen()}
      <div className={`${showSplash ? "hidden" : "block"}`}>
        {renderScreen()}
        {isLoggedIn && renderNavbar()}
      </div>
    </div>
  );
};
