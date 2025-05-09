import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { Hidrologia } from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateCavidadeData } from "../../../redux/cavitySlice";

type HidrologiaFeatureKey = Exclude<keyof Hidrologia, "outro">;
type HidrologiaTipoValue = NonNullable<
  NonNullable<Hidrologia["curso_agua"]>["tipo"]
>;

export const StepSix = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const hidrologia = cavidade.hidrologia ?? {};

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
        handleUpdate(featurePath, undefined);
      } else {
        handleUpdate(featurePath, { possui: true, tipo: undefined });
      }
    },
    [dispatch, hidrologia]
  );

  const handleTypeChange = useCallback(
    (featureName: HidrologiaFeatureKey, typeValue: HidrologiaTipoValue) => {
      const typePath = ["hidrologia", featureName, "tipo"];
      const currentType = hidrologia[featureName]?.tipo;
      handleUpdate(typePath, currentType === typeValue ? undefined : typeValue);
    },
    [dispatch, hidrologia]
  );

  const handleOutroTextChange = useCallback(
    (text: string) => {
      handleUpdate(["hidrologia", "outro"], text);
    },
    [dispatch]
  );

  const handleOutroCheckboxToggle = useCallback(() => {
    if (hidrologia.outro) {
      handleUpdate(["hidrologia", "outro"], "");
    }
  }, [dispatch, hidrologia.outro]);

  const renderFeatureSection = (
    featureKey: HidrologiaFeatureKey,
    label: string
  ) => {
    const featureState = hidrologia[featureKey];
    const possui = featureState?.possui || false;
    const currentType = featureState?.tipo;

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
              onChange={() =>
                handleTypeChange(featureKey, "nao_soube_informar")
              }
            />
          </View>
        )}
        <Divider height={12} />
      </View>
    );
  };

  const handleFinalOutroToggle = useCallback(() => {
    const outroPath = ["hidrologia", "outro"];
    const isCurrentlyEnabled = hidrologia.outro != null;

    if (isCurrentlyEnabled) {
      handleUpdate(outroPath, undefined);
    } else {
      handleUpdate(outroPath, "");
    }
  }, [dispatch, hidrologia.outro]);

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Hidrologia
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
        label="Outro"
        checked={hidrologia.outro != null}
        onChange={handleFinalOutroToggle}
      />
      <Divider height={12} />
      {hidrologia.outro != null && (
        <Input
          placeholder="Especifique aqui"
          label="Qual outro fenômeno hidrológico?"
          value={hidrologia.outro || ""}
          onChangeText={handleOutroTextChange}
        />
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
});
