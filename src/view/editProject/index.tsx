import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  BackHandler,
} from "react-native";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import { fetchAllUsers, updateProject } from "../../db/controller";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/loadingSlice";
import { database } from "../../db";
import Project from "../../db/model/project";
import TextInter from "../../components/textInter";
import { formatDateToInput } from "../../util";
import { useFocusEffect } from "@react-navigation/native";

const isFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") {
    return false;
  }
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }
  return true;
};

interface ProjectFormErrors {
  name?: string;
  responsible?: string;
  description?: string;
  date?: string;
}

const EditProject: FC<RouterProps> = ({ navigation, route }) => {
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const [validationAttempted, setValidationAttempted] = useState(false);
  const [formErrors, setFormErrors] = useState<ProjectFormErrors>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const validateForm = useCallback((): boolean => {
    const errors: ProjectFormErrors = {};
    const msgRequired = "Este campo é obrigatório.";

    if (!isFilled(name)) {
      errors.name = msgRequired;
    }
    if (!isFilled(description)) {
      errors.description = msgRequired;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, description]);

  const saveProject = async () => {
    setValidationAttempted(true);

    if (!validateForm()) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios."
      );
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      return;
    }

    if (!route?.params?.projectId) {
      dispatch(
        showError({ title: "Erro", message: "ID do projeto não encontrado." })
      );
      return;
    }

    try {
      const user = await fetchAllUsers();
      if (user.length === 0) {
        dispatch(
          showError({
            title: "Erro de Usuário",
            message: "Nenhum usuário encontrado.",
          })
        );
        return;
      }
      await updateProject(route.params.projectId, {
        descricao_projeto: description,
        nome_projeto: name,
        inicio: date
          ? (() => {
              try {
                const [d, m, y] = date.split("/").map(Number);
                if (
                  isNaN(d) ||
                  isNaN(m) ||
                  isNaN(y) ||
                  m < 1 ||
                  m > 12 ||
                  d < 1 ||
                  d > 31
                ) {
                  throw new Error("Invalid date components");
                }
                return new Date(y, m - 1, d, 12).toISOString();
              } catch (e) {
                console.error(
                  "Error parsing date for project update:",
                  date,
                  e
                );
                return new Date().toISOString();
              }
            })()
          : new Date().toISOString(),
      });
      setSuccessModal(true);
      setValidationAttempted(false);
      setFormErrors({});
    } catch (error: any) {
      console.log("Error updating project:", error);
      dispatch(
        showError({
          message: error.message || "Erro ao editar o projeto",
          title: "Por favor, tente novamente.",
        })
      );
    }
  };

  const fetchProject = useCallback(async () => {
    if (!route?.params?.projectId) {
      setErrorLoading("ID do projeto não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorLoading(null);
    try {
      const projectCollection = database.collections.get<Project>("project");
      const foundProject = await projectCollection.find(route.params.projectId);
      setName(foundProject.nome_projeto || "");
      setDescription(foundProject.descricao_projeto || "");
      setDate(formatDateToInput(foundProject.inicio) || "");
    } catch (err) {
      console.error("Error fetching project details:", err);
      setErrorLoading("Erro ao carregar detalhes do projeto.");
    } finally {
      setIsLoading(false);
    }
  }, [route?.params?.projectId]);

  useEffect(() => {
    if (route?.params?.projectId) {
      fetchProject();
    }
  }, [fetchProject, route?.params?.projectId]);

  const handleReturn = () => {
    setName("");
    setDescription("");
    setDate("");
    setValidationAttempted(false);
    setFormErrors({});
    navigation.navigate("ProjectScreen");
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setName("");
        setDescription("");
        setDate("");
        setValidationAttempted(false);
        setFormErrors({});
        navigation.navigate("ProjectScreen");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [navigation])
  );

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.projectId) {
        fetchProject();
      }
      setValidationAttempted(false);
      setFormErrors({});
    }, [fetchProject, route?.params?.projectId, navigation])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <Divider />
        <TextInter color={colors.white[100]} weight="medium">
          Carregando detalhes...
        </TextInter>
      </SafeAreaView>
    );
  }

  if (errorLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header
          title="Erro"
          onCustomReturn={() => navigation.navigate("ProjectScreen")}
        />
        <Divider />
        <TextInter
          color={colors.error[100]}
          style={{ marginTop: 20, textAlign: "center" }}
        >
          {errorLoading}
        </TextInter>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} // Usar scrollContent aqui
          keyboardShouldPersistTaps="handled"
        >
          {/* O View style={styles.container} foi removido como wrapper direto do ScrollView */}
          {/* O conteúdo agora é filho direto do ScrollView, e scrollContent cuida do layout */}
          <Header title="Editar Projeto" onCustomReturn={handleReturn} />
          <Divider />
          <View style={styles.bodyContainer}>
            <Input
              placeholder="Nome do Projeto"
              label="Nome"
              value={name}
              onChangeText={setName}
              required
              hasError={!!formErrors.name}
              errorMessage={formErrors.name}
            />
            <Input
              placeholder="Descreva o projeto"
              required
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
            <ReturnButton onPress={handleReturn} />
            <NextButton
              onPress={saveProject}
              buttonTitle="Salvar Edições"
              disabled={false}
            />
          </View>
          <SuccessModal
            visible={successSuccessModal}
            title="Projeto editado com sucesso!"
            message="Seu projeto foi editado com sucesso."
            onPress={() => {
              setSuccessModal(false);
              navigation.navigate("ProjectScreen");
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
  // styles.container foi removido pois seu conteúdo foi movido para serem filhos diretos do ScrollView
  // e scrollContent já lida com padding e flexGrow.
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between", // Para distribuir Header, bodyContainer, buttonContainer
    paddingHorizontal: 20,
    paddingTop: 10, // Adicionado paddingTop para o Header
    paddingBottom: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
    // marginTop: 'auto', // Removido, pois justifyContent: 'space-between' em scrollContent deve cuidar disso
    // Se o bodyContainer não preencher, pode ser necessário adicionar de volta ou ajustar flex do bodyContainer
    marginTop: 20, // Adicionado um marginTop fixo para garantir espaço
  },
  bodyContainer: {
    flex: 1, // Permite que o bodyContainer cresça
    width: "100%",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
  },
});
