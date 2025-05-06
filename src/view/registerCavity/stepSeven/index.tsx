import React, { FC, useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { Select } from "../../../components/select";
import { DividerColorLine } from "../../../components/dividerColorLine";

// Import Redux hooks, state/dispatch types, and the action
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store"; // Adjust path
import {
  setSedimentoPossui,
  updateCavidadeData,
} from "../../../redux/cavitySlice"; // Adjust path

// Import specific types used in this step
import { Sedimentos } from "../../../types"; // Adjust path

// --- Define Types for Handler Keys (Type Safety) ---
type ClasticTypeKey = Exclude<
  keyof NonNullable<NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]>,
  "rochoso"
>;
type ClasticOrigemValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]
    >["argila"]
  >["origem"]
>;
type ClasticDistribuicaoValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]
    >["argila"]
  >["distribuicao"]
>;

type OrganicTypeKey = keyof NonNullable<
  NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]
>;
type GuanoTypeKey = keyof NonNullable<
  NonNullable<NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]>["guano"]
>;
type GuanoTipoValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]
      >["guano"]
    >["carnivoro"]
  >["tipo"]
>;

// --- Component Definition ---
export const StepSeven: FC = () => {
  // --- Redux Setup ---
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  // Safely access nested state with defaults
  const sedimentos = cavidade.sedimentos ?? {};
  const clastica = sedimentos.sedimentacao_clastica ?? {};
  const clasticaTipo = clastica.tipo ?? {};
  const organica = sedimentos.sedimentacao_organica ?? {};
  const organicaTipo = organica.tipo ?? {};
  const guano = organicaTipo.guano ?? {};

  // --- Generic Update Handler (Memoized) ---
  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      console.log("Dispatching Update:", { path, value }); // Log dispatched updates
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handlePossuiToggle = useCallback(
    (section: "sedimentacao_clastica" | "sedimentacao_organica") => {
      const currentPossui = sedimentos[section]?.possui ?? false;
      // Dispatch the specific action to handle possui and nested state clearing
      dispatch(
        setSedimentoPossui({ section: section, possui: !currentPossui })
      );
    },
    [dispatch, sedimentos]
  );

  // --- Specific Handlers (Memoized) ---

  const handleRochosoToggle = useCallback(() => {
    const path = ["sedimentos", "sedimentacao_clastica", "tipo", "rochoso"];
    // Only allow toggle if main clastic section 'possui' is true
    if (clastica.possui) {
      handleUpdate(path, !clasticaTipo.rochoso);
    }
  }, [handleUpdate, clastica.possui, clasticaTipo.rochoso]);

  const handleClasticTypeToggle = useCallback(
    (typeName: ClasticTypeKey) => {
      // Only allow toggle if main clastic section 'possui' is true
      if (clastica.possui) {
        const path = ["sedimentos", "sedimentacao_clastica", "tipo", typeName];
        const exists = !!clasticaTipo[typeName];
        handleUpdate(path, exists ? undefined : {}); // Toggle object presence
      }
    },
    [handleUpdate, clastica.possui, clasticaTipo]
  );

  const handleClasticDetailChange = useCallback(
    (
      typeName: ClasticTypeKey,
      detailField: "distribuicao" | "origem",
      value: ClasticDistribuicaoValue | ClasticOrigemValue | undefined
    ) => {
      // Only allow changes if main clastic section 'possui' is true and type exists
      if (clastica.possui && clasticaTipo[typeName]) {
        const path = [
          "sedimentos",
          "sedimentacao_clastica",
          "tipo",
          typeName,
          detailField,
        ];
        handleUpdate(path, value);
      }
    },
    [handleUpdate, clastica.possui, clasticaTipo]
  );

  const handleOrganicaPossuiToggle = useCallback(() => {
    const path = ["sedimentos", "sedimentacao_organica", "possui"];
    const newValue = !organica.possui;
    handleUpdate(path, newValue);
    if (!newValue) {
      // Clear nested object if unchecking
      handleUpdate(["sedimentos", "sedimentacao_organica", "tipo"], undefined);
    }
  }, [handleUpdate, organica.possui]);

  const handleOrganicTypeToggle = useCallback(
    (typeName: OrganicTypeKey) => {
      // Only allow if organica.possui is true
      if (organica.possui) {
        const path = ["sedimentos", "sedimentacao_organica", "tipo", typeName];
        const currentValue = organicaTipo[typeName];
        if (typeName === "guano") {
          handleUpdate(path, currentValue ? undefined : {});
        } else {
          handleUpdate(path, !currentValue);
        }
      }
    },
    [handleUpdate, organica.possui, organicaTipo]
  );

  const handleGuanoTypeToggle = useCallback(
    (guanoTypeName: GuanoTypeKey) => {
      // Only allow if organica.possui and guano object exist
      if (organica.possui && organicaTipo.guano) {
        const basePath = [
          "sedimentos",
          "sedimentacao_organica",
          "tipo",
          "guano",
          guanoTypeName,
        ];
        const currentSubObject = guano[guanoTypeName];
        const currentPossui = currentSubObject?.possui || false;
        const newValue = !currentPossui;
        if (newValue) {
          handleUpdate(basePath, { ...(currentSubObject ?? {}), possui: true });
        } else {
          handleUpdate(basePath, {
            ...(currentSubObject ?? {}),
            possui: false,
            tipo: undefined,
          });
        }
      }
    },
    [handleUpdate, organica.possui, organicaTipo.guano, guano]
  );

  const handleGuanoDetailChange = useCallback(
    (guanoTypeName: GuanoTypeKey, value: GuanoTipoValue | undefined) => {
      if (organica.possui && guano[guanoTypeName]?.possui) {
        const path = [
          "sedimentos",
          "sedimentacao_organica",
          "tipo",
          "guano",
          guanoTypeName,
          "tipo",
        ];
        handleUpdate(path, value);
      } else {
        console.warn(
          "Tentativa de atualizar detalhe Guano quando as condições não foram atendidas:",
          {
            organicaPossui: organica.possui,
            guanoTypePossui: guano[guanoTypeName]?.possui,
            guanoTypeName,
            value,
          }
        );
      }
    },
    [handleUpdate, organica.possui, guano]
  );

  // --- Helper Function to Render Clastic Section ---
  const renderClasticSection = (typeName: ClasticTypeKey, label: string) => {
    const typeState = clasticaTipo[typeName];
    const exists = !!typeState;

    // ***** VITAL: Replace placeholders with actual valid options from your types! *****
    const distribuicaoOptions = [
      { id: "", value: "Selecione..." }, // Optional placeholder
      { id: "generalizado", value: "Generalizado" },
      { id: "localizado", value: "Localizado" },
    ];
    const currentDistribuicaoValue =
      typeState && typeState?.distribuicao ? typeState.distribuicao : "";

    return (
      <View key={typeName} style={styles.secondLayer}>
        {label === "Argila" && (
          <TextInter color={colors.white[100]} weight="bold">
            Selecione o tipo de solo incipiente
          </TextInter>
        )}
        <Divider height={12} />
        <Checkbox
          label={label}
          checked={exists}
          onChange={() => handleClasticTypeToggle(typeName)}
        />
        {/* Conditional Rendering of Details */}
        {exists && (
          <View style={styles.thirdLayer}>
            <Select
              label="Tipo"
              required
              onChangeText={(obj) => {
                // Log received object from Select component
                console.log(
                  `Select onChangeText for ${typeName} received:`,
                  obj
                );
                if (obj && obj.id !== "") {
                  handleClasticDetailChange(
                    typeName,
                    "distribuicao",
                    obj.id as ClasticDistribuicaoValue
                  );
                } else {
                  handleClasticDetailChange(
                    typeName,
                    "distribuicao",
                    undefined
                  );
                }
              }}
              // Pass the primitive string ID or empty string
              value={currentDistribuicaoValue}
              placeholder="Selecione a distribuição"
              optionsList={distribuicaoOptions} // Use correct options
            />
            <TextInter color={colors.white[100]} weight="medium">
              Origem
            </TextInter>
            <Divider height={12} />
            {/* Checkboxes acting as Radio for 'origem' */}
            <Checkbox
              label="Autóctone"
              checked={typeState?.origem === "autoctone"}
              onChange={() =>
                handleClasticDetailChange(typeName, "origem", "autoctone")
              }
            />
            <Divider height={12} />
            <Checkbox
              label="Alóctone"
              checked={typeState?.origem === "aloctone"}
              onChange={() =>
                handleClasticDetailChange(typeName, "origem", "aloctone")
              }
            />
            <Divider height={12} />
            <Checkbox
              label="Mista"
              checked={typeState?.origem === "mista"}
              onChange={() =>
                handleClasticDetailChange(typeName, "origem", "mista")
              }
            />
            <Divider height={12} />
          </View>
        )}
        <DividerColorLine />
      </View>
    );
  };

  const renderGuanoTypeSection = (
    guanoTypeName: GuanoTypeKey,
    label: string
  ) => {
    const guanoTypeState = guano[guanoTypeName];
    const possui = guanoTypeState?.possui || false;

    const guanoTipoOptions = [
      { id: "", value: "Selecione..." },
      { id: "seco_manchado", value: "Seco Manchado" },
      { id: "seco_esparso", value: "Seco Esparso" },
      { id: "umido_manchado", value: "Úmido Manchado" },
      { id: "umido_esparso", value: "Úmido Esparso" },
    ];

    const currentTipoId = guanoTypeState?.tipo ?? "";
    const selectedOptionObject = guanoTipoOptions.find(
      (opt) => opt.id === currentTipoId
    );

    return (
      <View key={guanoTypeName}>
        <Divider height={8} />
        <Checkbox
          label={label}
          checked={possui}
          onChange={() => handleGuanoTypeToggle(guanoTypeName)}
        />
        {possui && (
          <>
            <Divider height={12} />
            <Select
              label="Tipo"
              onChangeText={(obj) => {
                if (obj && obj.id !== "") {
                  handleGuanoDetailChange(
                    guanoTypeName,
                    obj.id as GuanoTipoValue
                  );
                } else {
                  handleGuanoDetailChange(guanoTypeName, undefined);
                }
              }}
              value={selectedOptionObject?.value ?? ""}
              placeholder="Selecione o tipo"
              optionsList={guanoTipoOptions}
            />
          </>
        )}
      </View>
    );
  };

  // --- JSX ---
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Sedimentos Clásticos
      </TextInter>
      <Divider />
      <Checkbox
        label="Possui Sedimentos Clásticos?"
        checked={clastica.possui || false}
        onChange={() => handlePossuiToggle("sedimentacao_clastica")}
      />
      {clastica.possui && (
        <View style={styles.mainSectionContainer}>
          <Divider height={12} />
          <Checkbox
            label="Rochoso (solo incipiente)"
            checked={clasticaTipo.rochoso || false}
            onChange={handleRochosoToggle} // Uses specific Rochoso handler
          />
          <DividerColorLine />
          {clasticaTipo.rochoso && (
            <>
              {renderClasticSection("argila", "Argila")}
              {renderClasticSection("silte", "Silte")}
              {renderClasticSection("areia", "Areia")}
              {renderClasticSection("fracao_granulo", "Fração grânulo")}
              {renderClasticSection("seixo_predominante", "Seixo predominante")}
              {renderClasticSection("fracao_calhau", "Fração calhau")}
              {renderClasticSection(
                "matacao_predominante",
                "Matacão predominante"
              )}
            </>
          )}
        </View>
      )}

      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Sedimentos Orgânicos
      </TextInter>
      <Divider />
      <Checkbox
        label="Possui Sedimentos Orgânicos"
        checked={organica.possui || false}
        onChange={handleOrganicaPossuiToggle}
      />
      {/* Conditional Rendering of Organic Section */}
      {organica.possui && (
        <View style={styles.secondLayer}>
          <Divider height={12} />
          <Checkbox
            label="Guano"
            checked={!!organicaTipo.guano}
            onChange={() => handleOrganicTypeToggle("guano")}
          />
          {/* Conditional Rendering of Guano Details */}
          {!!organicaTipo.guano && (
            <View style={styles.thirdLayer}>
              {renderGuanoTypeSection("carnivoro", "Carnívoro")}
              {renderGuanoTypeSection("frugivoro", "Frugívoro")}
              {renderGuanoTypeSection("hematofago", "Hematófago")}
              {renderGuanoTypeSection("inderterminado", "Indeterminado")}
            </View>
          )}
          <Divider height={12} />
          {/* Other Organic Types */}
          <Checkbox
            label="Folhiço"
            checked={organicaTipo.folhico || false}
            onChange={() => handleOrganicTypeToggle("folhico")}
          />
          <Divider height={12} />
          <Checkbox
            label="Galhos"
            checked={organicaTipo.galhos || false}
            onChange={() => handleOrganicTypeToggle("galhos")}
          />
          <Divider height={12} />
          <Checkbox
            label="Raízes"
            checked={organicaTipo.raizes || false}
            onChange={() => handleOrganicTypeToggle("raizes")}
          />
          <Divider height={12} />
          <Checkbox
            label="Vestígios de ninhos"
            checked={organicaTipo.vestigios_ninhos || false}
            onChange={() => handleOrganicTypeToggle("vestigios_ninhos")}
          />
          <Divider height={12} />
          <Checkbox
            label="Pelotas de regurgitação"
            checked={organicaTipo.pelotas_regurgitacao || false}
            onChange={() => handleOrganicTypeToggle("pelotas_regurgitacao")}
          />
          <Divider height={12} />
        </View>
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
  secondLayer: {
    paddingLeft: 30,
    marginTop: 10,
  },
  thirdLayer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
  },
  mainSectionContainer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
  },
});
