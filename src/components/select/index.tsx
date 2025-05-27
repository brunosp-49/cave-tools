import {
  Modal,
  Platform,
  StyleSheet,
  // TextInput, // TextInput não é usado diretamente aqui
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { FlatList } from "react-native-gesture-handler";

interface SelectProps {
  placeholder: string;
  onChangeText: (chosen: { id: string; value: string }) => void;
  value: string;
  optionsList: Array<any> | []; // Considere tipar 'any' mais especificamente se possível
  onSubmitEditing?: () => void;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  customChildren?: React.ReactNode;
  label?: string;
  reduceSize?: boolean;
  disabled?: boolean; // <-- Prop 'disabled' adicionada aqui
}

export const Select: FC<SelectProps> = ({
  label,
  placeholder,
  onChangeText,
  value,
  // onSubmitEditing, // Não usado no componente Select
  required = false,
  hasError = false,
  errorMessage = "",
  optionsList,
  customChildren,
  reduceSize,
  disabled = false, // <-- Valor padrão para 'disabled'
}) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [modalVisible, setModalVisible] = useState(false);

  // Não é necessário ActivityIndicator aqui se as fontes já são carregadas globalmente
  // ou se o impacto de um pequeno flash de fonte padrão é aceitável.
  // if (!fontsLoaded) {
  //   return <ActivityIndicator size="small" />; // Ou null
  // }

  return (
    <View style={reduceSize ? styles.containerReduced : styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <TextInter color={disabled ? colors.dark[60] : colors.white[100]} weight="medium">
            {label}
            {required && " *"}
          </TextInter>
        </View>
      )}
      <TouchableOpacity
        onPress={() => {
          if (!disabled) { // Só abre o modal se não estiver desabilitado
            setModalVisible(true);
          }
        }}
        style={[
            styles.inputContainer,
            hasError && styles.inputError,
            disabled && styles.disabledInputContainer, // Estilo para desabilitado
        ]}
        disabled={disabled} // Prop disabled para TouchableOpacity
      >
        {customChildren ? (
          customChildren
        ) : (
          <>
            <View style={styles.input}>
              {value ? (
                <TextInter color={disabled ? colors.dark[60] : colors.white[100]}>{value}</TextInter>
              ) : (
                <TextInter color={colors.dark[60]}>{placeholder}</TextInter>
              )}
            </View>
            <View style={styles.visibilityToggle}>
              <Ionicons
                name={"chevron-down"}
                size={22}
                color={disabled ? colors.dark[60] : colors.white[100]}
              />
            </View>
          </>
        )}
      </TouchableOpacity>
      <View style={styles.errorContainer}>
        <TextInter color={colors.error[100]} weight="medium" fontSize={11}>
          {hasError && errorMessage}
        </TextInter>
      </View>
      {!disabled && ( // Só renderiza o Modal se não estiver desabilitado
        <Modal visible={modalVisible} transparent>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalSubContainer}>
                <FlatList
                  data={optionsList}
                  keyExtractor={(item) => String(item.id)} // Garante que a chave é string
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        onChangeText(item);
                        setModalVisible(false);
                      }}
                      style={styles.rowContainer}
                    >
                      <TextInter
                        color={colors.white[100]}
                        weight="medium"
                        fontSize={17}
                      >
                        {item.label ? item.label : item.value}
                      </TextInter>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View
                      style={{ height: 0.5, backgroundColor: colors.dark[50] }}
                    />
                  )}
                  ListFooterComponent={() => <View style={{ height: 24 }} />}
                  ListHeaderComponent={() => (
                    <View
                      style={{
                        height:
                          Platform.OS === "ios" && optionsList.length > 12
                            ? 55
                            : 5,
                      }}
                    />
                  )}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Ajustado para ser mais dinâmico, a altura fixa pode causar problemas com mensagens de erro
    width: "100%",
    marginBottom: 10, // Adicionado marginBottom para espaçamento
  },
  containerReduced: {
    // height: 90, // Similarmente, altura dinâmica é melhor
    width: "100%",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark[80],
    borderRadius: 10,
    marginTop: 4, // Espaço entre label e input
    minHeight: 58, // Altura mínima para consistência
  },
  disabledInputContainer: { // Novo estilo para quando desabilitado
    backgroundColor: colors.dark[70], // Cor de fundo diferente
    opacity: 0.7, // Opacidade para indicar desabilitação
  },
  input: {
    flex: 1,
    minHeight: 58, // Garante que o toque funcione bem
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  inputError: {
    borderColor: colors.error[100],
    borderWidth: 1,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: 8, // Removido, marginTop no inputContainer lida com isso
  },
  visibilityToggle: {
    // width: "15%", // Removido para ser mais flexível
    paddingHorizontal: 15, // Padding para o ícone
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    minHeight: 20, // Altura mínima para a mensagem de erro
    marginTop: 2,
    justifyContent: "flex-start",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSubContainer: {
    backgroundColor: colors.dark[40],
    minHeight: "20%", // Altura mínima
    maxHeight: "60%", // Altura máxima para não cobrir a tela inteira
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 24,
  },
  rowContainer: {
    height: 58,
    justifyContent: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.white[20],
  },
});

