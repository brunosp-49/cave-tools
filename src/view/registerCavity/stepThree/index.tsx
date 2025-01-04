import React, { FC } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../../types";
import { Header } from "../../../components/header";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import { Input } from "../../../components/input";
import { Checkbox } from "../../../components/checkbox";
import TextInter from "../../../components/textInter";

export const StepThree = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <Input placeholder="Especifique aqui" label="Desenvolvimento linear" />
      <TextInter color={colors.white[100]} weight="medium">
        Dificuldades externas
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Rastejamento" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Quebra corpo" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Teto baixo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Natação" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Sifão" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Blocos instáveis" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Lances verticais" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Cachoeira" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Trechos escorregadios"
        checked={true}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Passagem em curso d'água"
        checked={true}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Nenhum" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
});
