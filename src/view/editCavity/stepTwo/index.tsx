import React, { useCallback, useMemo, FC } from "react"; // Adicionado useMemo e FC
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import { Input } from "../../../components/input";
import { Checkbox } from "../../../components/checkbox";
import TextInter from "../../../components/textInter";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  updateCavidadeData,
  toggleDificuldadesExternasOutroEnabled,
  setDificuldadesExternasOutroText,
} from "../../../redux/cavitySlice";
import { Dificuldades_externas, RouterProps } from "../../../types"; // Adicionado RouterProps

// Chaves para dificuldades específicas (excluindo 'nenhuma' e os campos de 'outro')
const specificDifficultyKeys: (keyof Omit<Dificuldades_externas, "nenhuma" | "outroEnabled" | "outro">)[] = [
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
];

// Interface para as props do StepTwo
interface StepTwoProps extends RouterProps { // RouterProps pode não ser usado aqui, mas incluído para consistência
  validationAttempted: boolean;
}

// Função auxiliar para verificar se um campo está preenchido
const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    // Adicione outras verificações se necessário (ex: array vazio)
    return true;
};

export const StepTwo: FC<StepTwoProps> = ({ validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const dificuldadesExternas = cavidade.dificuldades_externas ?? { nenhuma: true }; // Garante um valor padrão

  // Lógica de Erros Específicos para StepTwo
  const stepTwoErrors = useMemo(() => {
    if (!validationAttempted) {
      return {}; // Sem erros se a validação não foi tentada
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    // Validação para 'desenvolvimento_linear' (opcional, mas se preenchido, deve ser número)
    // A conversão para número já é feita em handleLinearDevChange.
    // Se fosse obrigatório:
    // if (!isFieldFilled(cavidade.desenvolvimento_linear)) {
    //   errors.desenvolvimento_linear = errorMsgRequired;
    // }

    // Validação para Dificuldades Externas
    const de = dificuldadesExternas;
    const algumaEspecificaMarcada = specificDifficultyKeys.some(key => de[key]);
    
    if (de.outroEnabled && !isFieldFilled(de.outro)) {
      errors.dificuldades_externas_outro = errorMsgRequired;
    }
    
    // Se nenhuma dificuldade (nem específica, nem "Outro" preenchido, nem "Nenhum") estiver marcada
    if (!algumaEspecificaMarcada && !(de.outroEnabled && isFieldFilled(de.outro)) && !de.nenhuma) {
        errors.dificuldades_externas_geral = "Selecione pelo menos uma dificuldade ou 'Nenhum'.";
    }

    return errors;
  }, [validationAttempted, cavidade.desenvolvimento_linear, dificuldadesExternas]);


  const handleLinearDevChange = (text: string) => {
    // Permite limpar o campo. parseFloat de "" é NaN.
    if (text.trim() === "") {
        dispatch(
            updateCavidadeData({
                path: ["desenvolvimento_linear"],
                value: undefined,
            })
        );
        return;
    }
    const num = parseFloat(text.replace(',', '.')); // Substitui vírgula por ponto para parseFloat
    dispatch(
      updateCavidadeData({
        path: ["desenvolvimento_linear"],
        value: isNaN(num) ? undefined : num, // Se não for um número, envia undefined
      })
    );
  };

  const handleSpecificDifficultyChange = useCallback(
    (fieldName: keyof Dificuldades_externas) => {
      const currentValue = dificuldadesExternas[fieldName] || false;
      const isTurningOn = !currentValue;

      dispatch(
        updateCavidadeData({
          path: ["dificuldades_externas", fieldName],
          value: isTurningOn,
        })
      );

      if (isTurningOn && dificuldadesExternas.nenhuma) {
        dispatch(
          updateCavidadeData({
            path: ["dificuldades_externas", "nenhuma"],
            value: false,
          })
        );
      }
    },
    [dispatch, dificuldadesExternas]
  );

  const handleNenhumaChange = useCallback(() => {
    const isTurningOn = !(dificuldadesExternas.nenhuma ?? false); // Lida com undefined inicial
    dispatch(
      updateCavidadeData({
        path: ["dificuldades_externas", "nenhuma"],
        value: isTurningOn,
      })
    );

    if (isTurningOn) {
      specificDifficultyKeys.forEach((key) => {
        if (dificuldadesExternas[key]) {
          dispatch(
            updateCavidadeData({
              path: ["dificuldades_externas", key],
              value: false,
            })
          );
        }
      });
      if (dificuldadesExternas.outroEnabled) {
        dispatch(toggleDificuldadesExternasOutroEnabled()); 
      }
    }
  }, [dispatch, dificuldadesExternas]);

  const handleToggleOutro = useCallback(() => {
    const isCurrentlyEnabled = dificuldadesExternas.outroEnabled ?? false;
    const willBeEnabled = !isCurrentlyEnabled;
    dispatch(toggleDificuldadesExternasOutroEnabled());

    if (willBeEnabled && (dificuldadesExternas.nenhuma ?? false)) {
      dispatch(
        updateCavidadeData({
          path: ["dificuldades_externas", "nenhuma"],
          value: false,
        })
      );
    }
  }, [dispatch, dificuldadesExternas]);

  const handleOutroTextUpdate = (text: string) => {
    dispatch(setDificuldadesExternasOutroText(text));
  };

  return (
    <View style={styles.container}>
      <Divider />
      <Input
        placeholder="Especifique aqui (metros)"
        label="Desenvolvimento linear" // Removido (metros) para consistência se o placeholder já indica
        keyboardType="numeric"
        value={cavidade.desenvolvimento_linear !== undefined ? String(cavidade.desenvolvimento_linear).replace('.', ',') : ""}
        onChangeText={handleLinearDevChange}
        // hasError={!!stepTwoErrors.desenvolvimento_linear} // Descomente se for obrigatório
        // errorMessage={stepTwoErrors.desenvolvimento_linear}
      />
      <TextInter color={colors.white[100]} weight="medium">
        Dificuldades externas
      </TextInter>
      {!!stepTwoErrors.dificuldades_externas_geral && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
            {stepTwoErrors.dificuldades_externas_geral}
        </TextInter>
      )}
      <Divider height={12} />
      <Checkbox
        label="Rastejamento"
        checked={dificuldadesExternas?.rastejamento || false}
        onChange={() => handleSpecificDifficultyChange("rastejamento")}
      />
      <Divider height={12} />
      <Checkbox
        label="Quebra corpo"
        checked={dificuldadesExternas?.quebra_corpo || false}
        onChange={() => handleSpecificDifficultyChange("quebra_corpo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Teto baixo"
        checked={dificuldadesExternas?.teto_baixo || false}
        onChange={() => handleSpecificDifficultyChange("teto_baixo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Natação"
        checked={dificuldadesExternas?.natacao || false}
        onChange={() => handleSpecificDifficultyChange("natacao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Sifão"
        checked={dificuldadesExternas?.sifao || false}
        onChange={() => handleSpecificDifficultyChange("sifao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Blocos instáveis"
        checked={dificuldadesExternas?.blocos_instaveis || false}
        onChange={() => handleSpecificDifficultyChange("blocos_instaveis")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lances verticais"
        checked={dificuldadesExternas?.lances_verticais || false}
        onChange={() => handleSpecificDifficultyChange("lances_verticais")}
      />
      <Divider height={12} />
      <Checkbox
        label="Cachoeira"
        checked={dificuldadesExternas?.cachoeira || false}
        onChange={() => handleSpecificDifficultyChange("cachoeira")}
      />
      <Divider height={12} />
      <Checkbox
        label="Trechos escorregadios"
        checked={dificuldadesExternas?.trechos_escorregadios || false}
        onChange={() => handleSpecificDifficultyChange("trechos_escorregadios")}
      />
      <Divider height={12} />
      <Checkbox
        label="Passagem em curso d'água"
        checked={dificuldadesExternas?.passagem_curso_agua || false}
        onChange={() =>
          handleSpecificDifficultyChange("passagem_curso_agua")
        }
      />
      <Divider height={12} />
      <Checkbox
        label="Outro"
        checked={dificuldadesExternas?.outroEnabled || false}
        onChange={handleToggleOutro}
      />
      <Divider height={12} />
      {dificuldadesExternas?.outroEnabled && (
          <Input
            placeholder="Especifique qual"
            label="Qual outra dificuldade?"
            value={dificuldadesExternas?.outro || ""}
            onChangeText={handleOutroTextUpdate}
            hasError={!!stepTwoErrors.dificuldades_externas_outro}
            errorMessage={stepTwoErrors.dificuldades_externas_outro}
            required // Indica visualmente que é obrigatório se "Outro" estiver marcado
          />
      )}
      <Checkbox
        label="Nenhum"
        checked={dificuldadesExternas?.nenhuma || false}
        onChange={handleNenhumaChange}
      />
      <Divider height={12} />
      <StatusBar style="light" />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: "100%", // Removido para flexibilidade
    // width: "100%",  // Removido
    paddingBottom: 30,
    paddingHorizontal: 5, // Adicionado um pequeno padding horizontal se necessário
  },
  errorText: {
    marginTop: 4,
    marginBottom: 8,
  }
});
