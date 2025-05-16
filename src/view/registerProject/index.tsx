import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import { FC, useCallback, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import { createProject, fetchAllUsers } from "../../db/controller";
import uuid from "react-native-uuid";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/loadingSlice";
import { useFocusEffect } from "@react-navigation/native";

const RegisterProject: FC<RouterProps> = ({ navigation }) => {
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [responsible, setResponsible] = useState("");
  const dispatch = useDispatch();

  const saveProject = async () => {
    try {
      const user = await fetchAllUsers();
      if (user.length === 0) {
        throw new Error("Erro ao cadastrar, tente novamente");
      }
      await createProject({
        id: uuid.v4(),
        descricao_projeto: description,
        nome_projeto: name,
        fk_cliente: user[0].user_id,
        inicio: date
          ? (() => {
              const [d, m, y] = date.split("/").map(Number);
              return new Date(y, m - 1, d, 12).toISOString();
            })()
          : new Date().toISOString(),
        responsavel: responsible,
      });
      setSuccessModal(true);
    } catch (error) {
      console.log(error);
      dispatch(
        showError({
          message: "Erro ao cadastrar o projeto",
          title: "Por favor, tente novamente.",
        })
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        console.log("CavityScreen: Botão nativo de voltar pressionado!");
        navigation.navigate("CavityScreen");
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        console.log("CavityScreen: Removendo listener do botão de voltar.");
        subscription.remove();
      };
    }, [navigation])
  );


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
                navigation.navigate("ProjectScreen")
              }
              navigation={navigation}
            />
            <Divider />
            <View style={styles.bodyContainer}>
              <Input
                placeholder="Nome do Projeto"
                label="Nome"
                value={name}
                onChangeText={setName}
              />
              <Input
                placeholder="Nome do usuário"
                value={responsible}
                onChangeText={setResponsible}
                label="Usuário responsável"
              />
              <Input
                placeholder="Descreva"
                label="Descrição"
                value={description}
                onChangeText={setDescription}
              />
              <Input
                placeholder="DD/MM/AAAA"
                label="Data da Criação"
                keyboardType="numeric"
                mask="99/99/9999"
                value={date}
                onChangeTextMask={setDate}
              />
            </View>
            <View style={styles.buttonContainer}>
              <ReturnButton
                onPress={() => {
                  setName("");
                  setDescription("");
                  setDate("");
                  navigation.navigate("HomeScreen");
                }}
              />
              <NextButton
                onPress={saveProject}
                buttonTitle="Cadastrar"
                disabled={!name || !description}
              />
            </View>
          </View>
          <SuccessModal
            visible={successSuccessModal}
            title="Cadastro realizado com sucesso!"
            message="Seu projeto foi cadastrado com sucesso no sistema."
            onPress={() => {
              navigation.navigate("HomeScreen");
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
  bodyContainer: {
    flex: 1,
    width: "100%",
  },
});
