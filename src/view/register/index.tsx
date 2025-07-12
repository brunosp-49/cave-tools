import React, { FC, useEffect, useState } from "react";
import { checkIfIsBlank, validateEmail, validatePassword } from "../../util";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform, // Importar Platform para KeyboardAvoidingView
} from "react-native";
import { Header } from "../../components/header";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { LongButton } from "../../components/longButton";
import { colors } from "../../assets/colors";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../types";
import { api } from "../../api";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/loadingSlice";

export const Register: FC<RouterProps> = ({ navigation }) => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [name, setName] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [email, setEmail] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [formation, setFormation] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [institutionalLinkName, setInstitutionalLinkName] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [institutionalLinkCNPJ, setInstitutionalLinkCNPJ] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [password, setPassword] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [confirmPassword, setConfirmPassword] = useState({
    value: "",
    error: false,
    errorMessage: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const resetState = () => {
    setName({ value: "", error: false, errorMessage: "" });
    setEmail({ value: "", error: false, errorMessage: "" });
    setFormation({ value: "", error: false, errorMessage: "" });
    setInstitutionalLinkName({ value: "", error: false, errorMessage: "" });
    setInstitutionalLinkCNPJ({ value: "", error: false, errorMessage: "" });
    setPassword({ value: "", error: false, errorMessage: "" });
    setConfirmPassword({ value: "", error: false, errorMessage: "" });
    setButtonDisabled(true);
  };

  const checkPassword = (value: string) => {
    const passwordFilled = !checkIfIsBlank(value);
    const passwordValid = validatePassword(value);

    setPassword((prevState) => ({
      ...prevState,
      value: value,
      error: !passwordValid,
      errorMessage: passwordFilled
        ? value.length < 8
          ? "Senha deve ter no mínimo 8 caracteres."
          : ""
        : "Campo obrigatório.",
    }));

    return passwordValid;
  };

  const comparePassword = (password: string, confirmation: string) => {
    const passwordsMatch = password === confirmation;
    setConfirmPassword((prevState) => ({
      ...prevState,
      value: confirmation,
      error: !passwordsMatch,
      errorMessage: !passwordsMatch ? "Senhas não coincidem." : "",
    }));
    return passwordsMatch;
  };

  const updateInstitutionalLinkFields = (
    nameValue: string,
    cnpjValue: string
  ): void => {
    const nameFilled = !checkIfIsBlank(nameValue);
    const cnpjFilled = !checkIfIsBlank(cnpjValue);
    const cleanedCnpjValue = cnpjValue.replace(/[^0-9]/g, "");
    const cnpjValidLength = cleanedCnpjValue.length === 14;

    let newNameError = false;
    let newNameErrorMessage = "";
    let newCnpjError = false;
    let newCnpjErrorMessage = "";

    if (nameFilled && !cnpjFilled) {
      newCnpjError = true;
      newCnpjErrorMessage =
        "CNPJ obrigatório quando o nome institucional é preenchido.";
    } else if (!nameFilled && cnpjFilled) {
      newNameError = true;
      newNameErrorMessage =
        "Nome institucional obrigatório quando o CNPJ é preenchido.";
    } else if (nameFilled && cnpjFilled) {
      if (!cnpjValidLength) {
        newCnpjError = true;
        newCnpjErrorMessage = "CNPJ inválido (deve ter 14 dígitos).";
      }
    }

    setInstitutionalLinkName((prevState) => ({
      ...prevState,
      value: nameValue,
      error: newNameError,
      errorMessage: newNameErrorMessage,
    }));

    setInstitutionalLinkCNPJ((prevState) => ({
      ...prevState,
      value: cnpjValue,
      error: newCnpjError,
      errorMessage: newCnpjErrorMessage,
    }));
  };

  const createAccount = async () => {
    setLoading(true);
    api
      .post("/cadastro/", {
        nome: name.value,
        email: email.value,
        formacao: formation.value,
        vinculo_cnpj: institutionalLinkCNPJ.value.replace(/[^0-9]/g, ""),
        vinculo_nome: institutionalLinkName.value,
        senha: password.value,
        senha2: confirmPassword.value,
      })
      .then((response) => {
        console.log("Conta criada com sucesso", response);
        navigation.navigate("Login");
      })
      .catch((error) => {
        console.log(error.response);
        dispatch(
          showError({
            title: "Erro ao criar conta",
            message:
              error.response?.data?.message ||
              "Verifique os dados e tente novamente.",
          })
        );
        setLoading(false);
      });
  };

  const handleInputChange = (field: string, value: string): void => {
    switch (field) {
      case "name":
        setName((prevState) => ({ ...prevState, value }));
        break;
      case "email":
        setEmail((prevState) => ({
          ...prevState,
          value: value,
          error: !validateEmail(value),
          errorMessage: validateEmail(value) ? "" : "Email inválido.",
        }));
        break;
      case "formation":
        setFormation((prevState) => ({ ...prevState, value }));
        break;
      case "institutionalLinkName":
        setInstitutionalLinkName((prevState) => ({ ...prevState, value }));
        updateInstitutionalLinkFields(value, institutionalLinkCNPJ.value);
        break;
      case "institutionalLinkCNPJ":
        setInstitutionalLinkCNPJ((prevState) => ({ ...prevState, value }));
        updateInstitutionalLinkFields(institutionalLinkName.value, value);
        break;
      case "password":
        checkPassword(value);
        break;
      case "confirmPassword":
        comparePassword(password.value, value);
        break;
      default:
        break;
    }
  };

  const checkIfFormIsValid = () => {
    const noErrors =
      !name.error &&
      !email.error &&
      !formation.error &&
      !institutionalLinkName.error &&
      !institutionalLinkCNPJ.error &&
      !password.error &&
      !confirmPassword.error;

    const allRequiredFieldsFilled =
      !checkIfIsBlank(name.value) &&
      !checkIfIsBlank(email.value) &&
      !checkIfIsBlank(formation.value) &&
      !checkIfIsBlank(password.value) &&
      !checkIfIsBlank(confirmPassword.value);

    setButtonDisabled(!(noErrors && allRequiredFieldsFilled));
  };

  useEffect(() => {
    checkIfFormIsValid();
  }, [
    name,
    email,
    formation,
    institutionalLinkName,
    institutionalLinkCNPJ,
    password,
    confirmPassword,
  ]);

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Header
              title="Criar conta"
              disableRightMenu
              onCustomReturn={() => {
                resetState();
                navigation.navigate("Login");
              }}
              navigation={navigation}
            />
            <View style={styles.body}>
              <Input
                disabled={loading}
                placeholder="Digite seu nome"
                label="Nome"
                required
                value={name.value}
                hasError={name.error}
                errorMessage={name.errorMessage}
                onChangeText={(text) => handleInputChange("name", text)}
                onBlur={() => {
                  if (checkIfIsBlank(name.value)) {
                    setName((prevState) => ({
                      ...prevState,
                      error: true,
                      errorMessage: "Campo obrigatório.",
                    }));
                  } else {
                    setName((prevState) => ({
                      ...prevState,
                      error: false,
                      errorMessage: "",
                    }));
                  }
                }}
              />
              <Input
                disabled={loading}
                placeholder="Digite seu email"
                label="Email"
                autoCapitalize={true}
                required
                value={email.value}
                hasError={email.error}
                errorMessage={email.errorMessage}
                onChangeText={(text) => handleInputChange("email", text)}
                onBlur={() => {
                  if (checkIfIsBlank(email.value)) {
                    setEmail((prevState) => ({
                      ...prevState,
                      error: true,
                      errorMessage: "Campo obrigatório.",
                    }));
                  }
                }}
              />
              <Input
                disabled={loading}
                placeholder="Digite sua formação"
                label="Formação"
                required
                value={formation.value}
                hasError={formation.error}
                errorMessage={formation.errorMessage}
                onChangeText={(text) => handleInputChange("formation", text)}
                onBlur={() => {
                  if (checkIfIsBlank(formation.value)) {
                    setFormation((prevState) => ({
                      ...prevState,
                      error: true,
                      errorMessage: "Campo obrigatório.",
                    }));
                  } else {
                    setFormation((prevState) => ({
                      ...prevState,
                      error: false,
                      errorMessage: "",
                    }));
                  }
                }}
              />
              <Input
                disabled={loading}
                placeholder="Digite o nome do vínculo institucional"
                label="Vínculo Institucional (Nome)"
                value={institutionalLinkName.value}
                hasError={institutionalLinkName.error}
                errorMessage={institutionalLinkName.errorMessage}
                onChangeText={(
                  text // Usar onChangeText diretamente para input sem máscara
                ) => handleInputChange("institutionalLinkName", text)}
                onBlur={() => {
                  updateInstitutionalLinkFields(
                    institutionalLinkName.value,
                    institutionalLinkCNPJ.value
                  );
                }}
              />
              <Input
                disabled={loading}
                placeholder="Digite o CNPJ do vínculo institucional"
                label="Vínculo Institucional (CNPJ)"
                value={institutionalLinkCNPJ.value}
                hasError={institutionalLinkCNPJ.error}
                errorMessage={institutionalLinkCNPJ.errorMessage}
                onChangeTextMask={(empty, text) =>
                  handleInputChange("institutionalLinkCNPJ", text || "")
                }
                keyboardType="numeric"
                mask="99.999.999/9999-99"
                onBlur={() => {
                  updateInstitutionalLinkFields(
                    institutionalLinkName.value,
                    institutionalLinkCNPJ.value
                  );
                }}
              />
              <Input
                disabled={loading}
                placeholder="Digite sua senha"
                label="Senha"
                required
                autoCapitalize={true} // Mudado de false para 'none' para clareza
                value={password.value}
                hasError={password.error}
                errorMessage={password.errorMessage}
                onChangeText={(text) => handleInputChange("password", text)}
                secureTextEntry
                onBlur={() => {
                  if (checkIfIsBlank(password.value)) {
                    setPassword((prevState) => ({
                      ...prevState,
                      error: true,
                      errorMessage: "Campo obrigatório.",
                    }));
                  }
                  checkPassword(password.value); // Revalida no blur
                }}
              />
              <Input
                disabled={loading}
                placeholder="Confirme sua senha"
                label="Confirme a senha"
                required
                autoCapitalize={true} // Mudado de false para 'none' para clareza
                value={confirmPassword.value}
                hasError={confirmPassword.error}
                errorMessage={confirmPassword.errorMessage}
                onChangeText={(text) =>
                  handleInputChange("confirmPassword", text)
                }
                secureTextEntry
                onBlur={() => {
                  if (checkIfIsBlank(confirmPassword.value)) {
                    setConfirmPassword((prevState) => ({
                      ...prevState,
                      error: true,
                      errorMessage: "Campo obrigatório.",
                    }));
                  }
                  comparePassword(password.value, confirmPassword.value); // Revalida no blur
                }}
              />
              <Divider />
              <LongButton
                title="Criar Conta"
                onPress={() => createAccount()}
                isLoading={loading}
                disabled={buttonDisabled}
              />
            </View>
            <StatusBar style="light" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  scrollContent: {
    // Novo estilo para o conteúdo do ScrollView
    flexGrow: 1,
    justifyContent: "center", // Centraliza verticalmente se o conteúdo for pequeno
    alignItems: "center", // Centraliza horizontalmente
    paddingBottom: 30, // Espaçamento inferior para evitar que o teclado cubra o último campo
  },
  container: {
    flex: 1,
    width: "100%", // Ocupa toda a largura do scrollContent
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between", // Ajustado para distribuir o espaço
  },
  body: {
    flex: 1, // Permite que o body se expanda
    width: "100%",
    justifyContent: "flex-start", // Alinha o conteúdo ao topo do body
    alignItems: "center",
    paddingTop: 30,
  },
});
