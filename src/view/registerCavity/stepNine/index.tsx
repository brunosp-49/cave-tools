import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";
import { LongButton } from "../../../components/longButton";
import { Ionicons } from "@expo/vector-icons";

export const StepNine = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Espeleotemas
      </TextInter>
      <Divider />
      <Input placeholder="Digite o tipo de Espeleotemas" label="Tipo" />
      <TextInter color={colors.white[100]} weight="medium">
        Porte
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        onValueChange={() => {}}
        options={[
          { id: "1", value: "Milimétrico", label: "Milimétrico" },
          { id: "2", value: "Centimétrico", label: "Centimétrico" },
          { id: "3", value: "Métrico", label: "Métrico" },
        ]}
      />
      <Divider height={12} />
      <Input placeholder="Digite a frequência" label="Frequência" />
      <Input
        placeholder="Qual o estado de conservação"
        label="Estado de Conservação"
      />
      <LongButton
        title="Adicionar"
        onPress={() => {}}
        leftIcon={<Ionicons name="add" color={colors.white[100]} size={25}/>}
      />
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
