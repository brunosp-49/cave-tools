import React, { FC, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  GeneralSelectOption, RouterProps, Biota, Invertebrado, InvertebradoAquatico,
  BiotaStandardCategoryKey, BiotaCustomObjectCategoryKey,
  BatFeedingType, BatQuantidadeType, batQuantidadeOptions
} from "../../../types";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import { DividerColorLine } from "../../../components/dividerColorLine";
import { InputMultiline } from "../../../components/inputMultiline";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  setBiotaPossui,
  toggleBiotaTypeInArray,
  toggleBiotaObjectTypeFlag,
  setBiotaCategoryOutro,
  addOrUpdateMorcegoTipo,
  removeMorcegoTipo,
  setMorcegosObservacoes,
  toggleBiotaOutroEnabled,
} from "../../../redux/cavitySlice";

interface StepNineProps extends RouterProps {
  validationAttempted: boolean;
}

// Consider moving to a shared utils file
const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
};

const invertebradoKeys: (keyof Omit<Invertebrado, 'possui' | 'outroEnabled' | 'outro'>)[] = [
    'aranha', 'acaro', 'amblipigio', 'opiliao', 'pseudo_escorpiao', 'escorpiao',
    'formiga', 'besouro', 'mosca', 'mosquito', 'mariposa', 'barata', 'cupim',
    'grilo', 'percevejo', 'piolho_de_cobra', 'centopeia', 'lacraia',
    'caramujo_terrestre', 'tatuzinho_de_jardim'
];
const invertebradoLabels: Record<typeof invertebradoKeys[number], string> = {
    aranha: "Aranha", acaro: "Ácaro", amblipigio: "Amblípigo", opiliao: "Opilião",
    pseudo_escorpiao: "Pseudo-escorpião", escorpiao: "Escorpião", formiga: "Formiga",
    besouro: "Besouro", mosca: "Mosca", mosquito: "Mosquito", mariposa: "Mariposa",
    barata: "Barata", cupim: "Cupim", grilo: "Grilo", percevejo: "Percevejo",
    piolho_de_cobra: "Piolho de cobra", centopeia: "Centopeia", lacraia: "Lacraia",
    caramujo_terrestre: "Caramujo terrestre", tatuzinho_de_jardim: "Tatuzinho de jardim"
};

const invertebradoAquaticoKeys: (keyof Omit<InvertebradoAquatico, 'possui' | 'outroEnabled' | 'outro'>)[] = [
    'caramujo_aquatico', 'bivalve', 'camarao', 'caranguejo'
];
const invertebradoAquaticoLabels: Record<typeof invertebradoAquaticoKeys[number], string> = {
    caramujo_aquatico: "Caramujo aquático", bivalve: "Bivalve", camarao: "Camarão", caranguejo: "Caranguejo"
};

