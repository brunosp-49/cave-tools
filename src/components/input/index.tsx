import {
  ActivityIndicator,
  KeyboardType,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors"; // Ajuste o caminho se necessário
import TextInter from "../textInter"; // Ajuste o caminho se necessário
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter"; // Verifique se essas fontes estão sendo usadas ou podem ser removidas se useFonts não for essencial aqui
import { FC, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaskedTextInput } from "react-native-mask-text";

interface InputProps {
  label: string;
  placeholder: string;
  RightLinkIsActive?: boolean;
  onChangeText?: (text: string) => void;
  RightLinkText?: string;
  onRightLinkPress?: () => void;
  onChangeTextMask?: (formatted: string, extracted?: string) => void;
  value?: string;
  keyboardType?: KeyboardType;
  onSubmitEditing?: () => void;
  secureTextEntry?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  mask?: string;
  disabled?: boolean;
  numberOfLines?: number;
  autoCapitalize?: boolean;
  numericType?: "integer" | "decimal";
  decimalPlaces?: number;
}

const cleanAndFormatNumericString = (
  textInput: string | undefined | null,
  numericType?: "integer" | "decimal",
  decimalPlacesForTyping: number = 2
): string => {
  const text = String(textInput || "");

  if (numericType === "integer") {
    return text.replace(/[^0-9]/g, "");
  } else if (numericType === "decimal") {
    let tempText = text.replace(",", ".");
    let cleanText = "";
    let hasDecimalPoint = false;
    for (const char of tempText) {
      if (char >= "0" && char <= "9") {
        cleanText += char;
      } else if (char === "." && !hasDecimalPoint) {
        cleanText += char;
        hasDecimalPoint = true;
      }
    }
    tempText = cleanText;

    if (hasDecimalPoint && tempText.includes(".")) {
      const parts = tempText.split(".");
      const integerPartVal = parts[0];
      let fractionalPartVal = parts[1] || "";
      if (fractionalPartVal.length > decimalPlacesForTyping) {
        fractionalPartVal = fractionalPartVal.substring(
          0,
          decimalPlacesForTyping
        );
      }
      tempText = `${integerPartVal}.${fractionalPartVal}`;
    }

    // Não força "0." ou remove zeros à esquerda da parte inteira aqui,
    // pois isso é para digitação ao vivo e pode ser disruptivo.
    // Apenas a limpeza mais básica.
    // O "0." e a formatação de zeros à esquerda serão feitos no toFixed ou na lógica final.
    return tempText;
  }
  return text;
};

// Função para aplicar a formatação final (ex: com toFixed)
const finalizeDecimalFormat = (
  numStr: string | undefined | null,
  decimalPlacesToFix: number = 2
): string => {
  const text = String(numStr || "");
  if (text.trim() === "") return ""; // Retorna vazio se a entrada for vazia

  // Tenta converter para número. A limpeza anterior deve ajudar.
  // parseFloat lida bem com "123", "123.", "0", ".5" (que cleanAndFormatNumericString não produz)
  let initialCleaned = text.replace(",", "."); // Garante ponto
  // Garante que não haja múltiplos pontos antes do parseFloat
  const firstDot = initialCleaned.indexOf(".");
  if (firstDot !== -1) {
    const beforeDot = initialCleaned.substring(0, firstDot).replace(/\./g, "");
    const afterDot = initialCleaned.substring(firstDot + 1).replace(/\./g, "");
    initialCleaned = `${beforeDot}.${afterDot}`;
  } else {
    initialCleaned = initialCleaned.replace(/\./g, "");
  }

  const num = parseFloat(initialCleaned);

  if (!isNaN(num)) {
    return num.toFixed(decimalPlacesToFix);
  }
  // Se não for um número válido após a tentativa de limpeza, retorna a string limpa por cleanAndFormatNumericString
  // ou a string original se a limpeza não for suficiente.
  // Para o caso de "600" ou "0", parseFloat vai funcionar.
  return cleanAndFormatNumericString(text, "decimal", decimalPlacesToFix); // fallback para limpeza básica se toFixed falhar
};

export const Input: FC<InputProps> = ({
  label,
  placeholder,
  RightLinkIsActive,
  RightLinkText,
  onRightLinkPress,
  onChangeText,
  onChangeTextMask,
  value,
  keyboardType: parentKeyboardType,
  onSubmitEditing,
  secureTextEntry = false,
  required = false,
  hasError = false,
  errorMessage = "",
  onBlur: parentOnBlur,
  mask,
  disabled = false,
  numberOfLines = 1,
  autoCapitalize,
  numericType,
  decimalPlaces = 2,
}) => {
  // O hook useFonts pode causar re-renderizações. Se as fontes já estiverem carregadas globalmente,
  // talvez não seja necessário aqui, a menos que este componente seja usado muito isoladamente.
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  useEffect(() => {
    if (
      numericType === "decimal" &&
      onChangeText &&
      typeof value === "string"
    ) {
      const initialCleaned = cleanAndFormatNumericString(
        value,
        "decimal",
        decimalPlaces
      );
      const finalFormattedValue = finalizeDecimalFormat(
        initialCleaned,
        decimalPlaces
      );

      // By removing the following 'if' block or just the onChangeText call,
      // this effect will no longer try to force a format change during typing.
      if (finalFormattedValue !== value) {
        // onChangeText(finalFormattedValue); // <-- THIS LINE IS COMMENTED OUT/REMOVED
      }
    } else if (
      numericType === "integer" &&
      onChangeText &&
      typeof value === "string"
    ) {
      const finalFormattedValue = cleanAndFormatNumericString(value, "integer");
    }
  }, [value, numericType, decimalPlaces, onChangeText]);

  const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const handleTextChange = (text: string) => {
    if (!onChangeText) return;
    // Durante a digitação, usa a limpeza mais flexível
    const processedText = cleanAndFormatNumericString(
      text,
      numericType,
      decimalPlaces
    );
    onChangeText(processedText);
  };

  // Handler para o onBlur interno
  const internalOnBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (
      numericType === "decimal" &&
      onChangeText &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      // Ao perder o foco, aplica a formatação final com toFixed
      const finalFormattedValue = finalizeDecimalFormat(value, decimalPlaces);
      if (finalFormattedValue !== value) {
        // Só atualiza se houver mudança
        onChangeText(finalFormattedValue);
      }
    } else if (
      numericType === "decimal" &&
      onChangeText &&
      (value === undefined || value === null || value.trim() === "")
    ) {
      // Se o campo decimal estiver vazio ao perder o foco, pode-se definir para "0.00"
      // onChangeText("0.00"); // DESCOMENTE SE QUISER ESTE COMPORTAMENTO
    }

    if (parentOnBlur) {
      parentOnBlur(); // Chama o onBlur original do pai
    }
  };

  const finalKeyboardType: KeyboardType = numericType
    ? numericType === "decimal"
      ? "decimal-pad"
      : "numeric"
    : parentKeyboardType || "default";

  let finalAutoCapitalize: "none" | "sentences" | "words" | "characters";
  if (numericType) {
    finalAutoCapitalize = "none";
  } else {
    finalAutoCapitalize = autoCapitalize ? "none" : "sentences";
  }

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <TextInter color={colors.white[100]} weight="medium">
          {label}
          {required && " *"}
        </TextInter>
        {RightLinkIsActive && (
          <TouchableOpacity onPress={onRightLinkPress || (() => {})}>
            <TextInter color={colors.accent[100]} weight="medium">
              {RightLinkText}
            </TextInter>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputError,
          disabled && styles.disabledInputContainer,
        ]}
      >
        {onChangeTextMask && mask ? (
          <MaskedTextInput
            style={[
              styles.input,
              { fontFamily: "Inter_500Medium" },
              disabled && styles.disabledInputText,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.dark[60]}
            onChangeText={onChangeTextMask}
            value={value}
            keyboardType={finalKeyboardType}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={secureTextEntry && isPasswordVisible}
            onBlur={internalOnBlur}
            mask={mask}
            editable={!disabled}
            numberOfLines={numberOfLines}
            autoCapitalize={finalAutoCapitalize}
          />
        ) : (
          <TextInput
            style={[
              styles.input,
              { fontFamily: "Inter_500Medium" },
              disabled && styles.disabledInputText,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.dark[60]}
            onChangeText={handleTextChange}
            value={value}
            keyboardType={finalKeyboardType}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={secureTextEntry && isPasswordVisible}
            onBlur={internalOnBlur}
            editable={!disabled}
            numberOfLines={numberOfLines}
            textAlignVertical={
              numberOfLines && numberOfLines > 1 ? "top" : "center"
            }
            multiline={Boolean(numberOfLines && numberOfLines > 1)}
            autoCapitalize={finalAutoCapitalize}
          />
        )}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={toggleVisibility}
            style={styles.visibilityToggle}
            disabled={disabled}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color={disabled ? colors.dark[60] : colors.white[100]}
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
    // height: 120, // Altura pode ser dinâmica baseada no erro e no numberOfLines
    width: "100%",
    marginBottom: 10,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark[80],
    borderRadius: 10,
  },
  disabledInputContainer: {
    backgroundColor: colors.dark[70],
  },
  inputError: {
    borderColor: colors.error[100],
  },
  input: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 24,
    fontSize: 15,
    color: colors.white[100],
    paddingVertical: Platform.OS === "ios" ? 18 : 10,
  },
  disabledInputText: {
    color: colors.dark[60],
  },
  visibilityToggle: {
    paddingHorizontal: 15,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    height: 20,
    marginTop: 2,
    justifyContent: "flex-start",
  },
});
