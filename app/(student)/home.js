import React, { useState } from "react";
import { View } from "react-native";
// 1. Import the modal component
import FitbitOnboardingModal from "../../components/FitbitOnboardingModal";

export default function Home() {
  const [isModalVisible, setIsModalVisible] = useState(true);

  // 2. Define what happens when they click "Connect Now"
  const handleFitbitConnect = () => {
    console.log("Starting Fitbit Auth Flow...");
    // Your WebBrowser.openAuthSessionAsync logic goes here
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Rest of your home screen content */}

      {/* 3. Place the Modal at the bottom of your JSX */}
      <FitbitOnboardingModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConnect={handleFitbitConnect}
      />
    </View>
  );
}
