import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../../assets/colors";
import { StatusBar } from "expo-status-bar";
import { Header } from "../../components/header";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { LongButton } from "../../components/longButton";
import TextInter from "../../components/textInter";
import { FC } from "react";
import { RouterProps } from "../../types";

export const Login: FC<RouterProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header title="Login" disableRightMenu/>
        <View style={styles.body}>
          <Input placeholder="Digite seu email" label="E-mail" />
          <Input
            placeholder="Digite sua senha"
            label="Senha"
            RightLinkIsActive
            RightLinkText="Esqueceu sua senha?"
            onRightLinkPress={() => {}}
            secureTextEntry
          />
          <LongButton
            title="Entrar"
            onPress={() => navigation.navigate("Tabs")}
          />
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerText}
            onPress={() => navigation.navigate("Register")}
          >
            <TextInter color={colors.white[100]} weight="medium" fontSize={13}>
              Não tem cadastro?{" "}
            </TextInter>
            <TextInter color={colors.accent[100]} weight="medium" fontSize={13}>
              Criar agora
            </TextInter>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
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
  },
  body: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 99,
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
