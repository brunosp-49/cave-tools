import React, { FC, useCallback } from "react";
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
} from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateCavidadeData } from "../../../redux/cavitySlice";

type GrupoLitologicoKeys = keyof Grupo_litologico;
type InfraInternaKeys = keyof Infraestrutura_interna;
type CorrimaoKeys = keyof NonNullable<Infraestrutura_interna["corrimao"]>;
type DificuldadeProgKeys = keyof Dificuldades_progressao_interna;

// Define possible values for Estado de Conservacao
type EstadoConservacaoValue =
  | "Conservada"
  | "Depredação localizada"
  | "Depredação intensa";

export const StepFour = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const caracterizacao: Partial<typeof cavidade.caracterizacao_interna> =
    cavidade.caracterizacao_interna ?? {};
  const grupoLitologico = caracterizacao.grupo_litologico ?? {};
  const infraInterna = caracterizacao.infraestrutura_interna ?? {};
  const dificuldadeProg = caracterizacao.dificuldades_progressao_interna ?? {};
  const corrimao = infraInterna.corrimao ?? {};

  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleGrupoLitologicoChange = useCallback(
    (fieldName: GrupoLitologicoKeys) => {
      const path = ["caracterizacao_interna", "grupo_litologico", fieldName];
      const currentValue = grupoLitologico[fieldName] || false;
      const newValue = !currentValue;
      handleUpdate(path, newValue);
      if (fieldName === "outro" && !newValue) {
        handleUpdate(
          ["caracterizacao_interna", "grupo_litologico", "outro"],
          ""
        );
      }
    },
    [dispatch, grupoLitologico]
  );

  const handleDesenvolvimentoPredominanteChange = useCallback(
    (value: string) => {
      handleUpdate(
        ["caracterizacao_interna", "desenvolvimento_predominante"],
        value
      );
    },
    [dispatch]
  );

  const handleEstadoConservacaoChange = useCallback(
    (value: EstadoConservacaoValue | string) => {
      handleUpdate(["caracterizacao_interna", "estado_conservacao"], value);
    },
    [dispatch]
  );

  const handleInfraInternaChange = useCallback(
    (fieldName: InfraInternaKeys) => {
      const currentState = infraInterna || {}; // Pega o estado atual
      const currentValue = currentState[fieldName];
      const isTurningOn = !currentValue; // Verifica se a ação é para LIGAR o campo

      // --- 1. Realiza a atualização PRINCIPAL para o campo clicado ---
      // (Esta parte é a sua lógica original)
      const basePath = ["caracterizacao_interna", "infraestrutura_interna"];
      const path = [...basePath, fieldName];
      let primaryValue: any;

      if (fieldName === "corrimao") {
        primaryValue = isTurningOn ? {} : undefined; // Valor para corrimao (objeto ou undefined)
      } else {
        primaryValue = isTurningOn; // Valor para outros (true ou false)
      }
      // Chama o handleUpdate original para o campo clicado
      handleUpdate(path, primaryValue);

      // --- 2. Realiza atualizações SECUNDÁRIAS para exclusividade mútua ---

      if (fieldName === "nenhuma" && isTurningOn) {
        // Se o campo clicado foi 'nenhuma' E ele foi LIGADO:
        // Precisamos desligar todos os outros campos específicos.

        // **IMPORTANTE:** Liste TODAS as chaves dos itens específicos aqui!
        const specificItemKeys: InfraInternaKeys[] = [
          "passarela",
          "corrimao",
          "escada",
          "portao",
          "escada",
          "corda",
          "iluminacao_artificial",
          "ponto_ancoragem",
        ];

        specificItemKeys.forEach((key) => {
          const keyPath = [...basePath, key];
          const offValue = key === "corrimao" ? undefined : false;
          if (currentState[key] !== offValue) {
            handleUpdate(keyPath, offValue);
          }
        });
      } else if (fieldName !== "nenhuma" && isTurningOn) {
        const nenhumaPath = [...basePath, "nenhuma"];
        if (currentState["nenhuma"] !== false) {
          handleUpdate(nenhumaPath, false);
        }
      }
    },
    [infraInterna, handleUpdate]
  );

  const handleDificuldadeProgChange = useCallback(
    (fieldName: DificuldadeProgKeys) => {
      const currentState = dificuldadeProg || {};
      const currentValue = currentState[fieldName] || false;
      const isTurningOn = !currentValue;

      const basePath = [
        "caracterizacao_interna",
        "dificuldades_progressao_interna",
      ];
      const path = [...basePath, fieldName];
      const primaryValue = isTurningOn;

      handleUpdate(path, primaryValue);
      if (fieldName === "outro" && !isTurningOn) {
        handleUpdate(path, "");
      }

      const nenhumaKey: DificuldadeProgKeys = "nenhuma";

      const specificDifficultyKeys: DificuldadeProgKeys[] = [
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

      if (fieldName === nenhumaKey && isTurningOn) {
        specificDifficultyKeys.forEach((key) => {
          const keyPath = [...basePath, key];
          let offValue: any = false;

          if (key === "outro") {
            offValue = "";
          }

          if (currentState[key] !== offValue) {
            handleUpdate(keyPath, offValue);
          }
        });
      } else if (specificDifficultyKeys.includes(fieldName) && isTurningOn) {
        const nenhumaPath = [...basePath, nenhumaKey];
        if (currentState[nenhumaKey] !== false) {
          handleUpdate(nenhumaPath, false);
        }
      }
    },
    [dificuldadeProg, handleUpdate]
  );

  const handleCorrimaoChange = useCallback(
    (fieldName: CorrimaoKeys) => {
      if (infraInterna.corrimao) {
        const path = [
          "caracterizacao_interna",
          "infraestrutura_interna",
          "corrimao",
          fieldName,
        ];
        const currentValue = corrimao[fieldName] || false;
        const newValue = !currentValue;
        handleUpdate(path, newValue);
        if (fieldName === "outro" && !newValue) {
          handleUpdate(
            [
              "caracterizacao_interna",
              "infraestrutura_interna",
              "corrimao",
              "outro",
            ],
            ""
          );
        }
      }
    },
    [dispatch, infraInterna.corrimao, corrimao]
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
        label="Outro"
        checked={!!grupoLitologico.outro}
        onChange={() => handleGrupoLitologicoChange("outro")}
      />
      <Divider height={12} />
      {!!grupoLitologico.outro && (
        <Input
          placeholder="Especifique o outro grupo"
          label="Qual outro grupo?"
          value={grupoLitologico.outro || ""}
          onChangeText={(text) =>
            handleUpdate(
              ["caracterizacao_interna", "grupo_litologico", "outro"],
              text
            )
          }
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
      {caracterizacao.estado_conservacao &&
        caracterizacao.estado_conservacao !== "Conservada" && (
          <>
            <Divider height={12} />
            <Input
              label="Detalhes da Depredação"
              placeholder="Reportar Condição / Detalhes"
              // Assuming a 'estado_conservacao_detalhes' field exists or needs adding
              value={caracterizacao.estado_conservacao || ""}
              onChangeText={(text) =>
                handleUpdate(
                  ["caracterizacao_interna", "estado_conservacao"],
                  text
                )
              }
            />
          </>
        )}
      <Divider height={18} />
      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura interna
      </TextInter>
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
            label="Corda"
            checked={corrimao.corda || false}
            onChange={() => handleCorrimaoChange("corda")}
          />
          <Divider height={12} />
          <Checkbox
            label="Outro"
            checked={!!corrimao.outro}
            onChange={() => handleCorrimaoChange("outro")}
          />
          {!!corrimao.outro && (
            <>
              <Divider height={12} />
              <Input
                label="Qual outro corrimão?"
                placeholder="Especifique"
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
        label="Nenhuma"
        checked={infraInterna.nenhuma || false}
        onChange={() => handleInfraInternaChange("nenhuma")}
      />
      <Divider height={18} />
      <TextInter color={colors.white[100]} weight="medium">
        Dificuldade de progressão interna
      </TextInter>
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
        label="Outro"
        checked={!!dificuldadeProg.outro}
        onChange={() => handleDificuldadeProgChange("outro")}
      />
      <Divider height={12} />
      {!!dificuldadeProg.outro && (
        <>
          <Input
            label="Qual outra dificuldade?"
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
          />
        </>
      )}
      <Checkbox
        label="Nenhuma"
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
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
  secondLayer: {
    paddingLeft: 30,
    marginTop: 10,
  },
});
