// src/view/registerCavity/components/StepThree.tsx

import React, { FC, useCallback, useState, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Area_protegida,
  Infraestrutura_acesso,
  Uso_cavidade,
  SelectOption, // Import your defined SelectOption type
} from "../../../types"; // Adjust path
import { colors } from "../../../assets/colors"; // Adjust path
import { Divider } from "../../../components/divider"; // Adjust path
import TextInter from "../../../components/textInter"; // Adjust path
import { Checkbox } from "../../../components/checkbox"; // Adjust path
import { Input } from "../../../components/input"; // Adjust path
import RadioButtonGroup from "../../../components/radio"; // Adjust path
import { Select } from "../../../components/select"; // Adjust path
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store"; // Adjust path
import {
  setUsoCavidadeOutroText,
  toggleUsoCavidadeOutroEnabled,
  updateCavidadeData,
} from "../../../redux/cavitySlice"; // Adjust path

// Type aliases for clarity
type UsoCavidadeKeys = keyof Uso_cavidade;
type InfraAcessoKeys = keyof Infraestrutura_acesso;
type AreaProtegidaKeys = keyof Omit<Area_protegida, "nao_determinado">;
type AreaProtegidaSubKeys = keyof NonNullable<Area_protegida["federal"]>;

// Define options list matching the updated SelectOption interface
// Assuming the 'value' field can just mirror the label for this case
const jurisdictionOptions: SelectOption<string>[] = [
  {
    id: "nenhuma",
    value: "Nenhuma / Não se aplica",
    label: "Nenhuma / Não se aplica",
  },
  { id: "federal", value: "Federal", label: "Federal" },
  { id: "estadual", value: "Estadual", label: "Estadual" },
  { id: "municipal", value: "Municipal", label: "Municipal" },
];

