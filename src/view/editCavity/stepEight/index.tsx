import React, { FC, useState, useCallback } from "react";
import { StyleSheet, View, Alert, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";
import { LongButton } from "../../../components/longButton";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "../../../components/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  addEspeleotemaItem,
  removeEspeleotemaItem,
  setEspeleotemasPossui,
  updateCavidadeData,
} from "../../../redux/cavitySlice";
import { EspeleotemaItem } from "../../../types";

type PorteValue = "milimetrico" | "centimetrico" | "metrico";

export const StepEight: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const espeleotemasState = useSelector(
    (state: RootState) => state.cavity.cavidade.espeleotemas
  ) ?? { possui: false, lista: [] };
  const possuiEspeleotemasRedux = espeleotemasState.possui ?? false;
  const itemList = espeleotemasState.lista ?? [];
  const [currentTipo, setCurrentTipo] = useState("");
  const [currentPorte, setCurrentPorte] = useState<PorteValue | undefined>(
    undefined
  );
  const [currentFreq, setCurrentFreq] = useState("");
  const [currentConservacao, setCurrentConservacao] = useState("");

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handlePossuiToggle = () => {
    const newValue = !possuiEspeleotemasRedux;
    // Dispatch the specific action
    dispatch(setEspeleotemasPossui(newValue));
    if (!newValue) {
      clearForm(); // Clear form inputs if unchecking
    }
  };

  const clearForm = () => {
    setCurrentTipo("");
    setCurrentPorte(undefined);
    setCurrentFreq("");
    setCurrentConservacao("");
  };

  const handleAddEspeleotema = () => {
    if (!currentTipo.trim()) {
      Alert.alert("Erro", "Por favor, especifique o 'Tipo' do espeleotema.");
      return;
    }
    const newItemPayload: Omit<EspeleotemaItem, "id"> = {
      tipo: currentTipo.trim(),
      porte: currentPorte,
      frequencia: currentFreq.trim() || undefined,
      estado_conservacao: currentConservacao.trim() || undefined,
    };
    dispatch(addEspeleotemaItem(newItemPayload));
    clearForm();
  };

  const handleRemoveEspeleotema = (id: number) => {
    Alert.alert(
      "Remover Item",
      "Tem certeza que deseja remover este espeleotema?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => dispatch(removeEspeleotemaItem(id)),
        }, // Dispatch remove action
      ]
    );
  };

  const handleAddItemWithDynamicKey = () => {
    const tipoKey = currentTipo.trim();
    if (!tipoKey) {
      Alert.alert("Erro", "Por favor, especifique o 'Tipo' do espeleotema.");
      return;
    }
    const path = ["espeleotemas", "tipos", tipoKey];
    const value = {
      porte: currentPorte,
      frequencia: currentFreq.trim() || undefined,
      estado_conservacao: currentConservacao.trim() || undefined,
    };
    console.warn(`Updating Redux state at dynamic path: ${path.join(".")}`);
    handleUpdate(path, value);
    clearForm();
  };

  const porteOptions = [
    { id: "1", value: "milimetrico", label: "Milimétrico" },
    { id: "2", value: "centimetrico", label: "Centimétrico" },
    { id: "3", value: "metrico", label: "Métrico" },
  ];

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Espeleotemas
      </TextInter>
      <Divider />
      <Checkbox
        label="Possui Espeleotemas?"
        checked={possuiEspeleotemasRedux}
        onChange={handlePossuiToggle}
      />
      <Divider />
      {possuiEspeleotemasRedux && (
        <>
          <Input
            placeholder="Digite o tipo (Ex: Estalactite)"
            label="Tipo *"
            value={currentTipo}
            onChangeText={setCurrentTipo}
          />
          {/* Removed style={styles.label} */}
          <TextInter color={colors.white[100]} weight="medium">
            Porte
          </TextInter>
          <Divider height={12} />
          <RadioButtonGroup
            onValueChange={(value) => setCurrentPorte(value as PorteValue)}
            value={currentPorte ?? null}
            options={porteOptions}
          />
          <Divider height={12} />
          <Input
            placeholder="Digite a frequência (Ex: Abundante)"
            label="Frequência"
            value={currentFreq}
            onChangeText={setCurrentFreq}
          />
          <Input
            placeholder="Qual o estado de conservação?"
            label="Estado de Conservação"
            value={currentConservacao}
            onChangeText={setCurrentConservacao}
          />
          <LongButton
            title="Adicionar"
            onPress={handleAddEspeleotema}
            leftIcon={
              <Ionicons name="add" color={colors.white[100]} size={25} />
            }
          />
          <Divider />

          {/* --- Display Added Items (From Redux State) --- */}
          {itemList.length > 0 && (
            <>
              <TextInter color={colors.white[100]} weight="medium">
                Espeleotemas Adicionados
              </TextInter>
              <Divider height={14} />
            </>
          )}
          {itemList.map(
            (
              item // Map over itemList from Redux state
            ) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemTextContainer}>
                  <TextInter weight="bold" color={colors.white[100]}>
                    {item.tipo}
                  </TextInter>
                  <TextInter fontSize={12} color={colors.white[80]}>
                    {/* Display details from the item in the list */}
                    {item.porte ? `Porte: ${item.porte}` : ""}
                    {item.frequencia ? ` / Freq: ${item.frequencia}` : ""}
                    {item.estado_conservacao
                      ? ` / Conserv: ${item.estado_conservacao}`
                      : ""}
                  </TextInter>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveEspeleotema(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-sharp" size={20} color={"#F4364C"} />
                </TouchableOpacity>
              </View>
            )
          )}
        </>
      )}

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
  itemContainer: {
    backgroundColor: colors.dark[80],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
});
