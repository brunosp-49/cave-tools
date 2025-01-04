import {
  Modal,
  Platform,
  StyleSheet,
  TextInput,
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
  optionsList: Array<{ id: string; value: string }> | [];
  onSubmitEditing?: () => void;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  customChildren?: React.ReactNode;
  label?: string;
  reduceSize?: boolean;
}

export const Select: FC<SelectProps> = ({
  label,
  placeholder,
  onChangeText,
  value,
  onSubmitEditing,
  required = false,
  hasError = false,
  errorMessage = "",
  optionsList,
  customChildren,
  reduceSize,
}) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={reduceSize ? styles.containerReduced : styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <TextInter color={colors.white[100]} weight="medium">
            {label}
            {required && " *"}
          </TextInter>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.inputContainer, hasError && styles.inputError]}
      >
        {customChildren ? (
          customChildren
        ) : (
          <>
            <View style={styles.input}>
              {value ? (
                <TextInter color={colors.white[100]}>{value}</TextInter>
              ) : (
                <TextInter color={colors.dark[60]}>{placeholder}</TextInter>
              )}
            </View>
            <View style={styles.visibilityToggle}>
              <Ionicons
                name={"chevron-down"}
                size={22}
                color={colors.white[100]}
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
      <Modal visible={modalVisible} transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalSubContainer}>
              <FlatList
                data={optionsList}
                keyExtractor={(item) => item.id}
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
                      {item.value}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    width: "100%",
    justifyContent: "space-between",
  },
  containerReduced: {
    height: 90,
    width: "100%",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark[80],
    borderRadius: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 58,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSubContainer: {
    backgroundColor: colors.dark[40],
    minHeight: "20%",
    maxHeight: "auto",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 24,
  },
  rowContainer: {
    height: 58,
    justifyContent: "center",
  },
});
