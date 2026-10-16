import { Alert, Platform } from "react-native";

// react-native-web's Alert.alert is an empty no-op, so on web these fall back
// to the browser's own dialogs.

/**
 * Two-button confirmation dialog.
 */
export const confirmAction = ({
  title, message, confirmText = "OK", cancelText = "Cancel", destructive = false, onConfirm,
}) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: destructive ? "destructive" : "default", onPress: onConfirm },
  ]);
};

/**
 * One-button informational dialog.
 */
export const showMessage = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};
