import React, { FC, useCallback, useMemo } from "react"; // Adicionado useMemo e FC
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { Select } from "../../../components/select";
import { DividerColorLine } from "../../../components/dividerColorLine";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  setSedimentoPossui,
  updateCavidadeData,
  toggleSedimentacaoClasticaOutrosEnabled,
  setSedimentacaoClasticaOutrosText,
  toggleSedimentacaoOrganicaOutrosEnabled,
  setSedimentacaoOrganicaOutrosText,
} from "../../../redux/cavitySlice";

import { Sedimentos, RouterProps } from "../../../types"; // Adicionado RouterProps

// Interface para as props do StepSeven
// Se StepComponentProps já está definido em um arquivo de tipos central, importe-o de lá.
interface StepSevenProps extends RouterProps {
  validationAttempted: boolean;
}

// Definição de tipos para chaves e valores, para segurança de tipo nos handlers
type ClasticTypeKey = Exclude<
  keyof NonNullable<NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]>,
  "rochoso"
>;
type ClasticOrigemValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]
    >["argila"]
  >["origem"]
>;
type ClasticDistribuicaoValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<Sedimentos["sedimentacao_clastica"]>["tipo"]
    >["argila"]
  >["distribuicao"]
>;

type OrganicTypeKey = keyof NonNullable<
  NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]
>;
type GuanoTypeKey = keyof NonNullable<
  NonNullable<NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]>["guano"]
>;
type GuanoTipoValue = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<Sedimentos["sedimentacao_organica"]>["tipo"]
      >["guano"]
    >["carnivoro"]
  >["tipo"]
>;

// Função auxiliar para verificar se um campo está preenchido
const isFieldFilled = (value: any): boolean => {
    if (value === null || typeof value === "undefined") return false;
    if (typeof value === "string" && value.trim() === "") return false;
    // Adicione outras verificações se necessário (ex: array vazio)
    return true;
};