export const StepNine: FC<StepNineProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const biota = useSelector((state: RootState) => state.cavity.cavidade.biota) ?? {};
  const morcegos = biota.morcegos ?? { possui: false, tipos: [], observacoes_gerais: "" };
  const morcegosTiposArray = morcegos.tipos ?? [];

  const stepNineErrors = useMemo(() => {
    if (!validationAttempted) return {};
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Campo obrigatório.";
    const errorMsgSelectOrOther = "Selecione pelo menos um tipo ou preencha 'Outro'.";
    const errorMsgSelectQuantity = "Selecione a quantidade.";

    const checkCustomObjectCategory = (categoryKey: BiotaCustomObjectCategoryKey, categoryData?: any) => {
        if (categoryData?.possui) {
            const specificTypeSelected = Object.keys(categoryData).some(key =>
                key !== 'possui' && key !== 'outroEnabled' && key !== 'outro' && categoryData[key] === true
            );
            const outroValido = categoryData.outroEnabled && isFieldFilled(categoryData.outro);
            if (!specificTypeSelected && !outroValido) {
                errors[`${categoryKey}_geral`] = errorMsgSelectOrOther;
            }
            if (categoryData.outroEnabled && !isFieldFilled(categoryData.outro)) {
                errors[`${categoryKey}_outro_texto`] = errorMsgRequired;
            }
        }
    };

    const checkStandardCategory = (categoryKey: BiotaStandardCategoryKey, categoryData?: typeof biota.anfibios) => {
        if (categoryData?.possui) {
            const tiposValidos = Array.isArray(categoryData.tipos) && categoryData.tipos.length > 0;
            const outroValido = categoryData.outroEnabled && isFieldFilled(categoryData.outro);
            if (!tiposValidos && !outroValido) {
                errors[`${categoryKey}_geral`] = errorMsgSelectOrOther;
            }
            if (categoryData.outroEnabled && !isFieldFilled(categoryData.outro)) {
                 errors[`${categoryKey}_outro_texto`] = errorMsgRequired;
            }
        }
    };

    checkCustomObjectCategory("invertebrado", biota.invertebrado);
    checkCustomObjectCategory("invertebrado_aquatico", biota.invertebrado_aquatico);
    checkStandardCategory("anfibios", biota.anfibios);
    checkStandardCategory("repteis", biota.repteis);
    checkStandardCategory("aves", biota.aves);

    if (morcegos.possui) {
      if (!Array.isArray(morcegosTiposArray) || morcegosTiposArray.length === 0) {
        errors.morcegos_lista = "Adicione pelo menos um tipo de morcego se 'Possui' estiver marcado.";
      } else {
        morcegosTiposArray.forEach(item => {
          if (!isFieldFilled(item.quantidade)) {
            errors[`morcegos_quantidade_${item.tipo}`] = errorMsgSelectQuantity;
          }
        });
      }
    }
    return errors;
  }, [validationAttempted, biota, morcegos, morcegosTiposArray]);

  const handleCategoryPossuiToggle = useCallback(
    (categoryName: keyof Biota) => {
      const catData = biota[categoryName] as any;
      const currentPossui = catData?.possui ?? false;
      dispatch(setBiotaPossui({ category: categoryName, possui: !currentPossui }));
    },
    [dispatch, biota]
  );

  const handleStandardCategoryTypeToggle = useCallback(
    (categoryName: BiotaStandardCategoryKey, typeValue: string) => {
      dispatch(toggleBiotaTypeInArray({ category: categoryName, type: typeValue }));
    },
    [dispatch]
  );

  const handleCustomObjectCategoryTypeToggle = useCallback(
    (categoryName: BiotaCustomObjectCategoryKey, typeKey: string) => {
      dispatch(toggleBiotaObjectTypeFlag({ category: categoryName, typeKey: typeKey }));
    },
    [dispatch]
  );

  const handleCategoryOutroChange = useCallback(
    (categoryName: BiotaStandardCategoryKey | BiotaCustomObjectCategoryKey, text: string) => {
      dispatch(setBiotaCategoryOutro({ category: categoryName, text: text || undefined }));
    },
    [dispatch]
  );

  const handleToggleOutroEnabled = useCallback(
    (categoryName: BiotaStandardCategoryKey | BiotaCustomObjectCategoryKey) => {
      dispatch(toggleBiotaOutroEnabled({ category: categoryName }));
    },
    [dispatch]
  );

  const handleFeedingTypeToggle = useCallback(
    (feedingTypeName: BatFeedingType) => {
      const exists = morcegosTiposArray.some(item => item.tipo === feedingTypeName);
      if (exists) {
        dispatch(removeMorcegoTipo(feedingTypeName));
      } else {
        dispatch(addOrUpdateMorcegoTipo({ tipo: feedingTypeName, quantidade: undefined }));
      }
    },
    [dispatch, morcegosTiposArray]
  );

  const handleQuantidadeChange = useCallback(
    (feedingTypeName: BatFeedingType, value: BatQuantidadeType | "") => {
      dispatch(addOrUpdateMorcegoTipo({ tipo: feedingTypeName, quantidade: value === "" ? undefined : value }));
    },
    [dispatch]
  );

  const handleObservacoesGeraisChange = useCallback(
    (text: string) => {
      dispatch(setMorcegosObservacoes(text || undefined));
    },
    [dispatch]
  );

  const renderCustomObjectCategorySection = (
    categoryKey: BiotaCustomObjectCategoryKey,
    title: string,
    typeKeys: string[],
    typeLabels: Record<string, string>
  ) => {
    const categoryState = biota[categoryKey] as any;
    const possui = categoryState?.possui ?? false;
    const outroEnabled = categoryState?.outroEnabled ?? false;
    const currentOutro = categoryState?.outro ?? "";

    return (
      <View key={categoryKey}>
        <Checkbox label={title} checked={possui} onChange={() => handleCategoryPossuiToggle(categoryKey)} />
        {!!stepNineErrors[`${categoryKey}_geral`] && possui && (
            <TextInter style={styles.errorText}>{stepNineErrors[`${categoryKey}_geral`]}</TextInter>
        )}
        {possui && (
          <View style={styles.secondLayer}>
            {typeKeys.map((typeKey) => (
              <React.Fragment key={typeKey}>
                <Divider height={12} />
                <Checkbox label={typeLabels[typeKey] || typeKey}
                  checked={categoryState?.[typeKey] ?? false}
                  onChange={() => handleCustomObjectCategoryTypeToggle(categoryKey, typeKey)} />
              </React.Fragment>
            ))}
            <Divider height={12} />
            <Checkbox label="Outro" checked={outroEnabled} onChange={() => handleToggleOutroEnabled(categoryKey)} />
            <Divider height={12} />
            {outroEnabled && (
              <Input label="Qual outro?" placeholder="Especifique" value={currentOutro}
                onChangeText={(text) => handleCategoryOutroChange(categoryKey, text)}
                hasError={!!stepNineErrors[`${categoryKey}_outro_texto`]}
                errorMessage={stepNineErrors[`${categoryKey}_outro_texto`]} required />
            )}
          </View>
        )}
        <DividerColorLine /><Divider height={14}/>
      </View>
    );
  };

  const renderStandardCategorySection = (
    categoryKey: BiotaStandardCategoryKey,
    title: string,
    types: string[]
  ) => {
    const categoryState = biota[categoryKey];
    const possui = categoryState?.possui ?? false;
    const currentTipos = categoryState?.tipos ?? [];
    const outroEnabled = categoryState?.outroEnabled ?? false;
    const currentOutro = categoryState?.outro ?? "";

    return (
      <View key={categoryKey}>
        <Checkbox label={title} checked={possui} onChange={() => handleCategoryPossuiToggle(categoryKey)} />
         {!!stepNineErrors[`${categoryKey}_geral`] && possui && (
            <TextInter style={styles.errorText}>{stepNineErrors[`${categoryKey}_geral`]}</TextInter>
        )}
        {possui && (
          <View style={styles.secondLayer}>
            {types.map((type) => (
              <React.Fragment key={type}>
                <Divider height={12} />
                <Checkbox label={type} checked={currentTipos.includes(type)}
                  onChange={() => handleStandardCategoryTypeToggle(categoryKey, type)} />
              </React.Fragment>
            ))}
            <Divider height={12} />
            <Checkbox label="Outro" checked={outroEnabled} onChange={() => handleToggleOutroEnabled(categoryKey)} />
            <Divider height={12} />
            {outroEnabled && (
              <Input label="Qual outro?" placeholder="Especifique" value={currentOutro}
                onChangeText={(text) => handleCategoryOutroChange(categoryKey, text)}
                hasError={!!stepNineErrors[`${categoryKey}_outro_texto`]}
                errorMessage={stepNineErrors[`${categoryKey}_outro_texto`]} required />
            )}
          </View>
        )}
        <DividerColorLine /><Divider height={14}/>
      </View>
    );
  };

  const renderBatFeedingSection = ( feedingKey: BatFeedingType, label: string ) => {
    const feedingItem = morcegosTiposArray.find(item => item.tipo === feedingKey);
    const isChecked = !!feedingItem;
    const currentQuantidade = feedingItem?.quantidade;
    const selectError = stepNineErrors[`morcegos_quantidade_${feedingKey}`];

    return (
      <View key={feedingKey}>
        <Checkbox label={label} checked={isChecked} onChange={() => handleFeedingTypeToggle(feedingKey)} />
        {isChecked && (
          <>
            <Divider height={12} />
            <Select reduceSize
              onChangeText={(obj) => {
                const value = obj.id === "" ? "" : (obj.id as BatQuantidadeType);
                handleQuantidadeChange(feedingKey, value as BatQuantidadeType | "");
              }}
              value={batQuantidadeOptions.find(option => option.value === currentQuantidade)?.label ?? ""}
              placeholder="Selecione Quantidade" optionsList={batQuantidadeOptions}
              hasError={!!selectError} errorMessage={selectError} required />
          </>
        )}
        <Divider height={12} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">Biota</TextInter>
      <Divider />
      {renderCustomObjectCategorySection("invertebrado", "Invertebrado", invertebradoKeys, invertebradoLabels)}
      {renderCustomObjectCategorySection("invertebrado_aquatico", "Invertebrado aquático", invertebradoAquaticoKeys, invertebradoAquaticoLabels)}
      {renderStandardCategorySection("anfibios", "Anfíbio", ["Sapo", "Rã", "Perereca"])}
      {renderStandardCategorySection("repteis", "Réptil", ["Serpente", "Lagarto"])}
      {renderStandardCategorySection("aves", "Ave", ["Urubu", "Gavião", "Arara azul", "Arara vermelha", "Papagaio", "Coruja"])}
      <Checkbox label="Peixe" checked={biota.peixes || false} onChange={() => handleCategoryPossuiToggle("peixes")} />
      <DividerColorLine /><Divider height={14}/>
      <Checkbox label="Morcego" checked={morcegos.possui || false} onChange={() => handleCategoryPossuiToggle("morcegos")} />
      {!!stepNineErrors.morcegos_lista && morcegos.possui && (
          <TextInter style={styles.errorText}>{stepNineErrors.morcegos_lista}</TextInter>
      )}
      <Divider height={14} />
      {morcegos.possui && (
        <View style={styles.secondLayer}>
          {renderBatFeedingSection("frugivoro", "Frugívoro")}
          {renderBatFeedingSection("hematofago", "Hematófago")}
          {renderBatFeedingSection("carnivoro", "Carnívoro")}
          {renderBatFeedingSection("nectarivoro", "Nectarívoro")}
          {renderBatFeedingSection("insetivoro", "Insetívoro")}
          {renderBatFeedingSection("piscivoro", "Piscívoro")}
          {renderBatFeedingSection("indeterminado", "Indeterminado")}
          <InputMultiline placeholder="Observações sobre morcegos..." label="Morcego - Observações Gerais"
            value={morcegos.observacoes_gerais || ""} onChangeText={handleObservacoesGeraisChange} />
        </View>
      )}
      <StatusBar style="light" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  contentContainer: { paddingBottom: 30 },
  secondLayer: { paddingLeft: 20, marginTop: 5, marginBottom: 5 },
  errorText: { color: colors.error[100], fontSize: 12, marginTop: 4, marginBottom: 8, paddingLeft: 5 },
});