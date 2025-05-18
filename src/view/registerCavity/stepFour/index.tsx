import React, { FC, useCallback, useMemo } from "react"; // Adicionado useMemo e FC
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";
import {
  Dificuldades_progressao_interna,
  Grupo_litologico,
  Infraestrutura_interna,
  RouterProps, // Importar RouterProps
} from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  updateCavidadeData,
  toggleInfraestruturaInternaOutrosEnabled,
  setInfraestruturaInternaOutrosText,
} from "../../../redux/cavitySlice";

// Interface para as props do StepFour
// Se StepComponentProps já está definido em um arquivo de tipos central, importe-o de lá.
interface StepFourProps extends RouterProps {
  validationAttempted: boolean;
}

type GrupoLitologicoKeys = keyof Grupo_litologico;
type InfraInternaSpecificKeys = Exclude<
  keyof Infraestrutura_interna,
  "outroEnabled" | "outros" | "corrimao" // corrimao é tratado separadamente
>;
type CorrimaoKeys = keyof NonNullable<Infraestrutura_interna["corrimao"]>;
type DificuldadeProgKeys = keyof Dificuldades_progressao_interna;

type EstadoConservacaoValue =
  | "Conservada"
  | "Depredação localizada"
  | "Depredação intensa";

// Função auxiliar para verificar se um campo está preenchido
const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

