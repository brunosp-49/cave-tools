import React, { FC, useState, useCallback, useMemo } from "react";
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
} from "../../../redux/cavitySlice";
import { EspeleotemaItem, RouterProps } from "../../../types";

type PorteValue = "milimetrico" | "centimetrico" | "metrico";

interface StepEightProps extends RouterProps {
  validationAttempted: boolean;
}

const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
};

interface ItemFormErrors {
    currentTipo?: string;
    currentPorte?: string;
    currentFreq?: string;
    currentConservacao?: string;
}

export const StepEight: FC<StepEightProps> = ({ navigation, route, validationAttempted: globalValidationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const espeleotemasState = useSelector(
    (state: RootState) => state.cavity.cavidade.espeleotemas
  ) ?? { possui: false, tipos: [] };

  const possuiEspeleotemasRedux = espeleotemasState.possui ?? false;
  const itemList = espeleotemasState.tipos ?? [];

  const [currentTipo, setCurrentTipo] = useState("");
  const [currentPorte, setCurrentPorte] = useState<PorteValue | undefined>(undefined);
  const [currentFreq, setCurrentFreq] = useState("");
  const [currentConservacao, setCurrentConservacao] = useState("");

  const [itemFormValidationAttempted, setItemFormValidationAttempted] = useState(false);
  const [itemFormErrors, setItemFormErrors] = useState<ItemFormErrors>({});

  const stepEightGlobalErrors = useMemo(() => {
    if (!globalValidationAttempted || !possuiEspeleotemasRedux) return {};
    const errors: { [key: string]: string } = {};
    if (itemList.length === 0) {
      errors.espeleotemas_tipos = "Pelo menos um espeleotema deve ser adicionado se 'Possui Espeleotemas' estiver marcado.";
    }
    if (itemList.length > 0) {
        const algumItemIncompleto = itemList.some(item =>
            !isFieldFilled(item.tipo) ||
            !isFieldFilled(item.porte) ||
            !isFieldFilled(item.frequencia) ||
            !isFieldFilled(item.estado_conservacao)
        );
        if (algumItemIncompleto) {
            errors.espeleotemas_tipos_itens = "Todos os espeleotemas adicionados devem ter todas as informações preenchidas.";
        }
    }
    return errors;
  }, [globalValidationAttempted, possuiEspeleotemasRedux, itemList]);


  const handlePossuiToggle = () => {
    const newValue = !possuiEspeleotemasRedux;
    dispatch(setEspeleotemasPossui(newValue));
    if (!newValue) {
      clearForm();
    }
  };

  const clearForm = () => {
    setCurrentTipo("");
    setCurrentPorte(undefined);
    setCurrentFreq("");
    setCurrentConservacao("");
    setItemFormErrors({});
    setItemFormValidationAttempted(false);
  };

  const validateItemForm = (): boolean => {
    const errors: ItemFormErrors = {};
    if (!isFieldFilled(currentTipo)) errors.currentTipo = "Tipo é obrigatório.";
    if (!isFieldFilled(currentPorte)) errors.currentPorte = "Porte é obrigatório.";
    if (!isFieldFilled(currentFreq)) errors.currentFreq = "Frequência é obrigatória.";
    if (!isFieldFilled(currentConservacao)) errors.currentConservacao = "Estado de Conservação é obrigatório.";
    setItemFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEspeleotema = () => {
    setItemFormValidationAttempted(true);
    if (!validateItemForm()) {
      Alert.alert("Preencha todos os campos", "Por favor, preencha os campos do espeleotema faltantes.");
      return;
    }
    const newItemPayload: Omit<EspeleotemaItem, "id"> = {
      tipo: currentTipo.trim(),
      porte: currentPorte!,
      frequencia: currentFreq.trim(),
      estado_conservacao: currentConservacao.trim(),
    };
    dispatch(addEspeleotemaItem(newItemPayload));
    clearForm();
  };

  const handleRemoveEspeleotema = (id: number) => {
    Alert.alert("Remover Item", "Tem certeza que deseja remover este espeleotema?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => dispatch(removeEspeleotemaItem(id)) },
      ]
    );
  };

  const porteOptions = [
    { id: "milimetrico", value: "milimetrico" as PorteValue, label: "Milimétrico" },
    { id: "centimetrico", value: "centimetrico" as PorteValue, label: "Centimétrico" },
    { id: "metrico", value: "metrico" as PorteValue, label: "Métrico" },
  ];

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">Espeleotemas *</TextInter>
      <Divider />
      <Checkbox label="Possui Espeleotemas?" checked={possuiEspeleotemasRedux} onChange={handlePossuiToggle} />
      {globalValidationAttempted && !possuiEspeleotemasRedux && itemList.length === 0 &&
        !!stepEightGlobalErrors.espeleotemas_tipos && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
          {stepEightGlobalErrors.espeleotemas_tipos}
        </TextInter>
      )}
       {globalValidationAttempted && possuiEspeleotemasRedux && itemList.length > 0 &&
        !!stepEightGlobalErrors.espeleotemas_tipos_itens && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
          {stepEightGlobalErrors.espeleotemas_tipos_itens}
        </TextInter>
      )}
      <Divider />
      {possuiEspeleotemasRedux && (
        <>
          <Input placeholder="Digite o tipo (Ex: Estalactite)" label="Tipo" value={currentTipo}
            onChangeText={setCurrentTipo} hasError={!!itemFormErrors.currentTipo}
            errorMessage={itemFormErrors.currentTipo} required />
          <TextInter color={colors.white[100]} weight="medium" style={styles.labelSpacing}>Porte *</TextInter>
          <Divider height={6} />
          <RadioButtonGroup onValueChange={(value) => setCurrentPorte(value as PorteValue)}
            value={currentPorte ?? ""} options={porteOptions} />
          {!!itemFormErrors.currentPorte && (
            <TextInter color={colors.error[100]} fontSize={12} style={styles.errorTextRadio}>
                {itemFormErrors.currentPorte}
            </TextInter>
          )}
          <Divider height={12} />
          <Input placeholder="Digite a frequência (Ex: Abundante)" label="Frequência" value={currentFreq}
            onChangeText={setCurrentFreq} hasError={!!itemFormErrors.currentFreq}
            errorMessage={itemFormErrors.currentFreq} required />
          <Input placeholder="Qual o estado de conservação?" label="Estado de Conservação" value={currentConservacao}
            onChangeText={setCurrentConservacao} hasError={!!itemFormErrors.currentConservacao}
            errorMessage={itemFormErrors.currentConservacao} required />
          <LongButton title="Adicionar Espeleotema" onPress={handleAddEspeleotema}
            leftIcon={<Ionicons name="add" color={colors.white[100]} size={25} />} />
          <Divider />
          {itemList.length > 0 && (
            <>
              <TextInter color={colors.white[100]} weight="medium" style={styles.listHeader}>
                Espeleotemas Adicionados
              </TextInter>
              <Divider height={14} />
            </>
          )}
          {itemList.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemTextContainer}>
                  <TextInter weight="bold" color={colors.white[100]}>{item.tipo}</TextInter>
                  <TextInter fontSize={12} color={colors.white[80]}>
                    {item.porte ? `Porte: ${porteOptions.find(p => p.value === item.porte)?.label || item.porte}` : ""}
                    {item.frequencia ? ` / Freq: ${item.frequencia}` : ""}
                    {item.estado_conservacao ? ` / Conserv: ${item.estado_conservacao}` : ""}
                  </TextInter>
                </View>
                <TouchableOpacity onPress={() => handleRemoveEspeleotema(item.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-sharp" size={20} color={colors.error[100]} />
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
  container: { flex: 1, paddingBottom: 30 },
  itemContainer: {
    backgroundColor: colors.dark[80], borderRadius: 8, paddingVertical: 10,
    paddingHorizontal: 12, marginBottom: 10, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  itemTextContainer: { flex: 1, marginRight: 10 },
  deleteButton: { padding: 8 },
  labelSpacing: { marginTop: 10, marginBottom: 0 },
  listHeader: { marginTop: 15 },
  errorText: { color: colors.error[100], fontSize: 12, marginTop: 4 },
  errorTextRadio: { color: colors.error[100], fontSize: 12, marginTop: -2, marginBottom: 8 }
});