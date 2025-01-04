import {
  KeyboardType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import TextInter from "../textInter";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { FC, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaskedTextInput } from "react-native-mask-text";

interface SearchProps {
  placeholder: string;
  onChangeText?: (text: string) => void;
  value?: string;
  keyboardType?: KeyboardType;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const Search: FC<SearchProps> = ({
  placeholder,
  onChangeText,
  value,
  keyboardType,
  onSubmitEditing,
  onBlur,
  autoFocus,
}) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Ionicons name="search" color={colors.dark[60]} size={22} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { fontFamily: "Inter_500Medium" }]}
          placeholder={placeholder}
          placeholderTextColor={colors.dark[60]}
          onChangeText={onChangeText}
          value={value}
          keyboardType={keyboardType}
          onSubmitEditing={onSubmitEditing}
          onBlur={onBlur}
          autoFocus={autoFocus}
        />
      </View>
      <View style={styles.spaceContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    width: "100%",
    justifyContent: "center",
  },
  input: {
    height: 58,
    flex: 1,
    paddingLeft: 8,
    paddingRight: 24,
    fontSize: 15,
    color: colors.white[100],
  },
  inputContainer: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.dark[80],
    borderRadius: 10,
  },
  spaceContainer: {
    height: 24,
    width: "100%",
    justifyContent: "center",
  },
  buttonContainer: {
    paddingLeft: 24,
  },
});
