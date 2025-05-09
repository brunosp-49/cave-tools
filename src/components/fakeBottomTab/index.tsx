import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../../assets/colors";
import PlusIcon from "../icons/plusIcon";
import useKeyboard from "../../hook";
import React from "react";

interface Props {
  onPress: () => void;
}

export const FakeBottomTab: React.FC<Props> = ({ onPress }) => {
  const isKeyboardOpen = useKeyboard();
  return (
    <>
      {!isKeyboardOpen && (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.buttonContainerCircle}
              onPress={onPress}
            >
              <PlusIcon />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark[100],
    height: Platform.OS === "ios" ? 110 : 84,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: Platform.OS === "ios" ? "flex-end" : "center",
    alignSelf: "center",
  },
  buttonContainerCircle: {
    backgroundColor: colors.accent[100],
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 58 / 2,
  },
});
