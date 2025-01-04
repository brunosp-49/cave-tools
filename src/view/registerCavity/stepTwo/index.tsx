import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Checkbox } from "../../../components/checkbox";
import TextInter from "../../../components/textInter";
import { Divider } from "../../../components/divider";
import { Input } from "../../../components/input";

export const StepTwo = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Características da entrada
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Inserção
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Afloramento rochoso contínuo"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Afloramento isolado"
        checked={true}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Escarpa rochosa contínua"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Escarpa rochosa descontínua"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Dolina" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Depósito de talús" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outro" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Input placeholder="Especifique aqui" label="Outro" />
      <TextInter color={colors.white[100]} weight="medium">
        Posição na vertente
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Topo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Alta" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Média" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Baixa" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <TextInter color={colors.white[100]} weight="medium">
        Vegetação Regional
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Cerrado" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Campo rupestre" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Floresta estacional semidecidual"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Floresta ombrófila"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Mata seca" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Campo sujo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outro" checked={false} onChange={() => {}} />
      <Divider height={16} />
      <Input placeholder="Especifique aqui" label="Outro" />
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
