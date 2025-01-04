import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider } from "../../../components/divider";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";

export const StepOne = () => {
  const [select, setSelect] = useState({ id: "", value: "" });

  return (
    <View style={styles.container}>
      <Divider />
      <Select
        placeholder="Selecione um projeto"
        label="Selecione o projeto"
        required
        value={select.value}
        onChangeText={(obj) => setSelect(obj)}
        optionsList={[
          { id: "1", value: "Projeto 1" },
          { id: "2", value: "Projeto 2" },
          { id: "3", value: "Projeto 3" },
          { id: "4", value: "Projeto 4" },
          { id: "5", value: "Projeto 5" },
          { id: "6", value: "Projeto 6" },
          { id: "7", value: "Projeto 7" },
          { id: "8", value: "Projeto 8" },
          { id: "9", value: "Projeto 9" },
          { id: "10", value: "Projeto 10" },
        ]}
      />
      <Input placeholder="Digite o nome da cavidade" label="Nome da cavidade" />
      <Input
        label="Código da cavidade"
        placeholder="Digite o código da cavidade"
      />
      <Input label="Município" placeholder="Digite o nome do município" />
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
