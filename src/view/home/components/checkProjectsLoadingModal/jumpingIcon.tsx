import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../assets/colors";

const JumpingIcon: React.FC = () => {
  const jumpAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(jumpAnimation, {
          toValue: -10, // Move up by 10 units
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnimation, {
          toValue: 0, // Move back to the original position
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [jumpAnimation]);

  return (
    <Animated.View style={{ transform: [{ translateY: jumpAnimation }] }}>
      <Ionicons name="cloud-download" color={colors.accent[100]} size={70} />
    </Animated.View>
  );
};

export default JumpingIcon;
