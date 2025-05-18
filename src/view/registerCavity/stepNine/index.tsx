import React, { FC, useCallback, useMemo } from "react"; // Adicionado useMemo, FC
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GeneralSelectOption, RouterProps } from "../../../types"; // RouterProps importado
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
  setBiotaCategoryOutro,
  addOrUpdateMorcegoTipo,
  removeMorcegoTipo,
  setMorcegosObservacoes,
  toggleBiotaOutroEnabled,
} from "../../../redux/cavitySlice";

import { Biota } from "../../../types";

// Interface para as props do StepNine
// Se StepComponentProps já está definido em um arquivo de tipos central, importe-o de lá.
interface StepNineProps extends RouterProps {
  validationAttempted: boolean;
}

type BiotaCategoryKey = keyof Pick<
  Biota,
  "invertebrados" | "invertebrados_aquaticos" | "anfibios" | "repteis" | "aves"
>;
type BatQuantidadeType = "individuo" | "grupo" | "colonia" | "colonia_grande";
type BatFeedingType = NonNullable<
  NonNullable<NonNullable<Biota["morcegos"]>["tipos"]>[number]["tipo"]
>;

const batQuantidadeOptions: GeneralSelectOption<BatQuantidadeType | "">[] = [
  { id: "placeholder", value: "", label: "Selecione Quantidade..." },
  { id: "individuo", value: "individuo", label: "Indivíduo" },
  { id: "grupo", value: "grupo", label: "Grupo Pequeno (<50)" },
  { id: "colonia", value: "colonia", label: "Colônia (50-1000)" },
  { id: "colonia_grande", value: "colonia_grande", label: "Colônia Grande (>1000)" },
];

const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
};

