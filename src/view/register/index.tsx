import React, { FC, useEffect, useState } from "react";
import { checkIfIsBlank, validateEmail, validatePassword } from "../../util";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  KeyboardType,
} from "react-native";
import { Header } from "../../components/header";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { LongButton } from "../../components/longButton";
import { colors } from "../../assets/colors";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../types";

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

  const checkPassword = (value: string) => {
    const passwordFilled = !checkIfIsBlank(value);
    const passwordValid = validatePassword(value);

    setPassword({
      ...password,
      value: value,
      error: !passwordValid,
      errorMessage: passwordFilled
        ? value.length < 8
          ? "Senha deve ter no mínimo 8 caracteres"
          : ""
        : "Campo obrigatório",
    });

    return passwordValid;
  };

  const comparePassword = (password: string, confirmation: string) => {
    const test = password === confirmation;
    setConfirmPassword({
      ...confirmPassword,
      value: confirmation,
      error: !test,
      errorMessage: !test ? "Senhas não coincidem" : "",
    });
    return password === confirmation;
  };

  const updateInstitutionalLinkFields = (
    nameValue: string,
    cnpjValue: string
  ): void => {
    const nameFilled = !checkIfIsBlank(nameValue);
    const cnpjFilled = !checkIfIsBlank(cnpjValue);

    setInstitutionalLinkName({
      ...institutionalLinkName,
      value: nameValue,
      error: !nameFilled && cnpjFilled ? true : false,
      errorMessage: nameFilled ? "" : "Campo obrigatório",
    });
    console.log(cnpjValue.length);
    setInstitutionalLinkCNPJ({
      ...institutionalLinkCNPJ,
      value: cnpjValue,
      error: (!cnpjFilled && nameFilled) || cnpjValue.length < 14,
      errorMessage:
        cnpjFilled || !nameFilled
          ? ""
          : "Quando o Nome institucional é preenchido, campo é obrigatório",
    });
  };

  const handleInputChange = (field: string, value: string): void => {
    switch (field) {
      case "name":
        setName((prevState) => ({ ...prevState, value }));
        break;
      case "email":
        setEmail((prevState) => ({ ...prevState, value }));
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
        setPassword((prevState) => ({ ...prevState, value }));
        checkPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword((prevState) => ({ ...prevState, value }));
        comparePassword(password.value, value);
        break;
      default:
        break;
    }
  };

  const checkIfFormIsValid = () => {
    if (
      name.error ||
      email.error ||
      formation.error ||
      institutionalLinkName.error ||
      institutionalLinkCNPJ.error ||
      password.error ||
      confirmPassword.error
    ) {
      console.log(191);
      setButtonDisabled(true);
    }
    if (
      !name.error &&
      !email.error &&
      !formation.error &&
      !institutionalLinkName.error &&
      !institutionalLinkCNPJ.error &&
      !password.error &&
      !confirmPassword.error &&
      name.value &&
      email.value &&
      formation.value &&
      password.value &&
      confirmPassword.value
    ) {
      console.log(180);
      setButtonDisabled(false);
    }
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
      <ScrollView>
        <View style={styles.container}>
          <Header
            title="Criar conta"
            disableRightMenu
            navigation={navigation}
          />
          <View style={styles.body}>
            <Input
              placeholder="Digite seu nome"
              label="Nome"
              required
              value={name.value}
              hasError={name.error}
              errorMessage={name.errorMessage}
              onChangeText={(text) => handleInputChange("name", text)}
              onBlur={() => {
                if (checkIfIsBlank(name.value)) {
                  setName({
                    ...name,
                    error: true,
                    errorMessage: "Campo obrigatório",
                  });
                } else {
                  setName({
                    ...name,
                    error: false,
                    errorMessage: "",
                  });
                }
              }}
            />
            <Input
              placeholder="Digite seu email"
              label="Email"
              required
              value={email.value}
              hasError={email.error}
              errorMessage={email.errorMessage}
              onChangeText={(text) => {
                handleInputChange("email", text);
                if (!validateEmail(text)) {
                  setEmail({
                    ...email,
                    value: text,
                    error: true,
                    errorMessage: "Email inválido",
                  });
                } else {
                  setEmail({
                    ...email,
                    value: text,
                    error: false,
                    errorMessage: "",
                  });
                }
              }}
            />
            <Input
              placeholder="Digite sua formação"
              label="Formação"
              required
              value={formation.value}
              hasError={formation.error}
              errorMessage={formation.errorMessage}
              onChangeText={(text) => handleInputChange("formation", text)}
              onBlur={() => {
                if (checkIfIsBlank(formation.value)) {
                  setFormation({
                    ...formation,
                    error: true,
                    errorMessage: "Campo obrigatório",
                  });
                } else {
                  setFormation({
                    ...formation,
                    error: false,
                    errorMessage: "",
                  });
                }
              }}
            />
            <Input
              placeholder="Digite o nome do vínculo institucional"
              label="Vínculo Institucional (Nome)"
              value={institutionalLinkName.value}
              hasError={institutionalLinkName.error}
              errorMessage={institutionalLinkName.errorMessage}
              onChangeTextMask={(empty, text) =>
                handleInputChange("institutionalLinkName", text)
              }
            />
            <Input
              placeholder="Digite o CNPJ do vínculo institucional"
              label="Vínculo Institucional (CNPJ)"
              value={institutionalLinkCNPJ.value}
              hasError={institutionalLinkCNPJ.error}
              errorMessage={institutionalLinkCNPJ.errorMessage}
              onChangeTextMask={(empty, text) =>
                handleInputChange("institutionalLinkCNPJ", text)
              }
              keyboardType="numeric"
              mask="99.999.999/9999-99"
            />
            <Input
              placeholder="Digite sua senha"
              label="Senha"
              required
              value={password.value}
              hasError={password.error}
              errorMessage={password.errorMessage}
              onChangeText={(text) => handleInputChange("password", text)}
              secureTextEntry
            />
            <Input
              placeholder="Confirme sua senha"
              label="Confirme a senha"
              required
              value={confirmPassword.value}
              hasError={confirmPassword.error}
              errorMessage={confirmPassword.errorMessage}
              onChangeText={(text) =>
                handleInputChange("confirmPassword", text)
              }
              secureTextEntry
            />
            <Divider />
            <LongButton
              title="Criar Conta"
              onPress={() => navigation.navigate("Tabs")}
              disabled={buttonDisabled}
            />
          </View>
          <StatusBar style="light" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  body: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
  },
  footer: {
    width: "100%",
    height: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
