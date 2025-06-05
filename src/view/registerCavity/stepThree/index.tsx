// src/view/registerCavity/components/StepThree.tsx

import React, { FC, useCallback, useState, useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Area_protegida,
  Infraestrutura_acesso,
  Uso_cavidade,
  SelectOption, 
  RouterProps,
  Cavidade, // Import RouterProps
} from "../../../types"; 
import { colors } from "../../../assets/colors"; 
import { Divider } from "../../../components/divider"; 
import TextInter from "../../../components/textInter"; 
import { Checkbox } from "../../../components/checkbox"; 
import { Input } from "../../../components/input"; 
import RadioButtonGroup from "../../../components/radio"; 
import { Select } from "../../../components/select"; 
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store"; 
import {
  setUsoCavidadeOutroText,
  toggleUsoCavidadeOutroEnabled,
  updateCavidadeData,
} from "../../../redux/cavitySlice"; 

// Interface para as props do StepThree, estendendo RouterProps e adicionando validationAttempted
// Se StepComponentProps já está definido em um arquivo de tipos central, importe-o de lá.
interface StepThreeProps extends RouterProps {
  validationAttempted: boolean;
}

// Type aliases for clarity
type UsoCavidadeKeys = keyof Uso_cavidade;
type InfraAcessoKeys = keyof Infraestrutura_acesso;
type AreaProtegidaKeys = keyof Omit<Area_protegida, "nao_determinado">;
type AreaProtegidaSubKeys = keyof NonNullable<Area_protegida["federal"]>;


const jurisdictionOptions: SelectOption<string>[] = [
  { id: "nenhuma", value: "Nenhuma / Não se aplica", label: "Nenhuma / Não se aplica" },
  { id: "federal", value: "Federal", label: "Federal" },
  { id: "estadual", value: "Estadual", label: "Estadual" },
  { id: "municipal", value: "Municipal", label: "Municipal" },
];

// Helper function (pode ser movida para um arquivo de utilitários)
const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