export const StepNine: FC<StepNineProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const biota = useSelector((state: RootState) => state.cavity.cavidade.biota) ?? {};
  const morcegos = biota.morcegos ?? { possui: false, tipos: [], observacoes_gerais: "" }; // Garante defaults
  const morcegosTiposArray = morcegos.tipos ?? [];

  // Lógica de Erros Específicos para StepNine
  const stepNineErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Campo obrigatório.";
    const errorMsgSelectOrOther = "Selecione um tipo ou preencha 'Outro'.";
    const errorMsgSelectQuantity = "Selecione a quantidade.";

    const checkCategory = (categoryKey: BiotaCategoryKey, categoryData?: typeof biota.invertebrados) => {
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

    checkCategory("invertebrados", biota.invertebrados);
    checkCategory("invertebrados_aquaticos", biota.invertebrados_aquaticos);
    checkCategory("anfibios", biota.anfibios);
    checkCategory("repteis", biota.repteis);
    checkCategory("aves", biota.aves);

    // Validação Morcegos
    if (morcegos.possui) {
      if (!Array.isArray(morcegosTiposArray) || morcegosTiposArray.length === 0) {
        errors.morcegos_lista = "Adicione pelo menos um tipo de morcego se 'Possui' estiver marcado.";
      } else {
        morcegosTiposArray.forEach(item => {
          if (!isFieldFilled(item.quantidade)) {
            // Chave de erro específica para cada tipo de alimentação para o Select de quantidade
            errors[`morcegos_quantidade_${item.tipo}`] = errorMsgSelectQuantity;
          }
        });
      }
      // Observações gerais não são obrigatórias pela lógica de validateStep, mas pode adicionar se quiser
      if (!isFieldFilled(morcegos.observacoes_gerais)) {
        errors.morcegos_observacoes = errorMsgRequired;
      }
    }
    
    // Validação Peixes (se for um booleano simples e obrigatório)
    // A validação atual em validateStep apenas checa `typeof biota.peixes === 'boolean'`
    // Se for obrigatório escolher Sim ou Não:
    // if (typeof biota.peixes === 'undefined') {
    //   errors.peixes_selecao = "Indique se há presença de peixes.";
    // }

    return errors;
  }, [validationAttempted, biota, morcegos, morcegosTiposArray]);

  const handleCategoryPossuiToggle = useCallback(
    (categoryName: BiotaCategoryKey | "peixes" | "morcegos") => {
      let currentPossui = false;
      if (categoryName === "peixes") {
        currentPossui = biota.peixes ?? false;
      } else if (categoryName === "morcegos") {
        currentPossui = biota.morcegos?.possui ?? false;
      } else {
        currentPossui = biota[categoryName]?.possui ?? false;
      }
      dispatch(setBiotaPossui({ category: categoryName, possui: !currentPossui }));
    },
    [dispatch, biota]
  );

  const handleCategoryTypeToggle = useCallback(
    (categoryName: BiotaCategoryKey, typeValue: string) => {
      dispatch(toggleBiotaTypeInArray({ category: categoryName, type: typeValue }));
    },
    [dispatch]
  );

  const handleCategoryOutroChange = useCallback(
    (categoryName: BiotaCategoryKey, text: string) => {
      dispatch(setBiotaCategoryOutro({ category: categoryName, text: text || undefined }));
    },
    [dispatch]
  );

  const handleToggleOutroEnabled = useCallback(
    (categoryName: BiotaCategoryKey) => {
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
    (feedingTypeName: BatFeedingType, value: BatQuantidadeType | "") => { // Aceita "" do placeholder
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

  const renderCategorySection = (
    categoryKey: BiotaCategoryKey,
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
        <Checkbox
          label={title}
          checked={possui}
          onChange={() => handleCategoryPossuiToggle(categoryKey)}
        />
        {!!stepNineErrors[`${categoryKey}_geral`] && possui && (
            <TextInter style={styles.errorText}>{stepNineErrors[`${categoryKey}_geral`]}</TextInter>
        )}
        {possui && (
          <View style={styles.secondLayer}>
            {types.map((type) => (
              <React.Fragment key={type}>
                <Divider height={12} />
                <Checkbox
                  label={type}
                  checked={currentTipos.includes(type)}
                  onChange={() => handleCategoryTypeToggle(categoryKey, type)}
                />
              </React.Fragment>
            ))}
            <Divider height={12} />
            <Checkbox
              label="Outro"
              checked={outroEnabled}
              onChange={() => handleToggleOutroEnabled(categoryKey)}
            />
            <Divider height={12} />
            {outroEnabled && (
              <Input
                label="Qual outro?"
                placeholder="Especifique"
                value={currentOutro}
                onChangeText={(text) => handleCategoryOutroChange(categoryKey, text)}
                hasError={!!stepNineErrors[`${categoryKey}_outro_texto`]}
                errorMessage={stepNineErrors[`${categoryKey}_outro_texto`]}
                required
              />
            )}
          </View>
        )}
        <DividerColorLine />
        <Divider height={14}/>
      </View>
    );
  };

  const renderBatFeedingSection = (
    feedingKey: BatFeedingType,
    label: string
  ) => {
    const feedingItem = morcegosTiposArray.find(item => item.tipo === feedingKey);
    const isChecked = !!feedingItem;
    const currentQuantidade = feedingItem?.quantidade;
    const selectError = stepNineErrors[`morcegos_quantidade_${feedingKey}`];

    return (
      <View key={feedingKey}>
        <Checkbox
          label={label}
          checked={isChecked}
          onChange={() => handleFeedingTypeToggle(feedingKey)}
        />
        {isChecked && (
          <>
            <Divider height={12} />
            <Select
              reduceSize
              onChangeText={(obj) => {
                const value = obj.id === "" ? "" : (obj.id as BatQuantidadeType);
                handleQuantidadeChange(feedingKey, value as BatQuantidadeType | "");
              }}
              value={batQuantidadeOptions.find(option => option.value === currentQuantidade)?.label ?? ""}
              placeholder="Selecione Quantidade"
              optionsList={batQuantidadeOptions}
              hasError={!!selectError}
              errorMessage={selectError}
              required
            />
          </>
        )}
        <Divider height={12} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Biota
      </TextInter>
      <Divider />

      {renderCategorySection("invertebrados", "Invertebrados", [
        "Aranha", "Ácaro", "Amblípigo", "Opilião", "Pseudo-escorpião", "Escorpião",
        "Formiga", "Besouro", "Mosca", "Mosquito", "Mariposa", "Barata", "Cupim",
        "Grilo", "Percevejo", "Piolho de cobra", "Centopeia", "Lacraia", "Caramujo",
        "Tatuzinho de jardim",
      ])}
      {renderCategorySection("invertebrados_aquaticos", "Invertebrado aquático", 
        ["Caramujo", "Bivalve", "Camarão", "Caranguejo"]
      )}
      {renderCategorySection("anfibios", "Anfíbio", ["Sapo", "Rã", "Perereca"])}
      {renderCategorySection("repteis", "Réptil", ["Serpente", "Lagarto"])}
      {renderCategorySection("aves", "Ave", [
        "Urubu", "Gavião", "Arara azul", "Arara vermelha", "Papagaio", "Coruja",
      ])}

      <Checkbox
        label="Peixe"
        checked={biota.peixes || false}
        onChange={() => handleCategoryPossuiToggle("peixes")}
      />
      {/* {!!stepNineErrors.peixes_selecao && (
          <TextInter style={styles.errorText}>{stepNineErrors.peixes_selecao}</TextInter>
      )} */}
      <DividerColorLine />
      <Divider height={14}/>

      <Checkbox
        label="Morcego"
        checked={morcegos.possui || false}
        onChange={() => handleCategoryPossuiToggle("morcegos")}
      />
      {!!stepNineErrors.morcegos_lista && morcegos.possui && (
          <TextInter style={styles.errorText}>{stepNineErrors.morcegos_lista}</TextInter>
      )}
      <Divider height={12}/>
      {morcegos.possui && (
        <View style={styles.secondLayer}>
          {renderBatFeedingSection("frugivoro", "Frugívoro")}
          {renderBatFeedingSection("hematofago", "Hematófago")}
          {renderBatFeedingSection("carnivoro", "Carnívoro")}
          {renderBatFeedingSection("nectarivoro", "Nectarívoro")}
          {renderBatFeedingSection("insetivoro", "Insetívoro")}
          {renderBatFeedingSection("piscivoro", "Piscívoro")}
          {renderBatFeedingSection("indeterminado", "Indeterminado")}

          <InputMultiline
            placeholder="Observações sobre morcegos..."
            label="Morcego - Observações Gerais"
            value={morcegos.observacoes_gerais || ""}
            onChangeText={handleObservacoesGeraisChange}
            // hasError={!!stepNineErrors.morcegos_observacoes} 
            // errorMessage={stepNineErrors.morcegos_observacoes}
          />
        </View>
      )}
      <StatusBar style="light" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  subSectionTitle: {
    marginTop: 10,
    marginBottom: 5,
    color: colors.white[100],
  },
  subSubSectionTitle: {
    marginTop: 5,
    marginBottom: 5,
    color: colors.white[100],
  },
  secondLayer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  thirdLayer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  inputSpacing: { 
    marginBottom: 12,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 5,
  },
});