export const StepFour: FC<StepFourProps> = ({
  navigation,
  route,
  validationAttempted,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const caracterizacao: Partial<
    typeof cavidade.caracterizacao_interna & {
      estado_conservacao_detalhes?: string; // Adicionado para tipagem correta
    }
  > = cavidade.caracterizacao_interna ?? {};
  const grupoLitologico = caracterizacao.grupo_litologico ?? {};
  const infraInterna = caracterizacao.infraestrutura_interna ?? {};
  const dificuldadeProg = caracterizacao.dificuldades_progressao_interna ?? {};
  const corrimao = infraInterna.corrimao ?? {};

  const infraOutroEnabled = infraInterna.outroEnabled || false;
  const infraOutrosText = infraInterna.outros || "";

  // Lógica de Erros Específicos para StepFour
  const stepFourErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    // Validação Grupo Litológico
    if (
      grupoLitologico.outro !== undefined &&
      !isFieldFilled(grupoLitologico.outro)
    ) {
      errors.grupo_litologico_outro = errorMsgRequired;
    }

    // Validação Estado de Conservação
    if (
      (caracterizacao.estado_conservacao === "Depredação localizada" ||
        caracterizacao.estado_conservacao === "Depredação intensa") &&
      !isFieldFilled(caracterizacao.estado_conservacao_detalhes)
    ) {
      errors.estado_conservacao_detalhes = errorMsgRequired;
    }

    // Validação Corrimão
    if (infraInterna.corrimao) {
      // Se o checkbox "Corrimão" principal está marcado
      const corrimaoData = infraInterna.corrimao;
      const algumaOpcaoCorrimaoSelecionada =
        corrimaoData.ferro ||
        corrimaoData.madeira ||
        corrimaoData.corda ||
        corrimaoData.outro !== undefined; // "Outro" é ativo se o texto não for undefined

      if (!algumaOpcaoCorrimaoSelecionada) {
        errors.corrimao_tipo = "Selecione pelo menos um tipo de corrimão.";
      } else if (
        corrimaoData.outro !== undefined &&
        !isFieldFilled(corrimaoData.outro)
      ) {
        errors.corrimao_outro_texto = errorMsgRequired;
      }
    }

    // Validação Infraestrutura Interna "Outro"
    if (infraInterna.outroEnabled && !isFieldFilled(infraInterna.outros)) {
      errors.infraestrutura_outro_texto = errorMsgRequired;
    }

    // Validação Dificuldade de Progressão Interna "Outro"
    if (
      dificuldadeProg.outro !== undefined &&
      !isFieldFilled(dificuldadeProg.outro)
    ) {
      errors.dificuldade_prog_outro_texto = errorMsgRequired;
    }

    // Validação geral para Infraestrutura Interna (se nenhuma opção marcada)
    const infraKeys = Object.keys(infraInterna) as Array<
      keyof Infraestrutura_interna
    >;
    const algumaInfraSelecionada = infraKeys.some((key) => {
      if (key === "corrimao") return !!infraInterna.corrimao;
      if (key === "outroEnabled")
        return infraInterna.outroEnabled && isFieldFilled(infraInterna.outros);
      if (key === "outros") return false; // Já tratado por outroEnabled
      return !!infraInterna[key];
    });
    if (
      infraKeys.length > 0 &&
      !algumaInfraSelecionada &&
      !infraInterna.nenhuma
    ) {
      // errors.infraestrutura_geral = "Selecione uma opção de infraestrutura ou 'Nenhuma'.";
    }

    // Validação geral para Dificuldade de Progressão Interna
    const difKeys = Object.keys(dificuldadeProg) as Array<
      keyof Dificuldades_progressao_interna
    >;
    const algumaDificuldadeSelecionada = difKeys.some((key) => {
      if (key === "outro")
        return (
          dificuldadeProg.outro !== undefined &&
          isFieldFilled(dificuldadeProg.outro)
        );
      return !!dificuldadeProg[key];
    });
    if (
      difKeys.length > 0 &&
      !algumaDificuldadeSelecionada &&
      !dificuldadeProg.nenhuma
    ) {
      // errors.dificuldade_geral = "Selecione uma dificuldade ou 'Nenhuma'.";
    }

    return errors;
  }, [
    validationAttempted,
    caracterizacao,
    grupoLitologico,
    infraInterna,
    dificuldadeProg,
  ]);

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleGrupoLitologicoChange = useCallback(
    (fieldName: GrupoLitologicoKeys) => {
      const basePath = ["caracterizacao_interna", "grupo_litologico"];
      const path = [...basePath, fieldName];
      const currentValue = grupoLitologico[fieldName];

      if (fieldName === "outro") {
        const isCurrentlyActiveForInput = grupoLitologico.outro !== undefined;
        const newValue = isCurrentlyActiveForInput ? undefined : "";
        handleUpdate(path, newValue);
      } else {
        handleUpdate(path, !currentValue);
      }
    },
    [grupoLitologico, handleUpdate]
  );

  const handleDesenvolvimentoPredominanteChange = useCallback(
    (value: string) => {
      handleUpdate(
        ["caracterizacao_interna", "desenvolvimento_predominante"],
        value
      );
    },
    [handleUpdate]
  );

  const handleEstadoConservacaoChange = useCallback(
    (value: EstadoConservacaoValue | string) => {
      handleUpdate(["caracterizacao_interna", "estado_conservacao"], value);
      if (value === "Conservada") {
        // Limpa detalhes se "Conservada"
        handleUpdate(
          ["caracterizacao_interna", "estado_conservacao_detalhes"],
          ""
        );
      } else if (caracterizacao.estado_conservacao_detalhes === undefined) {
        // Se mudar para depredação e detalhes for undefined
        handleUpdate(
          ["caracterizacao_interna", "estado_conservacao_detalhes"],
          "" // Inicializa para permitir digitação
        );
      }
    },
    [handleUpdate, caracterizacao.estado_conservacao_detalhes]
  );

  const handleInfraInternaChange = useCallback(
    (fieldName: InfraInternaSpecificKeys | "corrimao" | "nenhuma") => {
      // Adicionado "corrimao" e "nenhuma"
      const currentState = infraInterna;
      const currentValueForField =
        currentState[fieldName as keyof Infraestrutura_interna]; // Cast para evitar erro de tipo
      const isTurningOnThisField =
        fieldName === "corrimao"
          ? !currentState.corrimao // Verifica se o objeto corrimao existe
          : !currentValueForField;

      const basePath = ["caracterizacao_interna", "infraestrutura_interna"];
      const path = [...basePath, fieldName];
      let primaryValue: any;

      if (fieldName === "corrimao") {
        primaryValue = isTurningOnThisField
          ? { ferro: false, madeira: false, corda: false, outro: undefined }
          : undefined;
      } else {
        primaryValue = isTurningOnThisField;
      }
      handleUpdate(path, primaryValue);

      if (fieldName === "nenhuma" && isTurningOnThisField) {
        const specificItemKeys: Array<
          Exclude<InfraInternaSpecificKeys, "nenhuma"> | "corrimao"
        > = [
          "passarela",
          "corrimao",
          "portao",
          "escada",
          "corda",
          "iluminacao_artificial",
          "ponto_ancoragem",
        ];

        specificItemKeys.forEach((key) => {
          const keyPath = [...basePath, key];
          const isCorrimao = key === "corrimao";
          if (
            isCorrimao
              ? !!currentState.corrimao
              : !!currentState[key as InfraInternaSpecificKeys]
          ) {
            handleUpdate(keyPath, isCorrimao ? undefined : false);
          }
        });
        if (currentState.outroEnabled) {
          dispatch(toggleInfraestruturaInternaOutrosEnabled());
        }
      } else if (fieldName !== "nenhuma" && isTurningOnThisField) {
        if (currentState.nenhuma) {
          handleUpdate([...basePath, "nenhuma"], false);
        }
      }
    },
    [infraInterna, handleUpdate, dispatch]
  );

  const handleToggleInfraOutrosCheckbox = useCallback(() => {
    const willBeTurnedOn = !infraInterna.outroEnabled;
    dispatch(toggleInfraestruturaInternaOutrosEnabled());

    if (willBeTurnedOn && infraInterna.nenhuma) {
      handleUpdate(
        ["caracterizacao_interna", "infraestrutura_interna", "nenhuma"],
        false
      );
    }
  }, [dispatch, infraInterna, handleUpdate]);

  const handleInfraOutrosTextUpdate = (text: string) => {
    dispatch(setInfraestruturaInternaOutrosText(text));
  };

  const handleDificuldadeProgChange = useCallback(
    (fieldName: DificuldadeProgKeys) => {
      const currentDificuldadeProgState = dificuldadeProg;
      const basePath = [
        "caracterizacao_interna",
        "dificuldades_progressao_interna",
      ];

      let isTurningOnField: boolean;
      let updatedValueForField: any;

      if (fieldName === "outro") {
        const isCurrentlyActive =
          currentDificuldadeProgState.outro !== undefined;
        updatedValueForField = isCurrentlyActive ? undefined : "";
        isTurningOnField = !isCurrentlyActive;
      } else {
        updatedValueForField = !currentDificuldadeProgState[fieldName];
        isTurningOnField = updatedValueForField;
      }

      handleUpdate([...basePath, fieldName], updatedValueForField);

      const nenhumaKey: DificuldadeProgKeys = "nenhuma";
      const allSpecificKeys: Exclude<DificuldadeProgKeys, "nenhuma">[] = [
        "teto_baixo",
        "blocos_instaveis",
        "trechos_escorregadios",
        "rastejamento",
        "natacao",
        "lances_verticais",
        "passagem_curso_agua",
        "quebra_corpo",
        "sifao",
        "cachoeira",
        "outro",
      ];

      if (fieldName === nenhumaKey && isTurningOnField) {
        allSpecificKeys.forEach((key) => {
          const valueInState = currentDificuldadeProgState[key];
          if (key === "outro") {
            if (valueInState !== undefined) {
              handleUpdate([...basePath, key], undefined);
            }
          } else {
            if (valueInState === true) {
              handleUpdate([...basePath, key], false);
            }
          }
        });
      } else if (isTurningOnField && fieldName !== nenhumaKey) {
        if (currentDificuldadeProgState.nenhuma === true) {
          handleUpdate([...basePath, nenhumaKey], false);
        }
      }
    },
    [dificuldadeProg, handleUpdate]
  );

  const handleCorrimaoChange = useCallback(
    (fieldName: CorrimaoKeys) => {
      const currentCorrimaoState = infraInterna.corrimao || {};
      const basePath = [
        "caracterizacao_interna",
        "infraestrutura_interna",
        "corrimao",
      ];
      const path = [...basePath, fieldName];
      const currentValue = currentCorrimaoState[fieldName];

      if (fieldName === "outro") {
        const isCurrentlyActive = currentValue !== undefined;
        const newValue = isCurrentlyActive ? undefined : "";
        if (!infraInterna.corrimao && !isCurrentlyActive) {
          handleUpdate(
            ["caracterizacao_interna", "infraestrutura_interna", "corrimao"],
            { ...currentCorrimaoState, [fieldName]: newValue } // Garante que o objeto corrimao é criado
          );
        } else {
          handleUpdate(path, newValue);
        }
      } else {
        handleUpdate(path, !currentValue);
      }
    },
    [infraInterna.corrimao, handleUpdate]
  );

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Caracterização interna da cavidade
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Grupo litológico
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Rochas carbonáticas"
        checked={grupoLitologico.rochas_carbonaticas || false}
        onChange={() => handleGrupoLitologicoChange("rochas_carbonaticas")}
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas ferríferas e/ou ferruginosas"
        checked={grupoLitologico.rochas_ferriferas_ferruginosas || false}
        onChange={() =>
          handleGrupoLitologicoChange("rochas_ferriferas_ferruginosas")
        }
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas siliciclásticas"
        checked={grupoLitologico.rochas_siliciclasticas || false}
        onChange={() => handleGrupoLitologicoChange("rochas_siliciclasticas")}
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas pelíticas"
        checked={grupoLitologico.rochas_peliticas || false}
        onChange={() => handleGrupoLitologicoChange("rochas_peliticas")}
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas granito-gnáissicas"
        checked={grupoLitologico.rochas_granito_gnaissicas || false}
        onChange={() =>
          handleGrupoLitologicoChange("rochas_granito_gnaissicas")
        }
      />
      <Divider height={12} />
      <Checkbox
        label="Outro (Grupo Litológico)"
        checked={grupoLitologico.outro !== undefined}
        onChange={() => handleGrupoLitologicoChange("outro")}
      />
      <Divider height={12} />
      {grupoLitologico.outro !== undefined && (
        <Input
          placeholder="Especifique o outro grupo"
          label="Qual outro grupo?"
          required
          value={grupoLitologico.outro || ""}
          onChangeText={(text) =>
            handleUpdate(
              ["caracterizacao_interna", "grupo_litologico", "outro"],
              text
            )
          }
          hasError={!!stepFourErrors.grupo_litologico_outro}
          errorMessage={stepFourErrors.grupo_litologico_outro}
        />
      )}

      <TextInter color={colors.white[100]} weight="medium">
        Desenvolvimento predominante
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        onValueChange={handleDesenvolvimentoPredominanteChange}
        value={caracterizacao.desenvolvimento_predominante || ""}
        options={[
          { id: "1", value: "Horizontal", label: "Horizontal" },
          { id: "2", value: "Vertical", label: "Vertical" },
          { id: "3", value: "Misto", label: "Misto" },
        ]}
      />
      <Divider height={12} />

      <TextInter color={colors.white[100]} weight="medium">
        Estado de conservação
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        onValueChange={handleEstadoConservacaoChange}
        value={caracterizacao.estado_conservacao || ""}
        options={[
          { id: "1", value: "Conservada", label: "Conservada" },
          {
            id: "2",
            value: "Depredação localizada",
            label: "Depredação localizada",
          },
          { id: "3", value: "Depredação intensa", label: "Depredação intensa" },
        ]}
      />
      <Divider height={5} />
      {(caracterizacao.estado_conservacao === "Depredação localizada" ||
        caracterizacao.estado_conservacao === "Depredação intensa") && (
        <>
          <Divider height={12} />
          <Input
            label="Detalhes da Depredação"
            required
            placeholder="Reportar Condição / Detalhes"
            value={caracterizacao.estado_conservacao_detalhes || ""}
            onChangeText={(text) =>
              handleUpdate(
                ["caracterizacao_interna", "estado_conservacao_detalhes"],
                text
              )
            }
            hasError={!!stepFourErrors.estado_conservacao_detalhes}
            errorMessage={stepFourErrors.estado_conservacao_detalhes}
          />
        </>
      )}
      <Divider height={18} />

      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura interna
      </TextInter>
      {/* {!!stepFourErrors.infraestrutura_geral && <TextInter style={styles.errorText}>{stepFourErrors.infraestrutura_geral}</TextInter>} */}
      <Divider height={12} />
      <Checkbox
        label="Passarela"
        checked={infraInterna.passarela || false}
        onChange={() => handleInfraInternaChange("passarela")}
      />
      <Divider height={12} />
      <Checkbox
        label="Corrimão"
        checked={!!infraInterna.corrimao}
        onChange={() => handleInfraInternaChange("corrimao")}
      />
      {!!infraInterna.corrimao && (
        <View style={styles.secondLayer}>
          <TextInter color={colors.white[100]} weight="medium">
            Tipo de Corrimão
          </TextInter>
          {!!stepFourErrors.corrimao_tipo && (
            <>
            <Divider height={8} />
            <TextInter style={styles.errorText}>
              {stepFourErrors.corrimao_tipo}
            </TextInter>
            </>
          )}
          <Divider height={12} />
          <Checkbox
            label="Ferro"
            checked={corrimao.ferro || false}
            onChange={() => handleCorrimaoChange("ferro")}
          />
          <Divider height={12} />
          <Checkbox
            label="Madeira"
            checked={corrimao.madeira || false}
            onChange={() => handleCorrimaoChange("madeira")}
          />
          <Divider height={12} />
          <Checkbox
            label="Corda (tipo corrimão)"
            checked={corrimao.corda || false}
            onChange={() => handleCorrimaoChange("corda")}
          />
          <Divider height={12} />
          <Checkbox
            label="Outro (Tipo Corrimão)"
            checked={corrimao.outro !== undefined}
            onChange={() => handleCorrimaoChange("outro")}
          />
          {corrimao.outro !== undefined && (
            <>
              <Divider height={12} />
              <Input
                label="Qual outro tipo de corrimão?"
                placeholder="Especifique"
                required
                value={corrimao.outro || ""}
                onChangeText={(text) =>
                  handleUpdate(
                    [
                      "caracterizacao_interna",
                      "infraestrutura_interna",
                      "corrimao",
                      "outro",
                    ],
                    text
                  )
                }
                hasError={!!stepFourErrors.corrimao_outro_texto}
                errorMessage={stepFourErrors.corrimao_outro_texto}
              />
            </>
          )}
        </View>
      )}
      <Divider height={12} />
      <Checkbox
        label="Portão"
        checked={infraInterna.portao || false}
        onChange={() => handleInfraInternaChange("portao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Escada"
        checked={infraInterna.escada || false}
        onChange={() => handleInfraInternaChange("escada")}
      />
      <Divider height={12} />
      <Checkbox
        label="Corda (Instalada)"
        checked={infraInterna.corda || false}
        onChange={() => handleInfraInternaChange("corda")}
      />
      <Divider height={12} />
      <Checkbox
        label="Iluminação artificial"
        checked={infraInterna.iluminacao_artificial || false}
        onChange={() => handleInfraInternaChange("iluminacao_artificial")}
      />
      <Divider height={12} />
      <Checkbox
        label="Ponto de ancoragem (splits)"
        checked={infraInterna.ponto_ancoragem || false}
        onChange={() => handleInfraInternaChange("ponto_ancoragem")}
      />
      <Divider height={12} />
      <Checkbox
        label="Outro (Infraestrutura)"
        checked={infraOutroEnabled}
        onChange={handleToggleInfraOutrosCheckbox}
      />
      <Divider height={12} />
      {infraOutroEnabled && (
        <>
          <Input
            placeholder="Especifique qual outra infraestrutura"
            required
            label="Qual outra infraestrutura?"
            value={infraOutrosText}
            onChangeText={handleInfraOutrosTextUpdate}
            hasError={!!stepFourErrors.infraestrutura_outro_texto}
            errorMessage={stepFourErrors.infraestrutura_outro_texto}
          />
        </>
      )}
      <Checkbox
        label="Nenhuma (Infraestrutura)"
        checked={infraInterna.nenhuma || false}
        onChange={() => handleInfraInternaChange("nenhuma")}
      />
      <Divider height={18} />

      <TextInter color={colors.white[100]} weight="medium">
        Dificuldade de progressão interna
      </TextInter>
      {/* {!!stepFourErrors.dificuldade_geral && <TextInter style={styles.errorText}>{stepFourErrors.dificuldade_geral}</TextInter>} */}
      <Divider height={12} />
      <Checkbox
        label="Teto baixo"
        checked={dificuldadeProg.teto_baixo || false}
        onChange={() => handleDificuldadeProgChange("teto_baixo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Blocos instáveis"
        checked={dificuldadeProg.blocos_instaveis || false}
        onChange={() => handleDificuldadeProgChange("blocos_instaveis")}
      />
      <Divider height={12} />
      <Checkbox
        label="Trechos escorregadios"
        checked={dificuldadeProg.trechos_escorregadios || false}
        onChange={() => handleDificuldadeProgChange("trechos_escorregadios")}
      />
      <Divider height={12} />
      <Checkbox
        label="Rastejamento"
        checked={dificuldadeProg.rastejamento || false}
        onChange={() => handleDificuldadeProgChange("rastejamento")}
      />
      <Divider height={12} />
      <Checkbox
        label="Natação"
        checked={dificuldadeProg.natacao || false}
        onChange={() => handleDificuldadeProgChange("natacao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Lances verticais"
        checked={dificuldadeProg.lances_verticais || false}
        onChange={() => handleDificuldadeProgChange("lances_verticais")}
      />
      <Divider height={12} />
      <Checkbox
        label="Passagem em curso d'água"
        checked={dificuldadeProg.passagem_curso_agua || false}
        onChange={() => handleDificuldadeProgChange("passagem_curso_agua")}
      />
      <Divider height={12} />
      <Checkbox
        label="Quebra corpo"
        checked={dificuldadeProg.quebra_corpo || false}
        onChange={() => handleDificuldadeProgChange("quebra_corpo")}
      />
      <Divider height={12} />
      <Checkbox
        label="Sifão"
        checked={dificuldadeProg.sifao || false}
        onChange={() => handleDificuldadeProgChange("sifao")}
      />
      <Divider height={12} />
      <Checkbox
        label="Cachoeira"
        checked={dificuldadeProg.cachoeira || false}
        onChange={() => handleDificuldadeProgChange("cachoeira")}
      />
      <Divider height={12} />
      <Checkbox
        label="Outro (Dificuldade Progressão)"
        checked={dificuldadeProg.outro !== undefined}
        onChange={() => handleDificuldadeProgChange("outro")}
      />
      <Divider height={12} />
      {dificuldadeProg.outro !== undefined && (
        <>
          <Input
            label="Qual outra dificuldade de progressão?"
            required
            placeholder="Especifique"
            value={dificuldadeProg.outro || ""}
            onChangeText={(text) =>
              handleUpdate(
                [
                  "caracterizacao_interna",
                  "dificuldades_progressao_interna",
                  "outro",
                ],
                text
              )
            }
            hasError={!!stepFourErrors.dificuldade_prog_outro_texto}
            errorMessage={stepFourErrors.dificuldade_prog_outro_texto}
          />
        </>
      )}
      <Checkbox
        label="Nenhuma (Dificuldade Progressão)"
        checked={dificuldadeProg.nenhuma || false}
        onChange={() => handleDificuldadeProgChange("nenhuma")}
      />
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30, // Adicionado padding para evitar que o último item cole na borda
  },
  secondLayer: {
    paddingLeft: 20, // Indentação para sub-itens
    marginTop: 5, // Pequeno espaço acima da seção aninhada
  },
  inputSpacing: {
    // Para espaçamento abaixo dos inputs "Outro"
    marginBottom: 12,
  },
  errorText: {
    // Estilo para mensagens de erro
    color: colors.error[100],
    fontSize: 12,
    marginTop: -8, // Ajuste para posicionar perto do campo
    marginBottom: 8,
    paddingLeft: 5, // Pequeno padding para alinhar com inputs/checkboxes
  },
});
