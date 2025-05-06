import React, { FC, useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";

// Import Redux hooks, state/dispatch types, and the action
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store"; // Adjust path
import { updateCavidadeData } from "../../../redux/cavitySlice"; // Adjust path

// Import specific types used in this step
import {
  Topografia,
  Morfologia,
  Padrao_planimetrico_predominante,
  Forma_predominante,
} from "../../../types"; // Adjust path

// Define types for handler keys for better type safety
type EspeleometriaKeys = keyof NonNullable<Topografia["espeleometria"]>;
type PrevisaoKeys = keyof NonNullable<Topografia["previsao"]>;
type PadraoPlaniKeys = keyof Padrao_planimetrico_predominante;
type FormaPredominanteKeys = keyof Forma_predominante;

export const StepFive = () => {
  // --- Redux Setup ---
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  // Use defaults for top-level optional objects
  const topografia: Partial<Topografia> = cavidade.topografia ?? {};
  const morfologia: Partial<Morfologia> = cavidade.morfologia ?? {};
  // Deeper defaults for easier access
  const espeleometria = topografia.espeleometria ?? {};
  const previsao = topografia.previsao ?? {};
  const padraoPlanimetrico = morfologia.padrao_planimetrico ?? {};
  const formaSecoes = morfologia.forma_secoes ?? {};

  // --- Generic Update Handler ---
  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  // --- Specific Handlers ---

  const handleTopografiaEspeleoChange = useCallback(
    (fieldName: EspeleometriaKeys, text: string) => {
      const num = parseFloat(text);
      const path = ["topografia", "espeleometria", fieldName];
      handleUpdate(path, isNaN(num) ? undefined : num);
    },
    [dispatch]
  ); // Removed handleUpdate dependency, dispatch is enough

  const handleTopografiaPrevisaoChange = useCallback(
    (fieldName: PrevisaoKeys, text: string) => {
      const path = ["topografia", "previsao", fieldName];
      handleUpdate(path, text); // BCRA and UIS are strings
    },
    [dispatch]
  );

  const handlePadraoPlaniChange = useCallback(
    (fieldName: PadraoPlaniKeys) => {
      const path = ["morfologia", "padrao_planimetrico", fieldName];
      const currentValue = padraoPlanimetrico[fieldName] || false;
      const newValue = !currentValue;
      handleUpdate(path, newValue);
      // Clear 'outro' text if 'Outro' checkbox is unchecked
      if (fieldName === "outro" && !newValue) {
        handleUpdate(["morfologia", "padrao_planimetrico", "outro"], "");
      }
    },
    [dispatch, padraoPlanimetrico]
  );

  const handleFormaPredominanteChange = useCallback(
    (fieldName: FormaPredominanteKeys) => {
      const path = ["morfologia", "forma_secoes", fieldName];
      const currentValue = formaSecoes[fieldName] || false;
      const newValue = !currentValue;
      handleUpdate(path, newValue);
      // Clear 'outro' text if 'Outro' checkbox is unchecked
      if (fieldName === "outro" && !newValue) {
        handleUpdate(["morfologia", "forma_secoes", "outro"], "");
      }
    },
    [dispatch, formaSecoes]
  );

  // --- JSX ---
  return (
    <View
      style={styles.container}
    >
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Topografia (Mapa da Cavidade)
      </TextInter>
      <Divider />
      {/* Typo in original UI? "Grupo litológico" seems out of place here, removed title */}
      {/* Assuming Espeleometria section starts here */}
      <TextInter
        color={colors.white[100]}
        weight="medium"
      >
        Espeleometria
      </TextInter>
      <Divider height={16} />
      <Input
        label="Projeção horizontal (m)"
        placeholder="Digite a projeção horizontal"
        keyboardType="numeric"
        value={String(espeleometria.projecao_horizontal ?? "")}
        onChangeText={(text) =>
          handleTopografiaEspeleoChange("projecao_horizontal", text)
        }
      />
      <Input
        label="Desnível do piso (m)"
        placeholder="Digite o desnível do piso"
        keyboardType="numeric"
        value={String(espeleometria.desnivel_piso ?? "")}
        onChangeText={(text) =>
          handleTopografiaEspeleoChange("desnivel_piso", text)
        }
      />
      <Input
        label="Área (m²)"
        placeholder="Digite a área"
        keyboardType="numeric"
        value={String(espeleometria.area ?? "")}
        onChangeText={(text) => handleTopografiaEspeleoChange("area", text)}
      />
      <Input
        label="Volume (m³)"
        placeholder="Digite o volume"
        keyboardType="numeric"
        value={String(espeleometria.volume ?? "")}
        onChangeText={(text) => handleTopografiaEspeleoChange("volume", text)}
      />
      <TextInter
        color={colors.white[100]}
        weight="medium"
      >
        Previsão (Classificação)
      </TextInter>
      <Divider height={16} />
      <Input
        label="BCRA"
        placeholder="Digite o valor BCRA"
        value={previsao.bcra || ""}
        onChangeText={(text) => handleTopografiaPrevisaoChange("bcra", text)}
      />
      <Input
        label="UIS"
        placeholder="Digite o valor UIS"
        value={previsao.uis || ""}
        onChangeText={(text) => handleTopografiaPrevisaoChange("uis", text)}
      />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Morfologia
      </TextInter>
      <Divider />
      <TextInter
        color={colors.white[100]}
        weight="medium"
      >
        Padrão planimétrico predominante
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Retilínea"
        checked={padraoPlanimetrico.retilinea || false}
        onChange={() => handlePadraoPlaniChange("retilinea")}
      />
      <Divider height={12} />
      <Checkbox
        label="Anastomosada"
        checked={padraoPlanimetrico.anastomosada || false}
        onChange={() => handlePadraoPlaniChange("anastomosada")}
      />
      <Divider height={12} />
      <Checkbox
        label="Espongiforme"
        checked={padraoPlanimetrico.espongiforme || false}
        onChange={() => handlePadraoPlaniChange("espongiforme")}
      />
      <Divider height={12} />
      <Checkbox
        label="Labiríntica"
        checked={padraoPlanimetrico.labirintica || false}
        onChange={() => handlePadraoPlaniChange("labirintica")}
      />
      <Divider height={12} />
      <Checkbox
        label="Reticulado"
        checked={padraoPlanimetrico.reticulado || false}
        onChange={() => handlePadraoPlaniChange("reticulado")}
      />
      <Divider height={12} />
      <Checkbox
        label="Ramiforme"
        checked={padraoPlanimetrico.ramiforme || false}
        onChange={() => handlePadraoPlaniChange("ramiforme")}
      />
      <Divider height={12} />
      <Checkbox
        label="Dendrítico"
        checked={padraoPlanimetrico.dendritico || false}
        onChange={() => handlePadraoPlaniChange("dendritico")}
      />
      <Divider height={12} />
      <Checkbox
        label="Outro"
        checked={!!padraoPlanimetrico.outro}
        onChange={() => handlePadraoPlaniChange("outro")}
      />
      {/* Conditional Input for Outro Padrão */}
      {!!padraoPlanimetrico.outro && (
        <>
          <Divider height={12} />
          <Input
            label="Qual outro padrão?"
            placeholder="Especifique aqui"
            value={padraoPlanimetrico.outro || ""}
            onChangeText={(text) =>
              handleUpdate(["morfologia", "padrao_planimetrico", "outro"], text)
            }
          />
        </>
      )}
      <Divider />

      {/* Forma predominante Section */}
      <TextInter
        color={colors.white[100]}
        weight="medium"
      >
        Forma predominante das seções
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Circular"
        checked={formaSecoes.circular || false}
        onChange={() => handleFormaPredominanteChange("circular")}
      />
      <Divider height={12} />
      <Checkbox
        label="Elíptica vertical"
        checked={formaSecoes.eliptica_vertical || false}
        onChange={() => handleFormaPredominanteChange("eliptica_vertical")}
      />
      <Divider height={12} />
      <Checkbox
        label="Elíptica horizontal"
        checked={formaSecoes.eliptica_horizontal || false}
        onChange={() => handleFormaPredominanteChange("eliptica_horizontal")}
      />
      <Divider height={12} />
      <Checkbox
        label="Elíptica inclinada"
        checked={formaSecoes.eliptica_inclinada || false}
        onChange={() => handleFormaPredominanteChange("eliptica_inclinada")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lenticular vertical"
        checked={formaSecoes.lenticular_vertical || false}
        onChange={() => handleFormaPredominanteChange("lenticular_vertical")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lenticular horizontal"
        checked={formaSecoes.lenticular_horizontal || false}
        onChange={() => handleFormaPredominanteChange("lenticular_horizontal")}
      />
      <Divider height={12} />
      <Checkbox
        label="Poligonal"
        checked={formaSecoes.poligonal || false}
        onChange={() => handleFormaPredominanteChange("poligonal")}
      />
      <Divider height={12} />
      <Checkbox
        label="Poligonal tubular"
        checked={formaSecoes.poligonal_tabular || false}
        onChange={() => handleFormaPredominanteChange("poligonal_tabular")}
      />
      <Divider height={12} />
      <Checkbox
        label="Triangular"
        checked={formaSecoes.triangular || false}
        onChange={() => handleFormaPredominanteChange("triangular")}
      />
      <Divider height={12} />
      <Checkbox
        label="Fechadura"
        checked={formaSecoes.fechadura || false}
        onChange={() => handleFormaPredominanteChange("fechadura")}
      />
      <Divider height={12} />
      <Checkbox
        label="Linear inclinada"
        checked={formaSecoes.linear_inclinada || false}
        onChange={() => handleFormaPredominanteChange("linear_inclinada")}
      />
      <Divider height={12} />
      <Checkbox
        label="Linear vertical"
        checked={formaSecoes.linear_vertical || false}
        onChange={() => handleFormaPredominanteChange("linear_vertical")}
      />
      <Divider height={12} />
      <Checkbox
        label="Irregular"
        checked={formaSecoes.irregular || false}
        onChange={() => handleFormaPredominanteChange("irregular")}
      />
      <Divider height={12} />
      <Checkbox
        label="Mista"
        checked={formaSecoes.mista || false}
        onChange={() => handleFormaPredominanteChange("mista")}
      />
      <Divider height={12} />
      <Checkbox
        label="Outro"
        checked={!!formaSecoes.outro}
        onChange={() => handleFormaPredominanteChange("outro")}
      />
      {/* Conditional Input for Outro Forma */}
      {!!formaSecoes.outro && (
        <>
          <Divider height={12} />
          <Input
            label="Qual outra forma?"
            placeholder="Especifique aqui"
            value={formaSecoes.outro || ""}
            onChangeText={(text) =>
              handleUpdate(["morfologia", "forma_secoes", "outro"], text)
            }
          />
        </>
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
