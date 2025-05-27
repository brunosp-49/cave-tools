import {
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
import { createProject, fetchAllUsers } from "../../db/controller";
import uuid from "react-native-uuid";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/loadingSlice";
import { useFocusEffect } from "@react-navigation/native";
import { formatDateToInput } from "../../util";

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
}

const RegisterProject: FC<RouterProps> = ({ navigation }) => {
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(formatDateToInput(new Date().toISOString()));
  const [responsible, setResponsible] = useState("");
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
    if (!isFilled(responsible)) {
      errors.responsible = msgRequired;
    }
    // Adicione validações para 'description' e 'date' se se tornarem obrigatórias
    // if (!isFilled(description)) errors.description = msgRequired;
    // if (!isFilled(date)) errors.date = msgRequired;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, responsible, description, date]);
  const isFormValid = useMemo(() => {
    if (!validationAttempted) return true;
    return validateForm();
  }, [validateForm, validationAttempted]);

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

    try {
      const user = await fetchAllUsers();
      if (user.length === 0) {
        dispatch(
          showError({
            title: "Erro de Usuário",
            message:
              "Nenhum usuário encontrado para associar ao projeto. Faça login e tente novamente.",
          })
        );
        return;
      }
      await createProject({
        id: uuid.v4().toString(),
        descricao_projeto: description,
        nome_projeto: name,
        fk_cliente: String(user[0].user_id),
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
                console.error("Invalid date components:", d, m, y);
                throw new Error("Invalid date format");
              }
              return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
            } catch (e) {
              console.error("Error parsing date:", date, e);
              return new Date().toISOString();
            }
          })()
        : new Date().toISOString(),
        responsavel: responsible,
      });
      setSuccessModal(true);
      setValidationAttempted(false);
      setFormErrors({});
    } catch (error: any) {
      console.log("Error saving project:", error);
      dispatch(
        showError({
          message: error.message || "Erro ao cadastrar o projeto",
          title: "Por favor, tente novamente.",
        })
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setName("");
        setDescription("");
        setDate("");
        setResponsible("");
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

  const handleReturn = () => {
    setName("");
    setDescription("");
    setDate("");
    setResponsible("");
    setValidationAttempted(false);
    setFormErrors({});
    navigation.navigate("ProjectScreen");
  };

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Header
              title="Cadastrar Projeto"
              onCustomReturn={handleReturn}
              navigation={navigation}
            />
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
                placeholder="Nome do usuário"
                value={responsible}
                onChangeText={setResponsible}
                label="Usuário responsável"
                required
                hasError={!!formErrors.responsible}
                errorMessage={formErrors.responsible}
              />
              <Input
                placeholder="Descreva o projeto"
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
                buttonTitle="Cadastrar"
                disabled={false}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SuccessModal
        visible={successSuccessModal}
        title="Cadastro realizado com sucesso!"
        message="Seu projeto foi cadastrado com sucesso no sistema."
        onPress={() => {
          setSuccessModal(false);
          setName("");
          setDescription("");
          setDate("");
          setResponsible("");
          setValidationAttempted(false);
          setFormErrors({});
          navigation.navigate("ProjectScreen");
        }}
      />
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
    // minHeight: "100%", // Removido, flex:1 no ScrollView e neste container deve ser suficiente
    backgroundColor: colors.dark[90],
    // paddingHorizontal: 20, // Removido, scrollContent já tem
    // paddingBottom: 25, // Removido, scrollContent já tem
    // alignItems: "center", // Removido para permitir que bodyContainer ocupe a largura total
    justifyContent: "space-between",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 25,
    // justifyContent: "space-between", // Removido daqui, o container interno fará isso
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
    marginTop: 20, // Adicionado marginTop para separar do último input
  },
  bodyContainer: {
    flex: 1, // Permite que o bodyContainer cresça para preencher o espaço
    width: "100%",
    // justifyContent: 'center', // Opcional, se quiser centralizar os inputs verticalmente
  },
  // errorText: { // Adicione se precisar de um estilo global para mensagens de erro
  //   color: colors.error[100],
  //   fontSize: 12,
  //   marginTop: 2,
  // }
});
