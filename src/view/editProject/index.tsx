import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import { FC, useCallback, useEffect, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import {
  createProject,
  fetchAllUsers,
  updateProject,
} from "../../db/controller";
import uuid from "react-native-uuid";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/loadingSlice";
import { database } from "../../db";
import Project from "../../db/model/project";
import TextInter from "../../components/textInter";
import { formatDateToInput } from "../../util";
import { useFocusEffect } from "@react-navigation/native";

const EditProject: FC<RouterProps> = ({ navigation, route }) => {
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [responsible, setResponsible] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const dispatch = useDispatch();

  const saveProject = async () => {
    try {
      const user = await fetchAllUsers();
      if (user.length === 0) {
        throw new Error("Erro ao cadastrar, tente novamente");
      }
      await updateProject(route.params.projectId, {
        id: route.params.projectId,
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
          message: "Erro ao editar o projeto",
          title: "Por favor, tente novamente.",
        })
      );
    }
  };

  const fetchProject = useCallback(async () => {
    // Use useCallback
    if (!route.params.projectId) {
      setError("ID do projeto não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const projectCollection = database.collections.get<Project>("project");
      const foundProject = await projectCollection.find(route.params.projectId);
      setProject(foundProject);
      setName(foundProject.nome_projeto || "");
      setDescription(foundProject.descricao_projeto || "");
      setDate(formatDateToInput(foundProject.inicio) || "");
      setResponsible(foundProject.responsavel || "");
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError("Erro ao carregar detalhes do projeto.");
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [route.params.projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useFocusEffect(
    // Use useFocusEffect
    useCallback(() => {
      fetchProject(); // Call fetchProject when the screen is focused
    }, [fetchProject])
  );

  if (isLoading) {
    return (
      <View
        style={{
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <Divider />
        <TextInter color={colors.white[100]} weight="medium">
          Carregando detalhes...
        </TextInter>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Header
          title="Erro"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("ProjectScreen")}
        />
        <Divider />
        <TextInter color={colors.error[100]} style={{ marginTop: 20 }}>
          {error}
        </TextInter>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Header
          title="Não Encontrado"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("ProjectScreen")}
        />
        <Divider />
        <TextInter style={{ marginTop: 20 }}>Projeto não encontrada.</TextInter>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.container}>
            <Header
              title="Editar Projeto"
              navigation={navigation}
              onCustomReturn={() => navigation.navigate("ProjectScreen")}
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
                  navigation.navigate("ProjectScreen");
                }}
              />
              <NextButton
                onPress={saveProject}
                buttonTitle="Editar"
                disabled={!name || !description}
              />
            </View>
          </View>
          <SuccessModal
            visible={successSuccessModal}
            title="Projeto editado com sucesso!"
            message="Seu projeto foi editado com sucesso."
            onPress={() => {
              navigation.navigate("ProjectScreen");
              setSuccessModal(false);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProject;

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
  centered: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.dark[90],
  },
});
