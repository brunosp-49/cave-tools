import React, { FC, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import { Input } from "../../../components/input";
import { Checkbox } from "../../../components/checkbox";
import TextInter from "../../../components/textInter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateCavidadeData } from "../../../redux/cavitySlice";
import { Dificuldades_externas } from "../../../types";

export const StepTwo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const dificuldadesExternas = cavidade.dificuldades_externas ?? {};

  const handleUpdate = (path: (string | number)[], value: any) => {
    dispatch(updateCavidadeData({ path, value }));
  };

  const handleLinearDevChange = (text: string) => {
    const num = parseFloat(text);
    handleUpdate(["desenvolvimento_linear"], isNaN(num) ? undefined : num);
  };

  const handleCheckboxChange = useCallback(
    (fieldName: keyof Dificuldades_externas) => {
      const currentState = dificuldadesExternas || {};
      const currentValue = currentState[fieldName] || false;
      const isTurningOn = !currentValue;

      const basePath = ["dificuldades_externas"];
      const path = [...basePath, fieldName];
      handleUpdate(path, isTurningOn);

      const nenhumaKey: keyof Dificuldades_externas = "nenhuma";

      const specificDifficultyKeys: (keyof Dificuldades_externas)[] = [
        "rastejamento",
        "quebra_corpo",
        "teto_baixo",
        "natacao",
        "sifao",
        "blocos_instaveis",
        "lances_verticais",
        "cachoeira",
        "trechos_escorregadios",
        "passagem_curso_agua",
        // Adicione outras chaves se existirem no seu tipo Dificuldades_externas
      ];

      if (fieldName === nenhumaKey && isTurningOn) {
        specificDifficultyKeys.forEach((key) => {
          if (currentState[key] !== false) {
            const keyPath = [...basePath, key];
            handleUpdate(keyPath, false);
          }
        });
      } else if (specificDifficultyKeys.includes(fieldName) && isTurningOn) {
        if (currentState[nenhumaKey] !== false) {
          const nenhumaPath = [...basePath, nenhumaKey];
          handleUpdate(nenhumaPath, false);
        }
      }
    },
    [dificuldadesExternas, handleUpdate]
  );
  return (
    <View style={styles.container}>
      <Divider />
      <Input
        placeholder="Especifique aqui"
        label="Desenvolvimento linear"
        keyboardType="numeric"
        value={String(cavidade.desenvolvimento_linear ?? "")}
        onChangeText={handleLinearDevChange}
      />
      <TextInter color={colors.white[100]} weight="medium">
        Dificuldades externas
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Rastejamento"
        checked={dificuldadesExternas?.rastejamento || false}
        onChange={() => handleCheckboxChange("rastejamento")}
      />
      <Divider height={12} />
      <Checkbox
        label="Quebra corpo"
        checked={dificuldadesExternas?.quebra_corpo || false}
        onChange={() => handleCheckboxChange("quebra_corpo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Teto baixo"
        checked={dificuldadesExternas?.teto_baixo || false}
        onChange={() => handleCheckboxChange("teto_baixo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Natação"
        checked={dificuldadesExternas?.natacao || false}
        onChange={() => handleCheckboxChange("natacao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Sifão"
        checked={dificuldadesExternas?.sifao || false}
        onChange={() => handleCheckboxChange("sifao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Blocos instáveis"
        checked={dificuldadesExternas?.blocos_instaveis || false}
        onChange={() => handleCheckboxChange("blocos_instaveis")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lances verticais"
        checked={dificuldadesExternas?.lances_verticais || false}
        onChange={() => handleCheckboxChange("lances_verticais")}
      />
      <Divider height={12} />
      <Checkbox
        label="Cachoeira"
        checked={dificuldadesExternas?.cachoeira || false}
        onChange={() => handleCheckboxChange("cachoeira")}
      />
      <Divider height={12} />
      <Checkbox
        label="Trechos escorregadios"
        checked={dificuldadesExternas?.trechos_escorregadios || false}
        onChange={() => handleCheckboxChange("trechos_escorregadios")}
      />
      <Divider height={12} />
      <Checkbox
        label="Passagem em curso d'água"
        checked={dificuldadesExternas?.passagem_curso_agua || false}
        onChange={() => handleCheckboxChange("passagem_curso_agua")}
      />
      <Divider height={12} />
      <Checkbox
        label="Nenhum"
        checked={dificuldadesExternas?.nenhuma || false}
        onChange={() => handleCheckboxChange("nenhuma")}
      />
      <Divider height={12} />
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
});
