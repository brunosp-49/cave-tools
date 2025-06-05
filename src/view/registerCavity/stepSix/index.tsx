import React, { FC, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { Hidrologia, RouterProps } from "../../../types"; 
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateCavidadeData } from "../../../redux/cavitySlice";

interface StepSixProps extends RouterProps {
  validationAttempted: boolean;
}

type HidrologiaFeatureKey = Exclude<keyof Hidrologia, "outro">;
type HidrologiaTipoValue = NonNullable<
  NonNullable<Hidrologia["curso_agua"]>["tipo"]
>;

const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
};

export const StepSix: FC<StepSixProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const hidrologia = cavidade.hidrologia ?? {};
  const stepSixErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Selecione um tipo.";
    const errorMsgOutroRequired = "Este campo é obrigatório.";

    const checkFeatureError = (featureName: HidrologiaFeatureKey) => {
      const feature = hidrologia[featureName];
      if (feature?.possui && !isFieldFilled(feature.tipo)) {
        errors[featureName] = errorMsgRequired;
      }
    };

    checkFeatureError("curso_agua");
    checkFeatureError("lago");
    checkFeatureError("sumidouro");
    checkFeatureError("surgencia");
    checkFeatureError("gotejamento");
    checkFeatureError("condensacao");
    checkFeatureError("empossamento");
    checkFeatureError("exudacao");

    if (hidrologia.outro !== undefined && !isFieldFilled(hidrologia.outro)) {
        errors.hidrologia_outro = errorMsgOutroRequired;
    }
    return errors;
  }, [validationAttempted, hidrologia]);

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleMainFeatureToggle = useCallback(
    (featureName: HidrologiaFeatureKey) => {
      const featurePath = ["hidrologia", featureName];
      const currentFeatureState = hidrologia[featureName];
      const currentlyPossui = currentFeatureState?.possui || false;

      if (currentlyPossui) {
        // Ao desmarcar "Possui", limpa o objeto inteiro da feature
        handleUpdate(featurePath, undefined); 
      } else {
        // Ao marcar "Possui", inicializa com 'tipo' undefined para forçar seleção
        handleUpdate(featurePath, { possui: true, tipo: undefined });
      }
    },
    [handleUpdate, hidrologia]
  );

  const handleTypeChange = useCallback(
    (featureName: HidrologiaFeatureKey, typeValue: HidrologiaTipoValue) => {
      const typePath = ["hidrologia", featureName, "tipo"];
      const currentType = hidrologia[featureName]?.tipo;
      handleUpdate(typePath, currentType === typeValue ? undefined : typeValue);
    },
    [handleUpdate, hidrologia]
  );

  const handleOutroTextChange = useCallback(
    (text: string) => {
      handleUpdate(["hidrologia", "outro"], text);
    },
    [handleUpdate]
  );

  const handleFinalOutroToggle = useCallback(() => {
    const outroPath = ["hidrologia", "outro"];
    const isCurrentlyActive = hidrologia.outro !== undefined; 
    handleUpdate(outroPath, isCurrentlyActive ? undefined : "");
  }, [handleUpdate, hidrologia.outro]);

  const renderFeatureSection = (
    featureKey: HidrologiaFeatureKey,
    label: string
  ) => {
    const featureState = hidrologia[featureKey];
    const possui = featureState?.possui || false;
    const currentType = featureState?.tipo;
    const hasErrorForFeature = !!stepSixErrors[featureKey];

    return (
      <View key={featureKey}>
        <Checkbox
          label={label}
          checked={possui}
          onChange={() => handleMainFeatureToggle(featureKey)}
        />
        {possui && (
          <View style={styles.secondLayer}>
            <TextInter color={colors.white[100]} weight="medium">
              Selecione o tipo de {label.toLowerCase()}
            </TextInter>
            {hasErrorForFeature && (
                <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
                    {stepSixErrors[featureKey]}
                </TextInter>
            )}
            <Divider height={12} />
            <Checkbox
              label="Perene"
              checked={currentType === "perene"}
              onChange={() => handleTypeChange(featureKey, "perene")}
            />
            <Divider height={12} />
            <Checkbox
              label="Intermitente"
              checked={currentType === "intermitente"}
              onChange={() => handleTypeChange(featureKey, "intermitente")}
            />
            <Divider height={12} />
            <Checkbox
              label="Não soube informar"
              checked={currentType === "nao_soube_informar"}
              onChange={() => handleTypeChange(featureKey, "nao_soube_informar")}
            />
          </View>
        )}
        <Divider height={12} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Hidrologia *
      </TextInter>
      <Divider />
      {renderFeatureSection("curso_agua", "Curso d’água")}
      {renderFeatureSection("lago", "Lago ou Lagoa")}
      {renderFeatureSection("sumidouro", "Sumidouro")}
      {renderFeatureSection("surgencia", "Surgência")}
      {renderFeatureSection("gotejamento", "Gotejamento")}
      {renderFeatureSection("condensacao", "Condensação")}
      {renderFeatureSection("empossamento", "Empoçamento")}
      {renderFeatureSection("exudacao", "Exudação")}
      
      <Checkbox
        label="Outro (Fenômeno Hidrológico)"
        checked={hidrologia.outro !== undefined}
        onChange={handleFinalOutroToggle}
      />
      <Divider height={12} />
      {hidrologia.outro !== undefined && (
        <Input
          placeholder="Especifique aqui"
          label="Qual outro fenômeno hidrológico?"
          value={hidrologia.outro || ""}
          onChangeText={handleOutroTextChange}
          hasError={!!stepSixErrors.hidrologia_outro}
          errorMessage={stepSixErrors.hidrologia_outro}
          required
        />
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
  secondLayer: {
    paddingLeft: 20,
    marginTop: 10,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 2,
    // marginBottom: 6, 
  },
  inputSpacing: { 
    marginBottom: 12,
  },
});
