import React, { FC, useCallback, useMemo } from "react"; // Adicionado useMemo e FC
import { ScrollView, StyleSheet, View } from "react-native"; // ScrollView pode ser útil para conteúdo longo
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateCavidadeData } from "../../../redux/cavitySlice";

import {
  Topografia,
  Morfologia,
  Padrao_planimetrico_predominante,
  Forma_predominante,
  RouterProps, // Importar RouterProps
} from "../../../types";

// Interface para as props do StepFive
// Se StepComponentProps já está definido em um arquivo de tipos central, importe-o de lá.
interface StepFiveProps extends RouterProps {
  validationAttempted: boolean;
}

type EspeleometriaKeys = keyof NonNullable<Topografia["espeleometria"]>;
type PrevisaoKeys = keyof NonNullable<Topografia["previsao"]>;
type PadraoPlaniKeys = keyof Padrao_planimetrico_predominante;
type FormaPredominanteKeys = keyof Forma_predominante;

// Função auxiliar para verificar se um campo está preenchido
const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

export const StepFive: FC<StepFiveProps> = ({
  navigation,
  route,
  validationAttempted,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const topografia: Partial<Topografia> = cavidade.topografia ?? {};
  const morfologia: Partial<Morfologia> = cavidade.morfologia ?? {};
  const espeleometria = topografia.espeleometria ?? {};
  const previsao = topografia.previsao ?? {};
  const padraoPlanimetrico = morfologia.padrao_planimetrico ?? {};
  const formaSecoes = morfologia.forma_secoes ?? {};

  // Lógica de Erros Específicos para StepFive
  const stepFiveErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    // Validação para "Outro" de Padrão planimétrico
    if (
      padraoPlanimetrico.outro !== undefined &&
      !isFieldFilled(padraoPlanimetrico.outro)
    ) {
      errors.padrao_planimetrico_outro = errorMsgRequired;
    }

    // Validação para "Outro" de Forma predominante
    if (formaSecoes.outro !== undefined && !isFieldFilled(formaSecoes.outro)) {
      errors.forma_secoes_outro = errorMsgRequired;
    }

    // Outras validações do StepFive podem ser adicionadas aqui se necessário
    // Por exemplo, se os campos de Espeleometria fossem obrigatórios:
    // if (!isFieldFilled(espeleometria.projecao_horizontal)) errors.projecao_horizontal = errorMsgRequired;
    // etc.

    return errors;
  }, [validationAttempted, padraoPlanimetrico, formaSecoes]);

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleTopografiaEspeleoChange = useCallback(
    (fieldName: EspeleometriaKeys, text: string) => {
      if (text.trim() === "") {
        handleUpdate(["topografia", "espeleometria", fieldName], undefined);
        return;
      }
      const num = parseFloat(text.replace(",", "."));
      const path = ["topografia", "espeleometria", fieldName];
      handleUpdate(path, isNaN(num) ? undefined : num);
    },
    [handleUpdate] // Removido dispatch, handleUpdate já o tem
  );

  const handleTopografiaPrevisaoChange = useCallback(
    (fieldName: PrevisaoKeys, text: string) => {
      const path = ["topografia", "previsao", fieldName];
      handleUpdate(path, text);
    },
    [handleUpdate] // Removido dispatch
  );

  const handlePadraoPlaniChange = useCallback(
    (fieldName: PadraoPlaniKeys) => {
      const path = ["morfologia", "padrao_planimetrico", fieldName];
      const currentValue = padraoPlanimetrico[fieldName]; // Pode ser boolean ou string para 'outro'

      if (fieldName === "outro") {
        const isCurrentlyActive = padraoPlanimetrico.outro !== undefined;
        const newValue = isCurrentlyActive ? undefined : ""; // Se ativo, desativa (undefined); senão, ativa (string vazia)
        handleUpdate(path, newValue);
      } else {
        handleUpdate(path, !currentValue); // Para os booleanos
      }
    },
    [padraoPlanimetrico, handleUpdate] // Removido dispatch
  );

  const handleFormaPredominanteChange = useCallback(
    (fieldName: FormaPredominanteKeys) => {
      const path = ["morfologia", "forma_secoes", fieldName];
      const currentValue = formaSecoes[fieldName]; // Pode ser boolean ou string para 'outro'

      if (fieldName === "outro") {
        const isCurrentlyActive = formaSecoes.outro !== undefined;
        const newValue = isCurrentlyActive ? undefined : "";
        handleUpdate(path, newValue);
      } else {
        handleUpdate(path, !currentValue);
      }
    },
    [formaSecoes, handleUpdate] // Removido dispatch
  );

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Topografia (Mapa da Cavidade)
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Espeleometria
      </TextInter>
      <Divider height={16} />
      <Input
        label="Projeção horizontal (m)"
        placeholder="Digite a projeção horizontal"
        keyboardType="numeric"
        value={
          espeleometria.projecao_horizontal !== undefined
            ? String(espeleometria.projecao_horizontal).replace(".", ",")
            : ""
        }
        onChangeText={(text) =>
          handleTopografiaEspeleoChange("projecao_horizontal", text)
        }
        // hasError={!!stepFiveErrors.projecao_horizontal} // Descomente se for obrigatório
        // errorMessage={stepFiveErrors.projecao_horizontal}
      />
      <Input
        label="Desnível do piso (m)"
        placeholder="Digite o desnível do piso"
        keyboardType="numeric"
        value={
          espeleometria.desnivel_piso !== undefined
            ? String(espeleometria.desnivel_piso).replace(".", ",")
            : ""
        }
        onChangeText={(text) =>
          handleTopografiaEspeleoChange("desnivel_piso", text)
        }
      />
      <Input
        label="Área (m²)"
        placeholder="Digite a área"
        keyboardType="numeric"
        value={
          espeleometria.area !== undefined
            ? String(espeleometria.area).replace(".", ",")
            : ""
        }
        onChangeText={(text) => handleTopografiaEspeleoChange("area", text)}
      />
      <Input
        label="Volume (m³)"
        placeholder="Digite o volume"
        keyboardType="numeric"
        value={
          espeleometria.volume !== undefined
            ? String(espeleometria.volume).replace(".", ",")
            : ""
        }
        onChangeText={(text) => handleTopografiaEspeleoChange("volume", text)}
      />
      <TextInter color={colors.white[100]} weight="medium">
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
      <TextInter color={colors.white[100]} weight="medium">
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
        label="Outro (Padrão)"
        checked={padraoPlanimetrico.outro !== undefined}
        onChange={() => handlePadraoPlaniChange("outro")}
      />
      {padraoPlanimetrico.outro !== undefined && (
        <>
          <Divider height={12} />
          <Input
            label="Qual outro padrão?"
            placeholder="Especifique aqui"
            value={padraoPlanimetrico.outro || ""}
            onChangeText={(text) =>
              handleUpdate(["morfologia", "padrao_planimetrico", "outro"], text)
            }
            hasError={!!stepFiveErrors.padrao_planimetrico_outro}
            errorMessage={stepFiveErrors.padrao_planimetrico_outro}
            required // Indica visualmente que é obrigatório
          />
        </>
      )}
      <Divider />

      <TextInter color={colors.white[100]} weight="medium">
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
        label="Outro (Forma)"
        checked={formaSecoes.outro !== undefined}
        onChange={() => handleFormaPredominanteChange("outro")}
      />
      {formaSecoes.outro !== undefined && (
        <>
          <Divider height={12} />
          <Input
            label="Qual outra forma?"
            placeholder="Especifique aqui"
            value={formaSecoes.outro || ""}
            onChangeText={(text) =>
              handleUpdate(["morfologia", "forma_secoes", "outro"], text)
            }
            hasError={!!stepFiveErrors.forma_secoes_outro}
            errorMessage={stepFiveErrors.forma_secoes_outro}
            required // Indica visualmente que é obrigatório
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
    // height: "100%", // Removido para flexibilidade
    // width: "100%", // Removido
    paddingBottom: 30,
  },
  // Removido secondLayer pois não é usado aqui, mas pode ser adicionado se necessário para sub-itens
  // secondLayer: {
  //   paddingLeft: 30,
  //   marginTop: 10,
  // },
  inputSpacing: {
    // Estilo para espaçamento abaixo dos Inputs "Outro"
    marginBottom: 12,
  },
  errorText: {
    // Estilo para mensagens de erro (se precisar de uma geral para a seção)
    color: colors.error[100],
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});