export const StepSeven: FC<StepSevenProps> = ({ navigation, route, validationAttempted }) => {
  const dispatch = useDispatch<AppDispatch>();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);

  const sedimentos = cavidade.sedimentos ?? {};
  const clastica = sedimentos.sedimentacao_clastica ?? { possui: false, tipo: {}, outros: undefined, outroEnabled: false };
  const clasticaTipo = clastica.tipo ?? {};
  const organica = sedimentos.sedimentacao_organica ?? { possui: false, tipo: {}, outros: undefined, outroEnabled: false };
  const organicaTipo = organica.tipo ?? {};
  const guano = organicaTipo.guano ?? {};

  // Lógica de Erros Específicos para StepSeven
  const stepSevenErrors = useMemo(() => {
    if (!validationAttempted) {
      return {};
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Campo obrigatório";
    const errorMsgDetalhes = "Detalhes incompletos";
    const errorMsgMinOne = "Selecione e preencha pelo menos uma opção.";

    // Validação Sedimentação Clástica
    if (clastica.possui) {
      let algumaSubOpcaoClasticaValida = false;
      if (clastica.tipo?.rochoso) {
        const checkGrainSize = (grain?: { distribuicao?: string; origem?: string; }) =>
          grain ? isFieldFilled(grain.distribuicao) && isFieldFilled(grain.origem) : false;
        
        let peloMenosUmGraoAtivoMasInvalido = false;
        let algumGraoAtivo = false;

        (["argila", "silte", "areia", "fracao_granulo", "seixo_predominante", "fracao_calhau", "matacao_predominante"] as ClasticTypeKey[]).forEach(type => {
            const grainData = clastica.tipo?.[type];
            if (grainData) { // Se o tipo de grão está "ativo" (objeto existe)
                algumGraoAtivo = true;
                if (!isFieldFilled(grainData.distribuicao)) errors[`clastica_dist_${type}`] = errorMsgDetalhes;
                if (!isFieldFilled(grainData.origem)) errors[`clastica_origem_${type}`] = errorMsgDetalhes;
                if (checkGrainSize(grainData)) {
                    algumaSubOpcaoClasticaValida = true;
                } else {
                    peloMenosUmGraoAtivoMasInvalido = true;
                }
            }
        });
        if (algumGraoAtivo && !algumaSubOpcaoClasticaValida) { // Se tem grãos ativos, mas nenhum é válido
            errors.clastica_rochoso_geral = "Complete os detalhes (distribuição e origem) para os tipos de grãos selecionados.";
        } else if (!algumGraoAtivo) { // Se rochoso está marcado, mas nenhum tipo de grão foi sequer ativado
            errors.clastica_rochoso_geral = errorMsgMinOne;
        }
      }
      
      if (clastica.outroEnabled) {
        if (isFieldFilled(clastica.outros)) {
          algumaSubOpcaoClasticaValida = true; // Considera "outros" preenchido como uma sub-opção válida
        } else {
          errors.clastica_outros_texto = errorMsgRequired;
        }
      }
      // Se "possui" é true, mas nenhuma sub-opção (rochoso com grãos válidos OU outros preenchido) é válida
      if (!algumaSubOpcaoClasticaValida && !(clastica.tipo?.rochoso && !errors.clastica_rochoso_geral) && !(clastica.outroEnabled && isFieldFilled(clastica.outros))) {
          errors.clastica_geral = "Se 'Possui Sed. Clásticos' está marcado, selecione 'Rochoso' (e detalhes) ou preencha 'Outros'.";
      }
    }

    // Validação Sedimentação Orgânica
    if (organica.possui) {
      let algumaSubOpcaoOrganicaValida = false;
      if (organica.tipo?.guano) {
        const guanoTipos = organica.tipo.guano;
        let algumGuanoPossui = false;
        (["carnivoro", "frugivoro", "hematofago", "inderterminado"] as GuanoTypeKey[]).forEach(gType => {
          const guanoDetail = guanoTipos[gType];
          if (guanoDetail?.possui) {
            algumGuanoPossui = true;
            if (!isFieldFilled(guanoDetail.tipo)) {
              errors[`organica_guano_tipo_${gType}`] = errorMsgRequired;
            } else {
              algumaSubOpcaoOrganicaValida = true; // Guano válido encontrado
            }
          }
        });
         if (algumGuanoPossui && !algumaSubOpcaoOrganicaValida) { // Se algum guano 'possui' mas seu tipo não está preenchido
            errors.organica_guano_geral = "Selecione o tipo para as categorias de guano marcadas.";
        }
      }
      if (organica.tipo?.folhico || organica.tipo?.galhos || organica.tipo?.raizes || organica.tipo?.vestigios_ninhos || organica.tipo?.pelotas_regurgitacao) {
        algumaSubOpcaoOrganicaValida = true;
      }
      if (organica.outroEnabled) {
        if (isFieldFilled(organica.outros)) {
          algumaSubOpcaoOrganicaValida = true;
        } else {
          errors.organica_outros_texto = errorMsgRequired;
        }
      }
      if (!algumaSubOpcaoOrganicaValida) {
        errors.organica_geral = "Se 'Possui Sed. Orgânicos' está marcado, selecione um tipo ou preencha 'Outros'.";
      }
    }
    return errors;
  }, [validationAttempted, clastica, organica]);


  const handleUpdate = useCallback(
    (path: (string | number)[], value: any) => {
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch]
  );

  const handlePossuiToggle = useCallback(
    (section: "sedimentacao_clastica" | "sedimentacao_organica") => {
      const currentSectionState = sedimentos[section];
      const currentPossui = currentSectionState?.possui ?? false;
      dispatch(
        setSedimentoPossui({ section: section, possui: !currentPossui })
      );
    },
    [dispatch, sedimentos]
  );

  const handleRochosoToggle = useCallback(() => {
    if (clastica.possui) {
      const path = ["sedimentos", "sedimentacao_clastica", "tipo", "rochoso"];
      handleUpdate(path, !clasticaTipo.rochoso);
    }
  }, [handleUpdate, clastica.possui, clasticaTipo.rochoso]);

  const handleClasticTypeToggle = useCallback(
    (typeName: ClasticTypeKey) => {
      if (clastica.possui) {
        const path = ["sedimentos", "sedimentacao_clastica", "tipo", typeName];
        const exists = !!clasticaTipo[typeName];
        handleUpdate(path, exists ? undefined : { distribuicao: undefined, origem: undefined }); // Inicializa com sub-campos
      }
    },
    [handleUpdate, clastica.possui, clasticaTipo]
  );

  const handleClasticDetailChange = useCallback(
    (
      typeName: ClasticTypeKey,
      detailField: "distribuicao" | "origem",
      value: ClasticDistribuicaoValue | ClasticOrigemValue | undefined
    ) => {
      if (clastica.possui && clasticaTipo[typeName]) {
        const path = ["sedimentos", "sedimentacao_clastica", "tipo", typeName, detailField];
        handleUpdate(path, value);
      }
    },
    [handleUpdate, clastica.possui, clasticaTipo]
  );

  const handleToggleClasticaOutros = useCallback(() => {
    if (clastica.possui) {
      dispatch(toggleSedimentacaoClasticaOutrosEnabled());
    }
  }, [dispatch, clastica.possui]);

  const handleClasticaOutrosTextChange = useCallback(
    (text: string) => {
      dispatch(setSedimentacaoClasticaOutrosText(text));
    },
    [dispatch]
  );
  
  const handleOrganicTypeToggle = useCallback(
    (typeName: OrganicTypeKey) => {
      if (organica.possui) {
        const path = ["sedimentos", "sedimentacao_organica", "tipo", typeName];
        const currentValue = organicaTipo[typeName];
        if (typeName === "guano") {
          handleUpdate(path, currentValue ? undefined : {}); // Inicializa guano como objeto vazio
        } else {
          handleUpdate(path, !currentValue);
        }
      }
    },
    [handleUpdate, organica.possui, organicaTipo]
  );

  const handleToggleOrganicaOutros = useCallback(() => {
    if (organica.possui) {
      dispatch(toggleSedimentacaoOrganicaOutrosEnabled());
    }
  }, [dispatch, organica.possui]);

  const handleOrganicaOutrosTextChange = useCallback(
    (text: string) => {
      dispatch(setSedimentacaoOrganicaOutrosText(text));
    },
    [dispatch]
  );

  const handleGuanoTypeToggle = useCallback(
    (guanoTypeName: GuanoTypeKey) => {
      if (organica.possui && organicaTipo.guano) {
        const basePath = ["sedimentos", "sedimentacao_organica", "tipo", "guano", guanoTypeName];
        const currentSubObject = guano[guanoTypeName];
        const currentPossui = currentSubObject?.possui || false;
        const isTurningOn = !currentPossui;
        if (isTurningOn) {
          handleUpdate(basePath, { possui: true, tipo: currentSubObject?.tipo ?? undefined });
        } else {
          handleUpdate(basePath, { possui: false, tipo: undefined });
        }
      }
    },
    [handleUpdate, organica.possui, organicaTipo.guano, guano]
  );

  const handleGuanoDetailChange = useCallback(
    (guanoTypeName: GuanoTypeKey, value: GuanoTipoValue | undefined) => {
      if (organica.possui && organicaTipo.guano && guano[guanoTypeName]?.possui) { // Adicionado check para guano[guanoTypeName]
        const path = ["sedimentos", "sedimentacao_organica", "tipo", "guano", guanoTypeName, "tipo"];
        handleUpdate(path, value);
      }
    },
    [handleUpdate, organica.possui, organicaTipo.guano, guano] // Adicionado organicaTipo.guano
  );

  const renderClasticSection = (typeName: ClasticTypeKey, label: string) => {
    const typeState = clasticaTipo[typeName];
    const exists = !!typeState;

    const distribuicaoOptions = [
      { id: "", label: "Selecione..." , value: undefined }, 
      { id: "generalizado", label: "Generalizado", value: "generalizado" as ClasticDistribuicaoValue },
      { id: "localizado", label: "Localizado", value: "localizado" as ClasticDistribuicaoValue },
    ];
    const currentDistribuicaoValue = typeState?.distribuicao ?? "";

    return (
      <View key={typeName} style={styles.secondLayerItem}>
        {label === "Argila" && !clasticaTipo.rochoso && (
          <TextInter color={colors.white[100]} weight="bold">
            Selecione o tipo de solo incipiente
          </TextInter>
        )}
        <Divider height={12} />
        <Checkbox
          label={label}
          checked={exists}
          onChange={() => handleClasticTypeToggle(typeName)}
        />
        {exists && (
          <View style={styles.thirdLayer}>
            <Select
              label="Distribuição"
              required
              onChangeText={(obj) => {
                if (obj && obj.id !== "") {
                  handleClasticDetailChange(typeName, "distribuicao", obj.id as ClasticDistribuicaoValue);
                } else {
                  handleClasticDetailChange(typeName, "distribuicao", undefined);
                }
              }}
              value={currentDistribuicaoValue}
              placeholder="Selecione a distribuição"
              optionsList={distribuicaoOptions}
              hasError={!!stepSevenErrors[`clastica_dist_${typeName}`]}
              errorMessage={stepSevenErrors[`clastica_dist_${typeName}`]}
            />
            <TextInter color={colors.white[100]} weight="medium">
              Origem
            </TextInter>
            {!!stepSevenErrors[`clastica_origem_${typeName}`] && 
                <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
                    {stepSevenErrors[`clastica_origem_${typeName}`]}
                </TextInter>
            }
            <Divider height={12} />
            <Checkbox label="Autóctone" checked={typeState?.origem === "autoctone"} onChange={() => handleClasticDetailChange(typeName, "origem", "autoctone")} />
            <Divider height={12} />
            <Checkbox label="Alóctone" checked={typeState?.origem === "aloctone"} onChange={() => handleClasticDetailChange(typeName, "origem", "aloctone")} />
            <Divider height={12} />
            <Checkbox label="Mista" checked={typeState?.origem === "mista"} onChange={() => handleClasticDetailChange(typeName, "origem", "mista")} />
            <Divider height={12} />
          </View>
        )}
        <DividerColorLine />
      </View>
    );
  };

  const renderGuanoTypeSection = (
    guanoTypeName: GuanoTypeKey,
    label: string
  ) => {
    const guanoTypeState = guano[guanoTypeName];
    const possui = guanoTypeState?.possui || false;

    const guanoTipoOptions = [
      { id: "", label: "Selecione...", value: undefined },
      { id: "seco_manchado", label: "Seco Manchado", value: "seco_manchado" as GuanoTipoValue },
      { id: "seco_esparso", label: "Seco Esparso", value: "seco_esparso" as GuanoTipoValue },
      { id: "umido_manchado", label: "Úmido Manchado", value: "umido_manchado" as GuanoTipoValue },
      { id: "umido_esparso", label: "Úmido Esparso", value: "umido_esparso" as GuanoTipoValue },
    ];
    const currentTipoId = guanoTypeState?.tipo ?? "";
    
    return (
      <View key={guanoTypeName}>
        <Divider height={8} />
        <Checkbox label={label} checked={possui} onChange={() => handleGuanoTypeToggle(guanoTypeName)} />
        {possui && (
          <>
            <Divider height={12} />
            <Select
              label="Tipo"
              required
              onChangeText={(obj) => {
                if (obj && obj.id !== "") {
                  handleGuanoDetailChange(guanoTypeName, obj.id as GuanoTipoValue);
                } else {
                  handleGuanoDetailChange(guanoTypeName, undefined);
                }
              }}
              value={currentTipoId}
              placeholder="Selecione o tipo"
              optionsList={guanoTipoOptions}
              hasError={!!stepSevenErrors[`organica_guano_tipo_${guanoTypeName}`]}
              errorMessage={stepSevenErrors[`organica_guano_tipo_${guanoTypeName}`]}
            />
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Sedimentos Clásticos
      </TextInter>
      {!!stepSevenErrors.clastica_geral && <TextInter style={styles.errorText}>{stepSevenErrors.clastica_geral}</TextInter>}
      <Divider />
      <Checkbox
        label="Possui Sedimentos Clásticos?"
        checked={clastica.possui || false}
        onChange={() => handlePossuiToggle("sedimentacao_clastica")}
      />
      {clastica.possui && (
        <View style={styles.mainSectionContent}>
          <View style={styles.secondLayerItem}>
            <Checkbox
              label="Rochoso (solo incipiente)"
              checked={clasticaTipo.rochoso || false}
              onChange={handleRochosoToggle}
            />
            {!!stepSevenErrors.clastica_rochoso_geral && <TextInter style={styles.errorText}>{stepSevenErrors.clastica_rochoso_geral}</TextInter>}
          </View>

          {clasticaTipo.rochoso && ( // Mostrar tipos de grãos apenas se rochoso estiver marcado
            <View style={styles.thirdLayer}> 
              <DividerColorLine />
              {renderClasticSection("argila", "Argila")}
              {renderClasticSection("silte", "Silte")}
              {renderClasticSection("areia", "Areia")}
              {renderClasticSection("fracao_granulo", "Fração grânulo")}
              {renderClasticSection("seixo_predominante", "Seixo predominante")}
              {renderClasticSection("fracao_calhau", "Fração calhau")}
              {renderClasticSection("matacao_predominante", "Matacão predominante")}
            </View>
          )}
         
          <View style={styles.secondLayerItem}>
            <Checkbox
              label="Outros (Sed. Clástica)"
              checked={clastica.outroEnabled || false}
              onChange={handleToggleClasticaOutros}
            />
            {clastica.outroEnabled && (
              <>
                <Divider height={12} />
                <Input
                  placeholder="Especifique outros sedimentos clásticos"
                  label="Quais outros?"
                  value={clastica.outros || ""}
                  onChangeText={handleClasticaOutrosTextChange}
                  hasError={!!stepSevenErrors.clastica_outros_texto}
                  errorMessage={stepSevenErrors.clastica_outros_texto}
                  required
                />
              </>
            )}
          </View>
          <DividerColorLine />
        </View>
      )}

      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Sedimentos Orgânicos
      </TextInter>
      {!!stepSevenErrors.organica_geral && <TextInter style={styles.errorText}>{stepSevenErrors.organica_geral}</TextInter>}
      <Divider />
      <Checkbox
        label="Possui Sedimentos Orgânicos"
        checked={organica.possui || false}
        onChange={() => handlePossuiToggle("sedimentacao_organica")}
      />
      {organica.possui && (
        <View style={styles.mainSectionContent}>
          <View style={styles.secondLayerItem}>
            <Checkbox
              label="Guano"
              checked={!!organicaTipo.guano}
              onChange={() => handleOrganicTypeToggle("guano")}
            />
            {!!stepSevenErrors.organica_guano_geral && <TextInter style={styles.errorText}>{stepSevenErrors.organica_guano_geral}</TextInter>}
            {!!organicaTipo.guano && (
              <View style={styles.thirdLayer}>
                {renderGuanoTypeSection("carnivoro", "Carnívoro")}
                {renderGuanoTypeSection("frugivoro", "Frugívoro")}
                {renderGuanoTypeSection("hematofago", "Hematófago")}
                {renderGuanoTypeSection("inderterminado", "Indeterminado")}
              </View>
            )}
          </View>
          <DividerColorLine />
          <View style={styles.secondLayerItem}>
            <Checkbox label="Folhiço" checked={organicaTipo.folhico || false} onChange={() => handleOrganicTypeToggle("folhico")} />
            <Divider height={12} />
            <Checkbox label="Galhos" checked={organicaTipo.galhos || false} onChange={() => handleOrganicTypeToggle("galhos")} />
            <Divider height={12} />
            <Checkbox label="Raízes" checked={organicaTipo.raizes || false} onChange={() => handleOrganicTypeToggle("raizes")} />
            <Divider height={12} />
            <Checkbox label="Vestígios de ninhos" checked={organicaTipo.vestigios_ninhos || false} onChange={() => handleOrganicTypeToggle("vestigios_ninhos")} />
            <Divider height={12} />
            <Checkbox label="Pelotas de regurgitação" checked={organicaTipo.pelotas_regurgitacao || false} onChange={() => handleOrganicTypeToggle("pelotas_regurgitacao")} />
          </View>
          <View style={styles.secondLayerItem}>
            <Checkbox
              label="Outros (Sed. Orgânica)"
              checked={organica.outroEnabled || false}
              onChange={handleToggleOrganicaOutros}
            />
            {organica.outroEnabled && (
              <>
                <Divider height={12} />
                <Input
                  placeholder="Especifique outros sedimentos orgânicos"
                  label="Quais outros?"
                  value={organica.outros || ""}
                  onChangeText={handleOrganicaOutrosTextChange}
                  hasError={!!stepSevenErrors.organica_outros_texto}
                  errorMessage={stepSevenErrors.organica_outros_texto}
                  required
                />
              </>
            )}
            <DividerColorLine />
          </View>
        </View>
      )}
      <StatusBar style="light" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  mainSectionContent: {
    marginTop: 10,
  },
  secondLayerItem: {
    paddingLeft: 20,
    marginTop: 10,
  },
  thirdLayer: {
    paddingLeft: 20,
    marginTop: 5,
    marginBottom: 5,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 5,
  },
});
