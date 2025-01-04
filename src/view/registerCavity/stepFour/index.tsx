import React, { FC, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../../types";
import { Header } from "../../../components/header";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";
import { Select } from "../../../components/select";

export const StepFour = () => {
  const [select, setSelect] = useState({ id: "", value: "" });

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Aspectos socioambientais
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Uso da cavidade
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Religioso" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Científico/Cultural"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Social" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Minerário" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Pedagógico" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Turístico" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Incipiente" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Massa" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Aventura" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Mergulho" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Rapel" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outros" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Input placeholder="Especifique aqui" label="Outro" />
      <TextInter color={colors.white[100]} weight="medium">
        Comunidade envolvida
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        options={[
          { label: "Sim", value: "sim", id: "1" },
          { label: "Não", value: "não", id: "2" },
        ]}
        onValueChange={() => {}}
      />
      <Input label="De que forma?" placeholder="Especifique aqui" />
      <Select
        value={select.value}
        onChangeText={(obj) => setSelect(obj)}
        label="Áreas Protegida - Jurisdição"
        optionsList={[
          { id: "1", value: "Federal" },
          { id: "2", value: "Estadual" },
        ]}
        placeholder="Selecione uma opção"
      />
      <Input label="Nome" placeholder="Dígite o nome" />
      <Checkbox label="Interior" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Zona de Amortecimento"
        checked={false}
        onChange={() => {}}
      />
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura de acesso
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Receptivo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Condutor para visitantes"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Lanchonete e/ou restaurante"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Pousada e/ou hotel"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Nenhuma" checked={false} onChange={() => {}} />
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
