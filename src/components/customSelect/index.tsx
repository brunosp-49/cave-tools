import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import TextInter from "../textInter";
import { FC, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
interface CustomSelectProps {
  label: string;
  optionsList: Array<{ id: string; value: string; onPress: () => void }> | [];
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  children?: React.ReactNode;
}

export const CustomSelect: FC<CustomSelectProps> = ({
  label,
  required = false,
  hasError = false,
  errorMessage = "",
  optionsList,
  children,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <TextInter color={colors.white[100]} weight="medium">
          {label}
          {required && " *"}
        </TextInter>
      </View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.inputContainer, hasError && styles.inputError]}
      >
        {children}
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
                      item.onPress();
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
    minHeight: 120,
    width: "100%",
    justifyContent: "space-between",
  },
  inputContainer: {
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
