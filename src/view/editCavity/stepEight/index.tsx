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
  // updateCavidadeData, // Não usado diretamente para o formulário de adição de item
} from "../../../redux/cavitySlice";
import { EspeleotemaItem, RouterProps } from "../../../types";

type PorteValue = "milimetrico" | "centimetrico" | "metrico";

interface StepEightProps extends RouterProps {
  validationAttempted: boolean; // Prop vinda do formulário principal
}

// Função auxiliar para verificar se um campo está preenchido
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
  ) ?? { possui: false, lista: [] }; 
  
  const possuiEspeleotemasRedux = espeleotemasState.possui ?? false;
  const itemList = espeleotemasState.lista ?? [];
  
  const [currentTipo, setCurrentTipo] = useState("");
  const [currentPorte, setCurrentPorte] = useState<PorteValue | undefined>(undefined);
  const [currentFreq, setCurrentFreq] = useState("");
  const [currentConservacao, setCurrentConservacao] = useState("");

  const [itemFormValidationAttempted, setItemFormValidationAttempted] = useState(false);
  const [itemFormErrors, setItemFormErrors] = useState<ItemFormErrors>({});

  // Validação global da etapa (para o botão "Continuar" do formulário principal)
  const stepEightGlobalErrors = useMemo(() => {
    if (!globalValidationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    if (possuiEspeleotemasRedux && itemList.length === 0) {
      errors.espeleotemas_lista = "Pelo menos um espeleotema deve ser adicionado se 'Possui Espeleotemas' estiver marcado.";
    }
    // Adicionar validação para cada item na lista, se necessário
    if (possuiEspeleotemasRedux && itemList.length > 0) {
        const algumItemIncompleto = itemList.some(item => 
            !isFieldFilled(item.tipo) ||
            !isFieldFilled(item.porte) ||
            !isFieldFilled(item.frequencia) ||
            !isFieldFilled(item.estado_conservacao)
        );
        if (algumItemIncompleto) {
            errors.espeleotemas_lista_itens = "Todos os espeleotemas adicionados devem ter todas as informações preenchidas (Tipo, Porte, Frequência, Estado de Conservação).";
        }
    }
    return errors;
  }, [globalValidationAttempted, possuiEspeleotemasRedux, itemList]);


  const handlePossuiToggle = () => {
    const newValue = !possuiEspeleotemasRedux;
    dispatch(setEspeleotemasPossui(newValue));
    if (!newValue) {
      clearForm(); 
      setItemFormErrors({});
      setItemFormValidationAttempted(false);
    }
  };

  const clearForm = () => {
    setCurrentTipo("");
    setCurrentPorte(undefined);
    setCurrentFreq("");
    setCurrentConservacao("");
    setItemFormErrors({}); // Limpa erros do formulário do item
    setItemFormValidationAttempted(false); // Reseta a tentativa de validação do item
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
    setItemFormValidationAttempted(true); // Marcar tentativa de submissão do item
    if (!validateItemForm()) {
      Alert.alert(
        "Preencha todos os campos",
        "Por favor, preencha os campos do espeleotema faltantes antes de adicionar."
      );
      return;
    }
    const newItemPayload: Omit<EspeleotemaItem, "id"> = {
      tipo: currentTipo.trim(),
      porte: currentPorte, // Já é PorteValue | undefined, validado por isFieldFilled
      frequencia: currentFreq.trim(), // Validado por isFieldFilled
      estado_conservacao: currentConservacao.trim(), // Validado por isFieldFilled
    };
    dispatch(addEspeleotemaItem(newItemPayload));
    clearForm(); // Limpa o formulário e os erros do item após adicionar
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
        },
      ]
    );
  };

  const porteOptions = [
    { id: "milimetrico", value: "milimetrico", label: "Milimétrico" },
    { id: "centimetrico", value: "centimetrico", label: "Centimétrico" },
    { id: "metrico", value: "metrico", label: "Métrico" },
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
      {!!stepEightGlobalErrors.espeleotemas_lista && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
          {stepEightGlobalErrors.espeleotemas_lista}
        </TextInter>
      )}
       {!!stepEightGlobalErrors.espeleotemas_lista_itens && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
          {stepEightGlobalErrors.espeleotemas_lista_itens}
        </TextInter>
      )}
      <Divider />
      {possuiEspeleotemasRedux && (
        <>
          <Input
            placeholder="Digite o tipo (Ex: Estalactite)"
            label="Tipo" 
            value={currentTipo}
            onChangeText={setCurrentTipo}
            hasError={!!itemFormErrors.currentTipo}
            errorMessage={itemFormErrors.currentTipo}
            required
          />
          <TextInter color={colors.white[100]} weight="medium" style={styles.labelSpacing}>
            Porte *
          </TextInter>
          <Divider height={6} />
          <RadioButtonGroup
            onValueChange={(value) => setCurrentPorte(value as PorteValue)}
            value={currentPorte ?? ""} 
            options={porteOptions}
            // Não há prop 'hasError' direta no RadioButtonGroup, mostramos erro abaixo
          />
          {!!itemFormErrors.currentPorte && (
            <TextInter color={colors.error[100]} fontSize={12} style={styles.errorTextRadio}>
                {itemFormErrors.currentPorte}
            </TextInter>
          )}
          <Divider height={12} />
          <Input
            placeholder="Digite a frequência (Ex: Abundante)"
            label="Frequência"
            value={currentFreq}
            onChangeText={setCurrentFreq}
            hasError={!!itemFormErrors.currentFreq}
            errorMessage={itemFormErrors.currentFreq}
            required
          />
          <Input
            placeholder="Qual o estado de conservação?"
            label="Estado de Conservação"
            value={currentConservacao}
            onChangeText={setCurrentConservacao}
            hasError={!!itemFormErrors.currentConservacao}
            errorMessage={itemFormErrors.currentConservacao}
            required
          />
          <LongButton
            title="Adicionar Espeleotema" 
            onPress={handleAddEspeleotema}
            leftIcon={
              <Ionicons name="add" color={colors.white[100]} size={25} />
            }
          />
          <Divider />

          {itemList.length > 0 && (
            <>
              <TextInter color={colors.white[100]} weight="medium" style={styles.listHeader}>
                Espeleotemas Adicionados
              </TextInter>
              <Divider height={14} />
            </>
          )}
          {itemList.map(
            (item) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemTextContainer}>
                  <TextInter weight="bold" color={colors.white[100]}>
                    {item.tipo}
                  </TextInter>
                  <TextInter fontSize={12} color={colors.white[80]}>
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
    paddingBottom: 30,
  },
  itemContainer: {
    backgroundColor: colors.dark[80],
    borderRadius: 8,
    paddingVertical: 10, 
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
    padding: 8, 
  },
  labelSpacing: { 
    marginTop: 10,
    marginBottom: 0, // Reduzido para aproximar do RadioButtonGroup
  },
  addButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  listHeader: {
    marginTop: 15,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 4,
    // marginBottom: 8, // Removido para não criar muito espaço se o erro for para o RadioButton
  },
  errorTextRadio: { // Estilo específico para erro abaixo do RadioButtonGroup
    color: colors.error[100],
    fontSize: 12,
    marginTop: -2, // Ajuste fino para posicionar abaixo do RadioGroup
    marginBottom: 8,
  }
});
