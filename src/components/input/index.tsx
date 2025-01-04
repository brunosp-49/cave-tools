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

interface InputProps {
  label: string;
  placeholder: string;
  RightLinkIsActive?: boolean;
  onChangeText?: (text: string) => void;
  RightLinkText?: string;
  onRightLinkPress?: () => void;
  onChangeTextMask?: (empty: string, text: string) => void;
  value?: string;
  keyboardType?: KeyboardType;
  onSubmitEditing?: () => void;
  secureTextEntry?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  mask?: string;
}

export const Input: FC<InputProps> = ({
  label,
  placeholder,
  RightLinkIsActive,
  RightLinkText,
  onRightLinkPress,
  onChangeText,
  onChangeTextMask,
  value,
  keyboardType,
  onSubmitEditing,
  secureTextEntry = false,
  required = false,
  hasError = false,
  errorMessage = "",
  onBlur,
  mask,
}) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  const toggleVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <TextInter color={colors.white[100]} weight="medium">
          {label}
          {required && " *"}
        </TextInter>
        {RightLinkIsActive && (
          <TouchableOpacity
            onPress={onRightLinkPress ? onRightLinkPress : () => {}}
          >
            <TextInter color={colors.accent[100]} weight="medium">
              {RightLinkText}
            </TextInter>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.inputContainer, hasError && styles.inputError]}>
        {onChangeTextMask ? (
          <MaskedTextInput
            style={[styles.input, { fontFamily: "Inter_500Medium" }]}
            placeholder={placeholder}
            placeholderTextColor={colors.dark[60]}
            onChangeText={onChangeTextMask}
            value={value}
            keyboardType={keyboardType}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={isPasswordVisible}
            onBlur={onBlur}
            mask={mask}
          />
        ) : (
          <TextInput
            style={[styles.input, { fontFamily: "Inter_500Medium" }]}
            placeholder={placeholder}
            placeholderTextColor={colors.dark[60]}
            onChangeText={onChangeText}
            value={value}
            keyboardType={keyboardType}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={isPasswordVisible}
            onBlur={onBlur}
          />
        )}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={toggleVisibility}
            style={styles.visibilityToggle}
          >
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={24}
              color={colors.white[100]}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.errorContainer}>
        <TextInter color={colors.error[100]} weight="medium" fontSize={11}>
          {hasError && errorMessage}
        </TextInter>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: "100%",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark[80],
    marginTop: 4,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 58,
    paddingHorizontal: 24,
    fontSize: 15,
    color: colors.white[100],
  },
  inputError: {
    borderColor: colors.error[100],
    borderWidth: 1,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  visibilityToggle: {
    width: "15%",
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 24,
    width: "100%",
    justifyContent: "center",
  },
});