export const StepThree: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const aspectos = useMemo(
    () =>
      cavidade.aspectos_socioambientais ??
      ({} as {
        uso_cavidade?: Uso_cavidade;
        comunidade_envolvida?: { envolvida: boolean; descricao?: string };
        area_protegida?: Area_protegida;
        infraestrutura_acesso?: Infraestrutura_acesso;
      }),
    [cavidade.aspectos_socioambientais]
  );
  const usoCavidade: Partial<Uso_cavidade> = useMemo(
    () => aspectos.uso_cavidade ?? {},
    [aspectos.uso_cavidade]
  );
  const comunidadeEnvolvida = useMemo(
    () => aspectos.comunidade_envolvida ?? { envolvida: false },
    [aspectos.comunidade_envolvida]
  );
  const areaProtegida: Partial<Area_protegida> = useMemo(
    () => aspectos.area_protegida ?? {},
    [aspectos.area_protegida]
  );
  const infraAcesso: Partial<Infraestrutura_acesso> = useMemo(
    () => aspectos.infraestrutura_acesso ?? {},
    [aspectos.infraestrutura_acesso]
  );

  const getInitialJurisdictionId = (): string => {
    if (areaProtegida.federal) return "federal";
    if (areaProtegida.estadual) return "estadual";
    if (areaProtegida.municipal) return "municipal";
    return "nenhuma";
  };
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>(
    getInitialJurisdictionId()
  );

  const selectedJurisdictionDisplayLabel = useMemo(() => {
    return (
      jurisdictionOptions.find((opt) => opt.id === selectedJurisdictionId)
        ?.label || ""
    ); // Get the LABEL field
  }, [selectedJurisdictionId]);

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleUsoCavidadeToggle = useCallback(
    (fieldName: Exclude<UsoCavidadeKeys, "outro" | "outroEnabled">) => {
      const path = ["aspectos_socioambientais", "uso_cavidade", fieldName];
      const currentValue = usoCavidade[fieldName] || false;
      handleUpdate(path, !currentValue);
    },
    [handleUpdate, usoCavidade]
  );

  const handleToggleUsoOutro = useCallback(() => {
    dispatch(toggleUsoCavidadeOutroEnabled());
  }, [dispatch]);

  const handleSetUsoOutroText = useCallback(
    (text: string) => {
      dispatch(setUsoCavidadeOutroText(text || undefined));
    },
    [dispatch]
  );

  const handleInfraAcessoChange = useCallback(
    (fieldName: InfraAcessoKeys) => {
      const currentState = infraAcesso || {};
      const currentValue = currentState[fieldName] || false;
      const isTurningOn = !currentValue;

      const basePath = ["aspectos_socioambientais", "infraestrutura_acesso"];
      const path = [...basePath, fieldName];
      handleUpdate(path, isTurningOn);

      const nenhumaKey: InfraAcessoKeys = "nenhuma";
      const specificInfraKeys: InfraAcessoKeys[] = [
        "receptivo",
        "condutor_para_visitantes",
        "lanchonete_ou_restaurante",
        "pousada_ou_hotel",
        // Adicione outras se existirem
      ];

      if (fieldName === nenhumaKey && isTurningOn) {
        specificInfraKeys.forEach((key) => {
          const keyPath = [...basePath, key];
          if (currentState[key] !== false) {
            handleUpdate(keyPath, false);
          }
        });
      } else if (specificInfraKeys.includes(fieldName) && isTurningOn) {
        const nenhumaPath = [...basePath, nenhumaKey];
        if (currentState[nenhumaKey] !== false) {
          handleUpdate(nenhumaPath, false);
        }
      }
    },
    [infraAcesso, handleUpdate]
  );

  const handleComunidadeEnvolvidaChange = useCallback(
    (value: string) => {
      const isEnvolvida = value === "sim";
      handleUpdate(
        ["aspectos_socioambientais", "comunidade_envolvida", "envolvida"],
        isEnvolvida
      );
      if (!isEnvolvida) {
        handleUpdate(
          ["aspectos_socioambientais", "comunidade_envolvida", "descricao"],
          ""
        );
      } else {
        if (!comunidadeEnvolvida?.hasOwnProperty("descricao")) {
          handleUpdate(
            ["aspectos_socioambientais", "comunidade_envolvida", "descricao"],
            ""
          );
        }
      }
    },
    [dispatch, handleUpdate, comunidadeEnvolvida]
  );

  // --- CORRECTED Handler for Jurisdiction Select ---
  // Now expects the full SelectOption<string> object from onChangeText
  const handleJurisdictionChange = useCallback(
    (selectedOption: SelectOption<string>) => {
      const selectedId = String(selectedOption.id); // Ensure ID is string

      // Update the local state holding the selected ID (triggers re-render)
      setSelectedJurisdictionId(selectedId);

      // Determine the actual jurisdiction key or null based on the ID
      const newJurisdictionKey =
        selectedId === "nenhuma" ||
        !["federal", "estadual", "municipal"].includes(selectedId)
          ? null
          : (selectedId as AreaProtegidaKeys);

      // --- Update Redux State ---
      const basePath = ["aspectos_socioambientais", "area_protegida"];
      const updates: { path: (string | number)[]; value: any }[] = [];

      // 1. Clear all specific jurisdiction objects first in Redux
      updates.push({ path: [...basePath, "federal"], value: undefined });
      updates.push({ path: [...basePath, "estadual"], value: undefined });
      updates.push({ path: [...basePath, "municipal"], value: undefined });

      // 2. Set 'nao_determinado' flag in Redux
      updates.push({
        path: [...basePath, "nao_determinado"],
        value: newJurisdictionKey === null,
      });

      // 3. If a valid jurisdiction was selected, ensure its object exists in Redux
      if (newJurisdictionKey) {
        // Initialize with empty object only if it doesn't exist or was just cleared
        // This prevents overwriting existing data if user clicks same option again
        if (!areaProtegida[newJurisdictionKey]) {
          updates.push({ path: [...basePath, newJurisdictionKey], value: {} });
        }
      }

      // Dispatch all Redux updates
      updates.forEach((update) => dispatch(updateCavidadeData(update)));
    },
    [dispatch, areaProtegida]
  ); // Dependency on areaProtegida to check before initializing

  // Handler for sub-fields within the selected jurisdiction (Nome, Zona)
  const handleAreaProtegidaSubFieldChange = useCallback(
    (fieldName: AreaProtegidaSubKeys, value: any) => {
      // Use the local selectedJurisdictionId to determine the path
      if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
        const path = [
          "aspectos_socioambientais",
          "area_protegida",
          selectedJurisdictionId,
          fieldName,
        ];
        handleUpdate(path, value);
      }
    },
    [selectedJurisdictionId, handleUpdate]
  );

  // Handler specifically for the Zona checkboxes (acting like radio buttons)
  const handleZoneChange = useCallback(
    (zoneValue: "interior" | "zona_de_amortecimento") => {
      if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
        // Read current zone value directly from Redux state for comparison
        const currentJurisdictionData =
          areaProtegida[selectedJurisdictionId as AreaProtegidaKeys];
        const currentZone = currentJurisdictionData?.zona;
        const path = [
          "aspectos_socioambientais",
          "area_protegida",
          selectedJurisdictionId,
          "zona",
        ];
        // Toggle logic: If clicking the same value, set to undefined; otherwise, set to new value.
        handleUpdate(path, currentZone === zoneValue ? undefined : zoneValue);
      }
    },
    [selectedJurisdictionId, areaProtegida, handleUpdate]
  );

  // Get the currently selected jurisdiction's data from Redux for rendering sub-fields
  const currentSelectedJurisdictionData = useMemo(() => {
    if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
      return areaProtegida[selectedJurisdictionId as AreaProtegidaKeys];
    }
    return null;
  }, [selectedJurisdictionId, areaProtegida]);

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
      <Checkbox
        label="Religioso"
        checked={!!usoCavidade.religioso}
        onChange={() => handleUsoCavidadeToggle("religioso")}
      />
      <Divider height={12} />
      <Checkbox
        label="Científico/Cultural"
        checked={!!usoCavidade.cientifico_cultural}
        onChange={() => handleUsoCavidadeToggle("cientifico_cultural")}
      />
      <Divider height={12} />
      <Checkbox
        label="Social"
        checked={!!usoCavidade.social}
        onChange={() => handleUsoCavidadeToggle("social")}
      />
      <Divider height={12} />
      <Checkbox
        label="Minerário"
        checked={!!usoCavidade.minerario}
        onChange={() => handleUsoCavidadeToggle("minerario")}
      />
      <Divider height={12} />
      <Checkbox
        label="Pedagógico"
        checked={!!usoCavidade.pedagogico}
        onChange={() => handleUsoCavidadeToggle("pedagogico")}
      />
      <Divider height={12} />
      <Checkbox
        label="Esportivo"
        checked={!!usoCavidade.esportivo}
        onChange={() => handleUsoCavidadeToggle("esportivo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Turístico"
        checked={!!usoCavidade.turistico}
        onChange={() => handleUsoCavidadeToggle("turistico")}
      />
      {/* Render sub-options only if Turístico is checked */}
      {usoCavidade.turistico && (
        <View style={styles.subCheckboxContainer}>
          <Checkbox
            label="Incipiente"
            checked={!!usoCavidade.incipiente}
            onChange={() => handleUsoCavidadeToggle("incipiente")}
          />
          <Divider height={12} />
          <Checkbox
            label="Massa"
            checked={!!usoCavidade.massa}
            onChange={() => handleUsoCavidadeToggle("massa")}
          />
          <Divider height={12} />
          <Checkbox
            label="Aventura"
            checked={!!usoCavidade.aventura}
            onChange={() => handleUsoCavidadeToggle("aventura")}
          />
        </View>
      )}
      <Divider height={12} />
      <Checkbox
        label="Mergulho"
        checked={!!usoCavidade.mergulho}
        onChange={() => handleUsoCavidadeToggle("mergulho")}
      />
      <Divider height={12} />
      <Checkbox
        label="Rapel"
        checked={!!usoCavidade.rapel}
        onChange={() => handleUsoCavidadeToggle("rapel")}
      />
      <Divider height={12} />
      <Checkbox
        label="Outro"
        checked={usoCavidade.outroEnabled ?? false}
        onChange={handleToggleUsoOutro}
      />
      <Divider height={12} />
      {/* Input for 'outro' */}
      {usoCavidade.outroEnabled && ( // Conditionally render based on text presence is safer
        <Input
          placeholder="Especifique aqui"
          label="Qual outro uso?"
          value={usoCavidade.outro || ""}
          onChangeText={handleSetUsoOutroText}
        />
      )}
      <Divider />

      {/* --- Comunidade envolvida --- */}
      <TextInter color={colors.white[100]} weight="medium">
        Comunidade envolvida
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        options={[
          { label: "Sim", value: "sim", id: "1" },
          { label: "Não", value: "não", id: "2" },
        ]}
        onValueChange={handleComunidadeEnvolvidaChange}
        value={comunidadeEnvolvida.envolvida ? "sim" : "não"} // Reflect state
      />
      {comunidadeEnvolvida.envolvida && (
        <>
          <Divider height={12} />
          <Input
            label="De que forma?"
            placeholder="Especifique aqui"
            value={comunidadeEnvolvida.descricao || ""}
            onChangeText={(text) =>
              handleUpdate(
                [
                  "aspectos_socioambientais",
                  "comunidade_envolvida",
                  "descricao",
                ],
                text
              )
            }
          />
        </>
      )}
      <Divider />

      {/* --- Áreas Protegida --- */}
      <Select
        // Pass the calculated DISPLAY LABEL to the value prop
        value={selectedJurisdictionDisplayLabel}
        // Handler expects the {id, value, label} object
        onChangeText={(chosen) => {
          const selectedOption: SelectOption<string> = {
            ...chosen,
            label:
              jurisdictionOptions.find((opt) => opt.id === chosen.id)?.label ||
              chosen.value,
          };
          handleJurisdictionChange(selectedOption);
        }}
        label="Áreas Protegida - Jurisdição"
        optionsList={jurisdictionOptions} // Use options matching SelectOption<T>
        placeholder="Selecione uma opção"
      />

      {/* Conditionally render Nome/Zona based on local selectedJurisdictionId */}
      {selectedJurisdictionId && selectedJurisdictionId !== "nenhuma" && (
        <>
          <Divider height={12} />
          <Input
            label="Nome da Área Protegida"
            placeholder="Digite o nome"
            // Read value from Redux state based on the selected ID
            value={currentSelectedJurisdictionData?.nome || ""}
            // Update Redux state using the correct path via handler
            onChangeText={(text) =>
              handleAreaProtegidaSubFieldChange("nome", text)
            }
            required // Mark as required if applicable
          />
          <Divider height={12} />
          <TextInter color={colors.white[100]} weight="medium">
            Zona
          </TextInter>
          <Divider height={6} />
          {/* Checkboxes acting like Radio for 'zona' field */}
          <Checkbox
            label="Interior"
            // Read value from Redux state
            checked={currentSelectedJurisdictionData?.zona === "interior"}
            // Call specific handler
            onChange={() => handleZoneChange("interior")}
          />
          <Divider height={12} />
          <Checkbox
            label="Zona de Amortecimento"
            // Read value from Redux state
            checked={
              currentSelectedJurisdictionData?.zona === "zona_de_amortecimento"
            }
            // Call specific handler
            onChange={() => handleZoneChange("zona_de_amortecimento")}
          />
        </>
      )}
      {/* Show text if Redux state indicates nao_determinado is true */}
      {areaProtegida.nao_determinado && (
        <TextInter
          style={{
            marginTop: 10,
            color: colors.white[80],
            fontStyle: "italic",
          }}
        >
          Não foi possível determinar a Área Protegida.
        </TextInter>
      )}
      <Divider />

      {/* --- Infraestrutura de acesso --- */}
      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura de acesso
      </TextInter>
      <Divider height={12} />
      {/* TODO: Implement mutual exclusivity for 'Nenhuma' here if needed */}
      <Checkbox
        label="Receptivo"
        checked={!!infraAcesso.receptivo}
        onChange={() => handleInfraAcessoChange("receptivo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Condutor para visitantes"
        checked={!!infraAcesso.condutor_para_visitantes}
        onChange={() => handleInfraAcessoChange("condutor_para_visitantes")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lanchonete e/ou restaurante"
        checked={!!infraAcesso.lanchonete_ou_restaurante}
        onChange={() => handleInfraAcessoChange("lanchonete_ou_restaurante")}
      />
      <Divider height={12} />
      <Checkbox
        label="Pousada e/ou hotel"
        checked={!!infraAcesso.pousada_ou_hotel}
        onChange={() => handleInfraAcessoChange("pousada_ou_hotel")}
      />
      <Divider height={12} />
      <Checkbox
        label="Nenhuma"
        checked={!!infraAcesso.nenhuma}
        onChange={() => handleInfraAcessoChange("nenhuma")}
      />
      <StatusBar style="light" />
      {/* Add padding at the bottom if needed */}
      <View style={{ height: 20 }} />
    </View>
  );
};

// --- Styles --- (Keep your existing styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: "100%", // Usually not needed with flex: 1 in ScrollView parent
    width: "100%",
    paddingBottom: 30, // Existing style
  },
  // Add sub-checkbox container style if needed for indentation
  subCheckboxContainer: {
    marginLeft: 20, // Example indentation
    marginTop: 8,
  },
});

// Export the component
export default StepThree;
