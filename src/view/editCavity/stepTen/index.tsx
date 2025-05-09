import React, { FC, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { DividerColorLine } from "../../../components/dividerColorLine";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  setArchPalPossui,
  toggleArchPalTipo,
  setArchPalOutro,
  toggleArchPalOutroEnabled,
} from "../../../redux/cavitySlice";

import { Arqueologia, Paleontologia } from "../../../types";
import TextInter from "../../../components/textInter";
import RadioButtonGroup from "../../../components/radio";

type ArchPalSection = "arqueologia" | "paleontologia";
type ArqKeys = keyof Omit<
  NonNullable<Arqueologia["tipos"]>,
  "outro" | "outroEnabled"
>;
type PalKeys = keyof Omit<
  NonNullable<Paleontologia["tipos"]>,
  "outro" | "outroEnabled"
>;

export const StepTen: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const arqueologia = cavidade.arqueologia ?? { possui: false };
  const paleontologia = cavidade.paleontologia ?? { possui: false };
  const arqTipos = arqueologia.tipos ?? {};
  const palTipos = paleontologia.tipos ?? {};

  const handlePossuiToggle = useCallback(
    (section: ArchPalSection, selectedValue: "sim" | "não") => {
      const newPossui: boolean = selectedValue === "sim";
      dispatch(setArchPalPossui({ section, possui: newPossui }));
    },
    [dispatch]
  );

  const handleTipoToggle = useCallback(
    (section: ArchPalSection, fieldName: string) => {
      dispatch(toggleArchPalTipo({ section, fieldName }));
    },
    [dispatch]
  );

  const handleToggleOutroEnabled = useCallback(
    (section: ArchPalSection) => {
      dispatch(toggleArchPalOutroEnabled({ section }));
    },
    [dispatch]
  );

  const handleOutroTextChange = useCallback(
    (section: ArchPalSection, text: string) => {
      dispatch(setArchPalOutro({ section, text: text || undefined }));
    },
    [dispatch]
  );

  const renderArchPalSection = (
    sectionKey: ArchPalSection,
    title: string,
    data: Arqueologia | Paleontologia,
    tiposEspecificos: { key: string; label: string }[]
  ) => {
    const possui = data?.possui ?? false;
    const tipos = data?.tipos ?? {};
    const outroEnabled = tipos.outroEnabled ?? false;
    const outroText = tipos.outro ?? "";

    const conditionalContent = possui ? (
      <View style={styles.sectionContent}>
        {tiposEspecificos.map((tipo, index) => (
          <React.Fragment key={index}>
            <Checkbox
              key={tipo.key}
              label={tipo.label}
              checked={!!(tipos as any)[tipo.key]}
              onChange={() => handleTipoToggle(sectionKey, tipo.key)}
            />
            <Divider height={12} />
          </React.Fragment>
        ))}
        <Checkbox
          label="Outro"
          checked={outroEnabled}
          onChange={() => handleToggleOutroEnabled(sectionKey)}
        />
        <Divider height={12} />
        {outroEnabled && (
          <Input
            label="Qual outro?"
            placeholder="Especifique"
            value={outroText}
            onChangeText={(text) => handleOutroTextChange(sectionKey, text)}
          />
        )}
      </View>
    ) : null;

    const radioOptions = [
      {
          label: "Presença",
          value: "sim",
          id: `${sectionKey}-sim`,
          children: conditionalContent
      },
      {
          label: "Ausência",
          value: "não",
          id: `${sectionKey}-nao`,
          children: null
      }
  ];


    return (
      <View>
        <Divider />
        <RadioButtonGroup
          options={radioOptions}
          value={possui ? "sim" : "não"}
          onValueChange={(newValue: string) =>
            handlePossuiToggle(sectionKey, newValue as "sim" | "não")
          }
        />
        <DividerColorLine />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Arqueologia em superfície
      </TextInter>
      {renderArchPalSection("arqueologia", "Presença", arqueologia, [
        // Mapeie suas chaves e labels aqui
        { key: "material_litico", label: "Material Lítico" },
        { key: "material_ceramico", label: "Material Cerâmico" },
        { key: "pintura_rupestre", label: "Pintura Rupestre" },
        { key: "gravura", label: "Gravura" },
        { key: "ossada_humana", label: "Ossada Humana" },
        { key: "enterramento", label: "Enterramento" },
        { key: "nao_identificado", label: "Não Identificado (Arq.)" },
      ])}
      <Divider height={12} />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Paleontologia
      </TextInter>
      {renderArchPalSection("paleontologia", "Presença", paleontologia, [
        { key: "ossada", label: "Ossada" },
        { key: "iconofossil", label: "Icnofóssil" },
        { key: "jazigo", label: "Jazigo Fossilífero" },
        { key: "nao_identificado", label: "Não Identificado (Pal.)" },
      ])}

      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  secondLayer: {
    paddingLeft: 20,
    marginTop: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.dark[80],
    marginLeft: 10,
    paddingBottom: 5,
  },
  subSectionTitle: {
    marginTop: 10,
    marginBottom: 5,
  },
  sectionContent: { paddingLeft: 20, marginTop: 10, marginBottom: 10 },
});
