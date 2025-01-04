import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { updateCurrentStep } from "../../redux/cavitySlice";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";

const RegisterProject: FC<RouterProps> = ({ navigation }) => {
  const [successSuccessModal, setSuccessModal] = useState(false);
  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.container}>
            <Header
              title="Cadastrar Projeto"
              onCustomReturn={() =>
                navigation.navigate("Tabs", { screen: "Home" })
              }
              navigation={navigation}
            />
            <Divider />
            <View style={styles.bodyContainer}>
              <Input placeholder="Nome do Projeto" label="Nome" />
              <Input
                placeholder="Nome do usuário"
                label="Usuário responsável"
              />
              <Input placeholder="Descreva" label="Descrição" />
              <Input
                placeholder="DD/MM/AAAA"
                label="Data da Criação"
                keyboardType="numeric"
                mask="99/99/9999"
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonReturn}
                onPress={() => navigation.navigate("Tabs", { screen: "Home" })}
              >
                <TextInter color={colors.white[100]} weight="semi-bold">
                  Voltar
                </TextInter>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonNext}
                onPress={() => setSuccessModal(true)}
              >
                <TextInter color={colors.white[100]} weight="semi-bold">
                  Confirmar
                </TextInter>
              </TouchableOpacity>
            </View>
          </View>
          <SuccessModal
            visible={successSuccessModal}
            title="Cadastro realizado com sucesso!"
            message="Seu projeto foi cadastrado com sucesso no sistema."
            onPress={() => {
              navigation.navigate("Tabs", { screen: "Home" });
              setSuccessModal(false);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterProject;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
    paddingBottom: 25,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
  },
  buttonNext: {
    height: 58,
    width: "47%",
    backgroundColor: colors.accent[100],
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonReturn: {
    height: 58,
    width: "47%",
    backgroundColor: colors.dark[40],
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
  },
});
