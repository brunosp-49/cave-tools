import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

interface InterTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  weight?: "regular" | "medium" | "semi-bold" | "bold";
  fontSize?: number;
  color?: string;
  numberOfLines?: number;
}

const TextInter: React.FC<InterTextProps> = ({
  children,
  style,
  weight = "regular", // Default weight is 'regular'
  fontSize = 15,
  color = "black",
  numberOfLines,
}) => {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Show loading state if fonts are not loaded yet
  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  // Choose the appropriate font family based on the `weight` prop
  let fontFamily;
  switch (weight) {
    case "medium":
      fontFamily = "Inter_500Medium";
      break;
    case "semi-bold":
      fontFamily = "Inter_600SemiBold";
    case "bold":
      fontFamily = "Inter_700Bold";
      break;
    default:
      fontFamily = "Inter_400Regular";
  }

  return (
    <Text
      textBreakStrategy="simple"
      numberOfLines={numberOfLines}
      style={[styles.text, { fontFamily, fontSize, color }, style]}
    >
      {children}
    </Text>
  );
};

// Default styles for the component (can be overridden by parent)
const styles = StyleSheet.create({
  text: {
    fontSize: 15,
  },
});

export default TextInter;
