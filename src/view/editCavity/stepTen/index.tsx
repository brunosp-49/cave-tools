import React, { FC, useCallback, useMemo } from "react";
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

import { Arqueologia, Paleontologia, RouterProps } from "../../../types";
import TextInter from "../../../components/textInter";
import RadioButtonGroup from "../../../components/radio";

interface StepTenProps extends RouterProps {
  validationAttempted: boolean;
}

type ArchPalSection = "arqueologia" | "paleontologia";
type ArqKeys = keyof Omit<
  NonNullable<Arqueologia["tipos"]>,
  "outro" | "outroEnabled"
>;
type PalKeys = keyof Omit<
  NonNullable<Paleontologia["tipos"]>,
  "outro" | "outroEnabled"
>;

const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
};

export const StepTen: FC<StepTenProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  
  const arqueologia = cavidade.arqueologia ?? { possui: false, tipos: { outroEnabled: false, outro: "" } };
  const paleontologia = cavidade.paleontologia ?? { possui: false, tipos: { outroEnabled: false, outro: "" } };
  
  const arqTipos = arqueologia.tipos ?? { outroEnabled: false, outro: "" };
  const palTipos = paleontologia.tipos ?? { outroEnabled: false, outro: "" };

  const stepTenErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";
    const errorMsgSelectOrOther = "Selecione um tipo ou preencha 'Outro'.";

    if (arqueologia.possui) {
      let algumaOpcaoArqSelecionada = false;
      const tiposArqKeys = Object.keys(arqTipos).filter(k => k !== 'outroEnabled' && k !== 'outro') as ArqKeys[];
      if (tiposArqKeys.some(key => arqTipos[key] === true)) {
        algumaOpcaoArqSelecionada = true;
      }
      if (arqTipos.outroEnabled && isFieldFilled(arqTipos.outro)) {
        algumaOpcaoArqSelecionada = true;
      } else if (arqTipos.outroEnabled && !isFieldFilled(arqTipos.outro)) {
        errors.arqueologia_outro_texto = errorMsgRequired;
      }
      if (!algumaOpcaoArqSelecionada && !errors.arqueologia_outro_texto) {
        errors.arqueologia_geral = errorMsgSelectOrOther;
      }
    }

    if (paleontologia.possui) {
      let algumaOpcaoPalSelecionada = false;
      const tiposPalKeys = Object.keys(palTipos).filter(k => k !== 'outroEnabled' && k !== 'outro') as PalKeys[];
      if (tiposPalKeys.some(key => palTipos[key] === true)) {
        algumaOpcaoPalSelecionada = true;
      }
      if (palTipos.outroEnabled && isFieldFilled(palTipos.outro)) {
        algumaOpcaoPalSelecionada = true;
      } else if (palTipos.outroEnabled && !isFieldFilled(palTipos.outro)) {
        errors.paleontologia_outro_texto = errorMsgRequired;
      }
      if (!algumaOpcaoPalSelecionada && !errors.paleontologia_outro_texto) {
        errors.paleontologia_geral = errorMsgSelectOrOther;
      }
    }
    return errors;
  }, [validationAttempted, arqueologia, paleontologia, arqTipos, palTipos]);


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
    _titleUnused: string,
    data: Arqueologia | Paleontologia,
    tiposEspecificos: { key: string; label: string }[],
    generalErrorKey: "arqueologia_geral" | "paleontologia_geral",
    outroTextErrorKey: "arqueologia_outro_texto" | "paleontologia_outro_texto"
  ) => {
    const possui = data?.possui ?? false;
    const tipos = data?.tipos ?? { outroEnabled: false, outro: "" };
    const outroEnabled = tipos.outroEnabled ?? false;
    const outroText = tipos.outro ?? "";

    const conditionalContent = possui ? (
      <View style={styles.sectionContent}>
        {tiposEspecificos.map((tipo) => (
          <React.Fragment key={tipo.key}>
            <Checkbox
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
            hasError={!!stepTenErrors[outroTextErrorKey]}
            errorMessage={stepTenErrors[outroTextErrorKey]}
            required
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
        {!!stepTenErrors[generalErrorKey] && possui && (
             <TextInter style={styles.errorText}>{stepTenErrors[generalErrorKey]}</TextInter>
        )}
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
      {renderArchPalSection("arqueologia", "Arqueologia", arqueologia, [
        { key: "material_litico", label: "Material Lítico" },
        { key: "material_ceramico", label: "Material Cerâmico" },
        { key: "pintura_rupestre", label: "Pintura Rupestre" },
        { key: "gravura", label: "Gravura" },
        { key: "ossada_humana", label: "Ossada Humana" },
        { key: "enterramento", label: "Enterramento" },
        { key: "nao_identificado", label: "Não Identificado (Arq.)" },
      ], "arqueologia_geral", "arqueologia_outro_texto")}
      
      <Divider height={18} /> 
      
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Paleontologia
      </TextInter>
      {renderArchPalSection("paleontologia", "Paleontologia", paleontologia, [
        { key: "ossada", label: "Ossada" },
        { key: "iconofossil", label: "Icnofóssil" },
        { key: "jazigo", label: "Jazigo Fossilífero" },
        { key: "nao_identificado", label: "Não Identificado (Pal.)" },
      ], "paleontologia_geral", "paleontologia_outro_texto")}

      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingBottom: 30,
  },
  sectionContent: { 
    paddingLeft: 20,
    marginTop: 10, 
    marginBottom: 10 
  },
  inputSpacing: {
    marginBottom: 12,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 20,
  }
});
