import React, { FC, useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native"; // Import ScrollView
import { StatusBar } from "expo-status-bar";
// Types and components
import { SelectOption as GeneralSelectOption } from "../../../types"; // Assuming SelectOption is exported from your types
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import { DividerColorLine } from "../../../components/dividerColorLine";
import { InputMultiline } from "../../../components/inputMultiline";

// Import Redux hooks, state/dispatch types, and the specific actions
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store"; // Adjust path
import {
  setBiotaPossui,
  toggleBiotaTypeInArray,
  setBiotaCategoryOutro,
  addOrUpdateMorcegoTipo,
  removeMorcegoTipo,
  setMorcegosObservacoes,
  toggleBiotaOutroEnabled,
} from "../../../redux/cavitySlice"; // Adjust path for SPECIFIC actions

// Import specific types used in this step
import { Biota } from "../../../types"; // Adjust path

// --- Helper Types Derived from Biota Interface ---
type BiotaCategoryKey = keyof Pick<
  Biota,
  "invertebrados" | "invertebrados_aquaticos" | "anfibios" | "repteis" | "aves"
>;
type BatQuantidadeType = "individuo" | "grupo" | "colonia" | "colonia_grande";
// Derive BatFeedingType from the updated Biota type
type BatFeedingType = NonNullable<
  NonNullable<NonNullable<Biota["morcegos"]>["tipos"]>[number]["tipo"]
>;

// --- Constants ---
const batQuantidadeOptions: GeneralSelectOption<BatQuantidadeType | "">[] = [
  { id: "placeholder", value: "", label: "Selecione Quantidade..." },
  { id: "individuo", value: "individuo", label: "Indivíduo" },
  { id: "grupo", value: "grupo", label: "Grupo Pequeno (<50)" },
  { id: "colonia", value: "colonia", label: "Colônia (50-1000)" },
  {
    id: "colonia_grande",
    value: "colonia_grande",
    label: "Colônia Grande (>1000)",
  },
];

// --- Component Definition ---
export const StepNine: FC = () => {
  // --- Redux Setup ---
  const dispatch = useDispatch<AppDispatch>();
  const biota =
    useSelector((state: RootState & { cavity: { cavidade: { biota: Biota } } }) => state.cavity.cavidade.biota) ?? {};
  const morcegos = biota.morcegos ?? {};
  const morcegosTiposArray = morcegos.tipos ?? [];

  // --- Handlers ---
  // These now dispatch specific actions

  const handleCategoryPossuiToggle = useCallback(
    (categoryName: BiotaCategoryKey | "peixes" | "morcegos") => {
      const currentPossui =
        categoryName === "peixes"
          ? biota.peixes ?? false
          : biota[categoryName]?.possui ?? false;
      dispatch(
        setBiotaPossui({ category: categoryName, possui: !currentPossui })
      );
    },
    [dispatch, biota]
  ); // Simplified dependency

  const handleCategoryTypeToggle = useCallback(
    (categoryName: BiotaCategoryKey, typeValue: string) => {
      dispatch(
        toggleBiotaTypeInArray({ category: categoryName, type: typeValue })
      );
    },
    [dispatch]
  );

  const handleCategoryOutroChange = useCallback(
    (categoryName: BiotaCategoryKey, text: string) => {
      dispatch(
        setBiotaCategoryOutro({
          category: categoryName,
          text: text || undefined,
        })
      );
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
      const exists = morcegosTiposArray.some(
        (item) => item.tipo === feedingTypeName
      );
      if (exists) {
        dispatch(removeMorcegoTipo(feedingTypeName));
      } else {
        dispatch(
          addOrUpdateMorcegoTipo({
            tipo: feedingTypeName,
            quantidade: undefined,
          })
        );
      }
    },
    [dispatch, morcegosTiposArray]
  );

  const handleQuantidadeChange = useCallback(
    (feedingTypeName: BatFeedingType, value: BatQuantidadeType | undefined) => {
      dispatch(
        addOrUpdateMorcegoTipo({ tipo: feedingTypeName, quantidade: value })
      );
    },
    [dispatch]
  );

  const handleObservacoesGeraisChange = useCallback(
    (text: string) => {
      dispatch(setMorcegosObservacoes(text || undefined));
    },
    [dispatch]
  );

  // --- Helper Function to Render Category Section ---
  const renderCategorySection = (
    categoryKey: BiotaCategoryKey,
    title: string,
    types: string[] // Checkbox labels/values for the 'tipos' array
  ) => {
    const categoryState = biota[categoryKey];
    const possui = categoryState?.possui ?? false;
    const currentTipos = categoryState?.tipos ?? [];
    const outroEnabled = categoryState?.outroEnabled ?? false;
    const currentOutro = categoryState?.outro ?? "";

    return (
      <View key={categoryKey}>
        {/* Main category toggle */}
        <Checkbox
          label={title}
          checked={possui}
          onChange={() => handleCategoryPossuiToggle(categoryKey)}
        />
        {/* Nested details, only shown if 'possui' is true */}
        {possui && (
          <View style={styles.secondLayer}>
            {/* Map through specific types for this category */}
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
            {/* 'Outro' Checkbox and Input for this category */}
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
                onChangeText={(text) =>
                  handleCategoryOutroChange(categoryKey, text)
                }
              />
            )}
          </View>
        )}
        <DividerColorLine />
        <Divider />
      </View>
    );
  };

  // --- Helper Function to Render Bat Feeding Section ---
  const renderBatFeedingSection = (
    feedingKey: BatFeedingType,
    label: string
  ) => {
    // Find if this feeding type exists in the Redux array
    const feedingItem = morcegosTiposArray.find(
      (item) => item.tipo === feedingKey
    );
    const isChecked = !!feedingItem; // Checkbox is checked if item exists
    const currentQuantidade = feedingItem?.quantidade;

    return (
      <View key={feedingKey}>
        {/* Checkbox adds/removes the feeding type from the Redux array */}
        <Checkbox
          label={label}
          checked={isChecked}
          onChange={() => handleFeedingTypeToggle(feedingKey)}
        />
        {/* Conditionally render Select only if checkbox is checked */}
        {isChecked && (
          <>
            <Divider height={12} />
            <Select
              reduceSize
              onChangeText={(obj) => {
                const value =
                  obj.id === "" ? undefined : (obj.id as BatQuantidadeType);
                // Update quantity for this specific feeding type in the array
                handleQuantidadeChange(feedingKey, value);
              }}
              value={
                batQuantidadeOptions.find(
                  (option) => option.value === currentQuantidade
                )?.label ?? ""
              } // Bind value from array item
              placeholder="Selecione Quantidade"
              optionsList={batQuantidadeOptions} // Use defined options
            />
          </>
        )}
        <Divider height={12} />
      </View>
    );
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Biota
      </TextInter>
      <Divider />

      {/* Render Categories using the helper */}
      {renderCategorySection("invertebrados", "Invertebrados", [
        "Aranha",
        "Ácaro",
        "Amblípigo",
        "Opilião",
        "Pseudo-escorpião",
        "Escorpião",
        "Formiga",
        "Besouro",
        "Mosca",
        "Mosquito",
        "Mariposa",
        "Barata",
        "Cupim",
        "Grilo",
        "Percevejo",
        "Piolho de cobra",
        "Centopeia",
        "Lacraia",
        "Caramujo",
        "Tatuzinho de jardim",
      ])}
      {renderCategorySection(
        "invertebrados_aquaticos",
        "Invertebrado aquático",
        ["Caramujo", "Bivalve", "Camarão", "Caranguejo"]
      )}
      {renderCategorySection("anfibios", "Anfíbio", ["Sapo", "Rã", "Perereca"])}
      {renderCategorySection("repteis", "Réptil", ["Serpente", "Lagarto"])}
      {renderCategorySection("aves", "Ave", [
        "Urubu",
        "Gavião",
        "Arara azul",
        "Arara vermelha",
        "Papagaio",
        "Coruja",
      ])}

      {/* Peixe */}
      <Checkbox
        label="Peixe"
        checked={biota.peixes || false}
        onChange={() => handleCategoryPossuiToggle("peixes")} // Use generic handler
      />
      <Divider height={12} />
      <Checkbox
        label="Morcego"
        checked={morcegos.possui || false}
        onChange={() => handleCategoryPossuiToggle("morcegos")} // Use generic handler
      />
      {morcegos.possui && (
        <View style={styles.secondLayer}>
          {/* Render Bat Feeding Sections using the helper */}
          {renderBatFeedingSection("frugivoro", "Frugívoro")}
          {renderBatFeedingSection("hematofago", "Hematófago")}
          {renderBatFeedingSection("carnivoro", "Carnívoro")}
          {renderBatFeedingSection("nectarivoro", "Nectarívoro")}
          {renderBatFeedingSection("insetivoro", "Insetívoro")}
          {renderBatFeedingSection("piscivoro", "Piscívoro")}
          {renderBatFeedingSection("indeterminado", "Indeterminado")}

          {/* Observacoes Gerais */}
          <InputMultiline
            placeholder="Observações sobre morcegos..."
            label="Morcego - Observações Gerais"
            value={morcegos.observacoes_gerais || ""}
            onChangeText={handleObservacoesGeraisChange} // Uses specific action via handler
          />
        </View>
      )}

      <StatusBar style="light" />
    </View>
  );
};

// Styles defined here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  subSectionTitle: {
    // Added for consistency
    marginTop: 10,
    marginBottom: 5,
    color: colors.white[100], // Added color
  },
  subSubSectionTitle: {
    // Added for consistency
    marginTop: 5,
    marginBottom: 5,
    color: colors.white[100], // Added color
  },
  secondLayer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
  },
  thirdLayer: {
    // Kept style definition
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
    borderLeftWidth: 1,
    borderLeftColor: colors.dark[60],
    marginLeft: 10,
  },
});
