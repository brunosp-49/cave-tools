import React, { FC, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";
import {
  CaracterizacaoInterna,
  Dificuldades_progressao_interna,
  Grupo_litologico,
  Infraestrutura_interna,
  RouterProps,
} from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  updateCavidadeData,
  toggleInfraestruturaInternaOutrosEnabled,
  setInfraestruturaInternaOutrosText,
} from "../../../redux/cavitySlice";

interface StepFourProps extends RouterProps {
  validationAttempted: boolean;
}

type GrupoLitologicoKeys = keyof Omit<Grupo_litologico, "outro">;
type InfraInternaSpecificKeys = Exclude<
  keyof Infraestrutura_interna,
  "outroEnabled" | "outros" | "corrimao"
>;
type CorrimaoKeys = keyof NonNullable<Infraestrutura_interna["corrimao"]>;
type DificuldadeProgKeys = keyof Omit<Dificuldades_progressao_interna, "outro">;

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

  const caracterizacao = cavidade.caracterizacao_interna ?? {};
  const grupoLitologico = caracterizacao.grupo_litologico ?? {};
  const infraInterna = caracterizacao.infraestrutura_interna ?? {
    nenhuma: true,
  };
  const dificuldadeProg = caracterizacao.dificuldades_progressao_interna ?? {
    nenhuma: true,
  };
  const corrimao = infraInterna.corrimao ?? {};

  const infraOutroEnabled = infraInterna.outroEnabled || false;
  const infraOutrosText = infraInterna.outros || "";

  const stepFourErrors = useMemo(() => {
    if (!validationAttempted) return {};
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    const gl = grupoLitologico;
    if (gl.outro !== undefined && !isFieldFilled(gl.outro)) {
      errors.grupo_litologico_outro = errorMsgRequired;
    }

    // "Desenvolvimento predominante" is now optional, so no error here
    // if (!caracterizacao.desenvolvimento_predominante) {
    //   errors.desenvolvimento_predominante = errorMsgRequired;
    // }

    if (
      caracterizacao.depredacao_localizada &&
      !isFieldFilled(caracterizacao.descricao_depredacao_localizada)
    ) {
      errors.descricao_depredacao_localizada = errorMsgRequired;
    }
    if (
      caracterizacao.depredacao_intensa &&
      !isFieldFilled(caracterizacao.descricao_depredacao_intensa)
    ) {
      errors.descricao_depredacao_intensa = errorMsgRequired;
    }

    if (infraInterna.corrimao) {
      const corrimaoData = infraInterna.corrimao;
      const algumaOpcaoCorrimaoSelecionada =
        corrimaoData.ferro ||
        corrimaoData.madeira ||
        corrimaoData.corda ||
        (corrimaoData.outro !== undefined && isFieldFilled(corrimaoData.outro));
      if (!algumaOpcaoCorrimaoSelecionada) {
        errors.corrimao_tipo =
          "Selecione pelo menos um tipo de corrimão ou desmarque 'Corrimão'.";
      }
      if (
        corrimaoData.outro !== undefined &&
        !isFieldFilled(corrimaoData.outro)
      ) {
        errors.corrimao_outro_texto = errorMsgRequired;
      }
    }

    if (infraInterna.outroEnabled && !isFieldFilled(infraInterna.outros)) {
      errors.infraestrutura_outro_texto = errorMsgRequired;
    }
    if (!infraInterna.nenhuma) {
      const corrimaoSelected =
        infraInterna.corrimao &&
        (infraInterna.corrimao.ferro ||
          infraInterna.corrimao.madeira ||
          infraInterna.corrimao.corda ||
          isFieldFilled(infraInterna.corrimao.outro));
      const otherInfraSelected =
        infraInterna.passarela ||
        infraInterna.portao ||
        infraInterna.escada ||
        infraInterna.corda ||
        infraInterna.iluminacao_artificial ||
        infraInterna.ponto_ancoragem;
      const outroInfraFilled =
        infraInterna.outroEnabled && isFieldFilled(infraInterna.outros);
      if (!corrimaoSelected && !otherInfraSelected && !outroInfraFilled) {
        errors.infraestrutura_geral =
          "Se 'Nenhuma' não está marcada, selecione ao menos uma infraestrutura.";
      }
    }

    const dp = dificuldadeProg;
    if (dp.outro !== undefined && !isFieldFilled(dp.outro)) {
      errors.dificuldade_prog_outro_texto = errorMsgRequired;
    }
    if (!dp.nenhuma) {
      const anySpecificDifProg =
        dp.teto_baixo ||
        dp.blocos_instaveis ||
        dp.trechos_escorregadios ||
        dp.rastejamento ||
        dp.natacao ||
        dp.lances_verticais ||
        dp.passagem_curso_agua ||
        dp.quebra_corpo ||
        dp.sifao ||
        dp.cachoeira;
      const outroDifProgFilled = isFieldFilled(dp.outro);
      if (!anySpecificDifProg && !outroDifProgFilled) {
        errors.dificuldade_geral =
          "Se 'Nenhuma' não está marcada, selecione ao menos uma dificuldade ou preencha 'Outro'.";
      }
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
      const path = ["caracterizacao_interna", "grupo_litologico", fieldName];
      handleUpdate(path, !grupoLitologico[fieldName]);
    },
    [grupoLitologico, handleUpdate]
  );

  const handleGrupoLitologicoOutroToggle = useCallback(() => {
    const path = ["caracterizacao_interna", "grupo_litologico", "outro"];
    const newValue = grupoLitologico.outro === undefined ? "" : undefined;
    handleUpdate(path, newValue);
  }, [grupoLitologico, handleUpdate]);

  const handleDesenvolvimentoPredominanteChange = useCallback(
    (value: string) => {
      handleUpdate(
        ["caracterizacao_interna", "desenvolvimento_predominante"],
        value
      );
    },
    [handleUpdate]
  );

  const handleDepredacaoLocalizadaToggle = useCallback(() => {
    const newValue = !caracterizacao.depredacao_localizada;
    handleUpdate(["caracterizacao_interna", "depredacao_localizada"], newValue);
    if (!newValue) {
      handleUpdate(
        ["caracterizacao_interna", "descricao_depredacao_localizada"],
        undefined
      );
    } else if (caracterizacao.descricao_depredacao_localizada === undefined) {
      handleUpdate(
        ["caracterizacao_interna", "descricao_depredacao_localizada"],
        ""
      );
    }
  }, [caracterizacao, handleUpdate]);

  const handleDepredacaoIntensaToggle = useCallback(() => {
    const newValue = !caracterizacao.depredacao_intensa;
    handleUpdate(["caracterizacao_interna", "depredacao_intensa"], newValue);
    if (!newValue) {
      handleUpdate(
        ["caracterizacao_interna", "descricao_depredacao_intensa"],
        undefined
      );
    } else if (caracterizacao.descricao_depredacao_intensa === undefined) {
      handleUpdate(
        ["caracterizacao_interna", "descricao_depredacao_intensa"],
        ""
      );
    }
  }, [caracterizacao, handleUpdate]);

  const handleInfraInternaChange = useCallback(
    (fieldName: InfraInternaSpecificKeys | "corrimao" | "nenhuma") => {
      const basePath = ["caracterizacao_interna", "infraestrutura_interna"];
      const path = [...basePath, fieldName];
      const currentFieldValue = (infraInterna as any)[fieldName];
      let newValue;

      if (fieldName === "corrimao") {
        newValue = infraInterna.corrimao
          ? undefined
          : { ferro: false, madeira: false, corda: false, outro: undefined };
      } else {
        newValue = !currentFieldValue;
      }
      handleUpdate(path, newValue);

      if (fieldName === "nenhuma" && newValue === true) {
        Object.keys(infraInterna).forEach((key) => {
          if (key !== "nenhuma") {
            if (key === "corrimao") handleUpdate([...basePath, key], undefined);
            else if (key === "outroEnabled")
              handleUpdate([...basePath, key], false);
            else if (key === "outros")
              handleUpdate([...basePath, key], undefined);
            else if (typeof (infraInterna as any)[key] === "boolean")
              handleUpdate([...basePath, key], false);
          }
        });
      } else if (
        fieldName !== "nenhuma" &&
        newValue === true &&
        infraInterna.nenhuma
      ) {
        handleUpdate([...basePath, "nenhuma"], false);
      }
    },
    [infraInterna, handleUpdate, dispatch]
  );

  const handleToggleInfraOutrosCheckbox = useCallback(() => {
    dispatch(toggleInfraestruturaInternaOutrosEnabled());
    if (!infraInterna.outroEnabled && infraInterna.nenhuma) {
      handleUpdate(
        ["caracterizacao_interna", "infraestrutura_interna", "nenhuma"],
        false
      );
    }
  }, [dispatch, infraInterna.nenhuma, infraInterna.outroEnabled, handleUpdate]);

  const handleInfraOutrosTextUpdate = (text: string) => {
    dispatch(setInfraestruturaInternaOutrosText(text));
  };

  const handleDificuldadeProgChange = useCallback(
    (fieldName: DificuldadeProgKeys | "outro" | "nenhuma") => {
      const basePath = [
        "caracterizacao_interna",
        "dificuldades_progressao_interna",
      ];
      const path = [...basePath, fieldName];
      const currentFieldValue = (dificuldadeProg as any)[fieldName];
      let newValue;

      if (fieldName === "outro") {
        newValue = dificuldadeProg.outro === undefined ? "" : undefined;
      } else {
        newValue = !currentFieldValue;
      }
      handleUpdate(path, newValue);

      if (fieldName === "nenhuma" && newValue === true) {
        Object.keys(dificuldadeProg).forEach((key) => {
          if (key !== "nenhuma") {
            if (key === "outro") handleUpdate([...basePath, key], undefined);
            else if (typeof (dificuldadeProg as any)[key] === "boolean")
              handleUpdate([...basePath, key], false);
          }
        });
      } else if (
        fieldName !== "nenhuma" &&
        newValue === true &&
        dificuldadeProg.nenhuma
      ) {
        handleUpdate([...basePath, "nenhuma"], false);
      }
    },
    [dificuldadeProg, handleUpdate]
  );

  const handleCorrimaoChange = useCallback(
    (fieldName: CorrimaoKeys) => {
      const basePath = [
        "caracterizacao_interna",
        "infraestrutura_interna",
        "corrimao",
      ];
      const path = [...basePath, fieldName];
      const currentCorrimaoSubValue = corrimao[fieldName];

      if (fieldName === "outro") {
        const newValue = corrimao.outro === undefined ? "" : undefined;
        handleUpdate(path, newValue);
      } else {
        handleUpdate(path, !currentCorrimaoSubValue);
      }
      if (!currentCorrimaoSubValue && infraInterna.nenhuma) {
        handleUpdate(
          ["caracterizacao_interna", "infraestrutura_interna", "nenhuma"],
          false
        );
      }
    },
    [corrimao, infraInterna.nenhuma, handleUpdate]
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
        onChange={handleGrupoLitologicoOutroToggle}
      />
      {grupoLitologico.outro !== undefined && (
        <>
          <Divider height={12} />
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
        </>
      )}
      <Divider height={18} />

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
      {/* Removed mandatory error for desenvolvimento_predominante */}
      {/* {!!stepFourErrors.desenvolvimento_predominante && (
        <TextInter style={[styles.errorText, { marginTop: 2 }]}>
          {stepFourErrors.desenvolvimento_predominante}
        </TextInter>
      )} */}
      <Divider height={18} />

      <TextInter color={colors.white[100]} weight="medium">
        Estado de conservação
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Conservada"
        checked={
          !caracterizacao.depredacao_localizada &&
          !caracterizacao.depredacao_intensa
        }
        onChange={() => {
          if (caracterizacao.depredacao_localizada)
            handleDepredacaoLocalizadaToggle();
          if (caracterizacao.depredacao_intensa)
            handleDepredacaoIntensaToggle();
        }}
      />
      <Divider height={12} />
      <Checkbox
        label="Depredação localizada"
        checked={caracterizacao.depredacao_localizada || false}
        onChange={handleDepredacaoLocalizadaToggle}
      />
      {caracterizacao.depredacao_localizada && (
        <>
          <Divider height={12} />
          <Input
            label="Descrição da Depredação Localizada"
            required
            placeholder="Detalhes da depredação localizada"
            value={caracterizacao.descricao_depredacao_localizada || ""}
            onChangeText={(text) =>
              handleUpdate(
                ["caracterizacao_interna", "descricao_depredacao_localizada"],
                text
              )
            }
            hasError={!!stepFourErrors.descricao_depredacao_localizada}
            errorMessage={stepFourErrors.descricao_depredacao_localizada}
          />
        </>
      )}
      <Divider height={12} />
      <Checkbox
        label="Depredação intensa"
        checked={caracterizacao.depredacao_intensa || false}
        onChange={handleDepredacaoIntensaToggle}
      />
      {caracterizacao.depredacao_intensa && (
        <>
          <Divider height={12} />
          <Input
            label="Descrição da Depredação Intensa"
            required
            placeholder="Detalhes da depredação intensa"
            value={caracterizacao.descricao_depredacao_intensa || ""}
            onChangeText={(text) =>
              handleUpdate(
                ["caracterizacao_interna", "descricao_depredacao_intensa"],
                text
              )
            }
            hasError={!!stepFourErrors.descricao_depredacao_intensa}
            errorMessage={stepFourErrors.descricao_depredacao_intensa}
          />
        </>
      )}
      <Divider height={18} />

      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura interna
      </TextInter>
      {!!stepFourErrors.infraestrutura_geral && (
        <TextInter style={styles.errorText}>
          {stepFourErrors.infraestrutura_geral}
        </TextInter>
      )}
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
            <TextInter style={styles.errorText}>
              {stepFourErrors.corrimao_tipo}
            </TextInter>
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
      {infraOutroEnabled && (
        <>
          <Divider height={12} />
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
      <Divider height={12} />
      <Checkbox
        label="Nenhuma (Infraestrutura)"
        checked={infraInterna.nenhuma || false}
        onChange={() => handleInfraInternaChange("nenhuma")}
      />
      <Divider height={18} />

      <TextInter color={colors.white[100]} weight="medium">
        Dificuldade de progressão interna
      </TextInter>
      {!!stepFourErrors.dificuldade_geral && (
        <TextInter style={styles.errorText}>
          {stepFourErrors.dificuldade_geral}
        </TextInter>
      )}
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
      {dificuldadeProg.outro !== undefined && (
        <>
          <Divider height={12} />
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
      <Divider height={12} />
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
  container: { flex: 1, paddingBottom: 30 },
  secondLayer: { paddingLeft: 20, marginTop: 5 },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingLeft: 5,
  },
});