export const StepThree: FC<StepThreeProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const aspectos = useMemo(
    () =>
      cavidade.aspectos_socioambientais ??
      ({} as NonNullable<Cavidade["aspectos_socioambientais"]>), // Garante que não é undefined
    [cavidade.aspectos_socioambientais]
  );
  const usoCavidade: Partial<Uso_cavidade> = useMemo(
    () => aspectos.uso_cavidade ?? {},
    [aspectos.uso_cavidade]
  );
  const comunidadeEnvolvida = useMemo(
    () => aspectos.comunidade_envolvida ?? { envolvida: false, descricao: "" }, // Garante descricao
    [aspectos.comunidade_envolvida]
  );
  const areaProtegida: Partial<Area_protegida> = useMemo(
    () => aspectos.area_protegida ?? { nao_determinado: true }, // Garante nao_determinado
    [aspectos.area_protegida]
  );
  const infraAcesso: Partial<Infraestrutura_acesso> = useMemo(
    () => aspectos.infraestrutura_acesso ?? { nenhuma: true }, // Garante nenhuma
    [aspectos.infraestrutura_acesso]
  );

  const getInitialJurisdictionId = useCallback((): string => {
    if (areaProtegida.federal) return "federal";
    if (areaProtegida.estadual) return "estadual";
    if (areaProtegida.municipal) return "municipal";
    if (areaProtegida.nao_determinado) return "nenhuma"; // Considera nao_determinado como "nenhuma" para o select
    return "nenhuma"; // Default
  }, [areaProtegida]);

  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<string>(
    getInitialJurisdictionId()
  );
  
  // Atualiza selectedJurisdictionId se o estado Redux mudar (ex: ao carregar dados de edição)
  useEffect(() => {
    setSelectedJurisdictionId(getInitialJurisdictionId());
  }, [getInitialJurisdictionId]);


  const selectedJurisdictionDisplayLabel = useMemo(() => {
    return (
      jurisdictionOptions.find((opt) => opt.id === selectedJurisdictionId)
        ?.label || ""
    );
  }, [selectedJurisdictionId]);

  // Lógica de Erros Específicos para StepThree
  const stepThreeErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    // Validação para Comunidade Envolvida
    if (comunidadeEnvolvida.envolvida && !isFieldFilled(comunidadeEnvolvida.descricao)) {
      errors.comunidade_descricao = errorMsgRequired;
    }

    

    // Validação para Área Protegida
    const currentJurisdictionDataForValidation = 
        selectedJurisdictionId && selectedJurisdictionId !== "nenhuma"
        ? areaProtegida[selectedJurisdictionId as AreaProtegidaKeys]
        : null;

    if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
        if (!isFieldFilled(currentJurisdictionDataForValidation?.nome)) {
            errors.area_protegida_nome = errorMsgRequired;
        }
        // Opcional: validar se a zona foi selecionada se uma jurisdição está ativa
        // if (!currentJurisdictionDataForValidation?.zona) {
        //   errors.area_protegida_zona = "Selecione a zona.";
        // }
    }
    
    // Validação para Uso da Cavidade (se "Outro" está habilitado, o texto é obrigatório)
    if (usoCavidade.outroEnabled && !isFieldFilled(usoCavidade.outro)) {
        errors.uso_cavidade_outro = errorMsgRequired;
    }

    // Validação para Infraestrutura de Acesso (se nenhuma opção marcada, pode ser um erro)
    // A lógica atual de handleInfraAcessoChange já força "nenhuma" se outras são desmarcadas
    // e desmarca "nenhuma" se outra é marcada. Então, um estado inválido seria difícil de alcançar
    // a menos que o estado inicial seja inválido.
    // Se for necessário validar que pelo menos uma opção (ou "nenhuma") está selecionada:
    const infraKeys = Object.keys(infraAcesso) as Array<keyof Infraestrutura_acesso>;
    const algumaInfraSelecionada = infraKeys.some(key => infraAcesso[key] === true);
    if (!algumaInfraSelecionada && infraKeys.length > 0) { // Se há chaves mas nenhuma é true
        // errors.infraestrutura_acesso = "Selecione uma opção de infraestrutura ou 'Nenhuma'.";
    }


    return errors;
  }, [validationAttempted, comunidadeEnvolvida, selectedJurisdictionId, areaProtegida, usoCavidade]);


  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handleUsoCavidadeToggle = useCallback(
    (fieldName: Exclude<UsoCavidadeKeys, "outro" | "outroEnabled">) => {
      const path = ["aspectos_socioambientais", "uso_cavidade", fieldName];
      const currentValue = usoCavidade[fieldName] || false;
      handleUpdate(path, !currentValue);

      // Se desmarcar "Turístico", desmarcar também os sub-itens
      if (fieldName === "turistico" && currentValue) { // Se estava true e agora será false
        handleUpdate(["aspectos_socioambientais", "uso_cavidade", "incipiente"], false);
        handleUpdate(["aspectos_socioambientais", "uso_cavidade", "massa"], false);
        handleUpdate(["aspectos_socioambientais", "uso_cavidade", "aventura"], false);
      }
    },
    [handleUpdate, usoCavidade]
  );

  const handleToggleUsoOutro = useCallback(() => {
    dispatch(toggleUsoCavidadeOutroEnabled());
  }, [dispatch]);

  const handleSetUsoOutroText = useCallback(
    (text: string) => {
      dispatch(setUsoCavidadeOutroText(text || undefined));
    },
    [dispatch]
  );

  const handleInfraAcessoChange = useCallback(
    (fieldName: InfraAcessoKeys) => {
      const currentState = infraAcesso; // Já tem fallback no useMemo
      const currentValue = currentState[fieldName] || false;
      const isTurningOn = !currentValue;

      const basePath = ["aspectos_socioambientais", "infraestrutura_acesso"];
      const path = [...basePath, fieldName];
      handleUpdate(path, isTurningOn);

      const nenhumaKey: InfraAcessoKeys = "nenhuma";
      const specificInfraKeys: Exclude<InfraAcessoKeys, "nenhuma">[] = [
        "receptivo", "condutor_para_visitantes",
        "lanchonete_ou_restaurante", "pousada_ou_hotel",
      ];

      if (fieldName === nenhumaKey && isTurningOn) {
        specificInfraKeys.forEach((key) => {
          if (currentState[key] === true) { // Só atualiza se estava true
            handleUpdate([...basePath, key], false);
          }
        });
      } else if (specificInfraKeys.includes(fieldName as any) && isTurningOn) {
        if (currentState[nenhumaKey] === true) { // Só atualiza se estava true
          handleUpdate([...basePath, nenhumaKey], false);
        }
      }
    },
    [infraAcesso, handleUpdate]
  );

  const handleComunidadeEnvolvidaChange = useCallback(
    (value: string) => {
      const isEnvolvida = value === "sim";
      handleUpdate(
        ["aspectos_socioambientais", "comunidade_envolvida", "envolvida"],
        isEnvolvida
      );
      if (!isEnvolvida) {
        handleUpdate(
          ["aspectos_socioambientais", "comunidade_envolvida", "descricao"],
          "" // Limpa descrição se não envolvida
        );
      } else if (comunidadeEnvolvida.descricao === undefined) { // Se envolvida e descrição é undefined, inicializa
          handleUpdate(
            ["aspectos_socioambientais", "comunidade_envolvida", "descricao"],
            ""
          );
      }
    },
    [handleUpdate, comunidadeEnvolvida.descricao] // Adicionado comunidadeEnvolvida.descricao
  );

  const handleJurisdictionChange = useCallback(
    (selectedOption: SelectOption<string>) => {
      const selectedId = String(selectedOption.id); 
      setSelectedJurisdictionId(selectedId);

      const basePath = ["aspectos_socioambientais", "area_protegida"];
      
      // Limpa todas as jurisdições específicas e seta 'nao_determinado'
      dispatch(updateCavidadeData({ path: [...basePath, "federal"], value: undefined }));
      dispatch(updateCavidadeData({ path: [...basePath, "estadual"], value: undefined }));
      dispatch(updateCavidadeData({ path: [...basePath, "municipal"], value: undefined }));
      
      if (selectedId === "nenhuma") {
        dispatch(updateCavidadeData({ path: [...basePath, "nao_determinado"], value: true }));
      } else {
        dispatch(updateCavidadeData({ path: [...basePath, "nao_determinado"], value: false }));
        // Inicializa a jurisdição selecionada com um objeto vazio se não existir
        // Isso garante que os campos 'nome' e 'zona' possam ser definidos.
        // Acessa o estado atual de areaProtegida para verificar se já existe.
        const currentAreaProtegidaState = cavidade.aspectos_socioambientais?.area_protegida;
        if (!currentAreaProtegidaState || !currentAreaProtegidaState[selectedId as AreaProtegidaKeys]) {
            dispatch(updateCavidadeData({ path: [...basePath, selectedId], value: { nome: "", zona: undefined } }));
        }
      }
    },
    [dispatch, cavidade.aspectos_socioambientais?.area_protegida]
  );

  const handleAreaProtegidaSubFieldChange = useCallback(
    (fieldName: AreaProtegidaSubKeys, value: any) => {
      if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
        const path = ["aspectos_socioambientais", "area_protegida", selectedJurisdictionId, fieldName];
        handleUpdate(path, value);
      }
    },
    [selectedJurisdictionId, handleUpdate]
  );

  const handleZoneChange = useCallback(
    (zoneValue: "interior" | "zona_de_amortecimento") => {
      if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
        const currentJurisdictionData = areaProtegida[selectedJurisdictionId as AreaProtegidaKeys];
        const currentZone = currentJurisdictionData?.zona;
        const path = ["aspectos_socioambientais", "area_protegida", selectedJurisdictionId, "zona"];
        handleUpdate(path, currentZone === zoneValue ? undefined : zoneValue);
      }
    },
    [selectedJurisdictionId, areaProtegida, handleUpdate]
  );

  const currentSelectedJurisdictionData = useMemo(() => {
    if (selectedJurisdictionId && selectedJurisdictionId !== "nenhuma") {
      return areaProtegida[selectedJurisdictionId as AreaProtegidaKeys];
    }
    return null;
  }, [selectedJurisdictionId, areaProtegida]);

  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Aspectos socioambientais
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Uso da cavidade
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Religioso" checked={!!usoCavidade.religioso} onChange={() => handleUsoCavidadeToggle("religioso")} />
      <Divider height={12} />
      <Checkbox label="Científico/Cultural" checked={!!usoCavidade.cientifico_cultural} onChange={() => handleUsoCavidadeToggle("cientifico_cultural")} />
      <Divider height={12} />
      <Checkbox label="Social" checked={!!usoCavidade.social} onChange={() => handleUsoCavidadeToggle("social")} />
      <Divider height={12} />
      <Checkbox label="Minerário" checked={!!usoCavidade.minerario} onChange={() => handleUsoCavidadeToggle("minerario")} />
      <Divider height={12} />
      <Checkbox label="Pedagógico" checked={!!usoCavidade.pedagogico} onChange={() => handleUsoCavidadeToggle("pedagogico")} />
      <Divider height={12} />
      <Checkbox label="Esportivo" checked={!!usoCavidade.esportivo} onChange={() => handleUsoCavidadeToggle("esportivo")} />
      <Divider height={12} />
      <Checkbox label="Turístico" checked={!!usoCavidade.turistico} onChange={() => handleUsoCavidadeToggle("turistico")} />
      {usoCavidade.turistico && (
        <View style={styles.subCheckboxContainer}>
          <Checkbox label="Incipiente" checked={!!usoCavidade.incipiente} onChange={() => handleUsoCavidadeToggle("incipiente")} />
          <Divider height={12} />
          <Checkbox label="Massa" checked={!!usoCavidade.massa} onChange={() => handleUsoCavidadeToggle("massa")} />
          <Divider height={12} />
          <Checkbox label="Aventura" checked={!!usoCavidade.aventura} onChange={() => handleUsoCavidadeToggle("aventura")} />
        </View>
      )}
      <Divider height={12} />
      <Checkbox label="Mergulho" checked={!!usoCavidade.mergulho} onChange={() => handleUsoCavidadeToggle("mergulho")} />
      <Divider height={12} />
      <Checkbox label="Rapel" checked={!!usoCavidade.rapel} onChange={() => handleUsoCavidadeToggle("rapel")} />
      <Divider height={12} />
      <Checkbox label="Outro" checked={usoCavidade.outroEnabled ?? false} onChange={handleToggleUsoOutro} />
      <Divider height={12} />
      {usoCavidade.outroEnabled && (
        <Input
          placeholder="Especifique aqui"
          label="Qual outro uso?"
          value={usoCavidade.outro || ""}
          onChangeText={handleSetUsoOutroText}
          hasError={!!stepThreeErrors.uso_cavidade_outro}
          errorMessage={stepThreeErrors.uso_cavidade_outro}
          required // Indica visualmente que é obrigatório se "Outro" estiver marcado
        />
      )}
      <Divider />

      <TextInter color={colors.white[100]} weight="medium">Comunidade envolvida</TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        options={[
          { label: "Sim", value: "sim", id: "1" },
          { label: "Não", value: "não", id: "2" },
        ]}
        onValueChange={handleComunidadeEnvolvidaChange}
        value={comunidadeEnvolvida.envolvida ? "sim" : "não"}
      />
      {comunidadeEnvolvida.envolvida && (
        <>
          <Divider height={12} />
          <Input
            label="De que forma?"
            placeholder="Especifique aqui"
            value={comunidadeEnvolvida.descricao || ""}
            onChangeText={(text) =>
              handleUpdate( ["aspectos_socioambientais", "comunidade_envolvida", "descricao"], text)
            }
            hasError={!!stepThreeErrors.comunidade_descricao}
            errorMessage={stepThreeErrors.comunidade_descricao}
            required
          />
        </>
      )}
      <Divider />

      <Select
        value={selectedJurisdictionDisplayLabel}
        onChangeText={(chosen) => {
          const selectedOption: SelectOption<string> = {
            id: String(chosen.id), // Garante que id é string
            value: String(chosen.value), // Garante que value é string
            label: jurisdictionOptions.find((opt) => opt.id === chosen.id)?.label || String(chosen.value),
          };
          handleJurisdictionChange(selectedOption);
        }}
        label="Áreas Protegida - Jurisdição"
        optionsList={jurisdictionOptions}
        placeholder="Selecione uma opção"
      />

      {selectedJurisdictionId && selectedJurisdictionId !== "nenhuma" && (
        <>
          <Divider height={12} />
          <Input
            label="Nome da Área Protegida"
            placeholder="Digite o nome"
            value={currentSelectedJurisdictionData?.nome || ""}
            onChangeText={(text) => handleAreaProtegidaSubFieldChange("nome", text)}
            required
            hasError={!!stepThreeErrors.area_protegida_nome}
            errorMessage={stepThreeErrors.area_protegida_nome}
          />
          <Divider height={12} />
          <TextInter color={colors.white[100]} weight="medium">Zona</TextInter>
          {/* Opcional: Adicionar mensagem de erro para zona se for obrigatória */}
          {/* {!!stepThreeErrors.area_protegida_zona && (
            <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
              {stepThreeErrors.area_protegida_zona}
            </TextInter>
          )} */}
          <Divider height={6} />
          <Checkbox label="Interior" checked={currentSelectedJurisdictionData?.zona === "interior"} onChange={() => handleZoneChange("interior")} />
          <Divider height={12} />
          <Checkbox label="Zona de Amortecimento" checked={currentSelectedJurisdictionData?.zona === "zona_de_amortecimento"} onChange={() => handleZoneChange("zona_de_amortecimento")} />
        </>
      )}
      {areaProtegida.nao_determinado && selectedJurisdictionId === "nenhuma" && ( // Mostrar apenas se "nenhuma" estiver explicitamente selecionada
        <TextInter style={styles.italicText}>
          Não foi possível determinar a Área Protegida.
        </TextInter>
      )}
      <Divider />

      <TextInter color={colors.white[100]} weight="medium">Infraestrutura de acesso</TextInter>
      {/* {!!stepThreeErrors.infraestrutura_acesso && (
          <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
              {stepThreeErrors.infraestrutura_acesso}
          </TextInter>
      )} */}
      <Divider height={12} />
      <Checkbox label="Receptivo" checked={!!infraAcesso.receptivo} onChange={() => handleInfraAcessoChange("receptivo")} />
      <Divider height={12} />
      <Checkbox label="Condutor para visitantes" checked={!!infraAcesso.condutor_para_visitantes} onChange={() => handleInfraAcessoChange("condutor_para_visitantes")} />
      <Divider height={12} />
      <Checkbox label="Lanchonete e/ou restaurante" checked={!!infraAcesso.lanchonete_ou_restaurante} onChange={() => handleInfraAcessoChange("lanchonete_ou_restaurante")} />
      <Divider height={12} />
      <Checkbox label="Pousada e/ou hotel" checked={!!infraAcesso.pousada_ou_hotel} onChange={() => handleInfraAcessoChange("pousada_ou_hotel")} />
      <Divider height={12} />
      <Checkbox label="Nenhuma" checked={!!infraAcesso.nenhuma} onChange={() => handleInfraAcessoChange("nenhuma")} />
      <StatusBar style="light" />
      <View style={{ height: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingBottom: 30,
  },
  subCheckboxContainer: {
    marginLeft: 20, 
    marginTop: 8,
  },
  errorText: { // Estilo para mensagens de erro
    color: colors.error[100],
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  italicText: {
    marginTop: 10,
    color: colors.white[80],
    fontStyle: "italic",
  }
});

export default StepThree;
