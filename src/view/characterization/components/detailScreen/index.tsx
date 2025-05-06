import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Divider } from "../../../../components/divider";
import { Header } from "../../../../components/header";
import TextInter from "../../../../components/textInter";
import { colors } from "../../../../assets/colors";
import {
  Arqueologia,
  AspectosSocioambientais,
  Biota,
  CaracterizacaoInterna,
  Dificuldades_externas,
  Dificuldades_progressao_interna,
  Entrada,
  Espeleotemas,
  Grupo_litologico,
  GuanoTipo,
  HidrologiaData,
  HidrologiaFeature,
  Infraestrutura_acesso,
  Infraestrutura_interna,
  Insercao,
  MorfologiaData,
  Paleontologia,
  Posicao_vertente,
  RouterProps,
  SedimentoDetalhe,
  SedimentosData,
  Uso_cavidade,
  Vegetacao,
} from "../../../../types";
import { FC, useEffect, useState } from "react";
import { LabelText } from "../../../../components/labelText";
import CavityRegister from "../../../../db/model/cavityRegister";
import { database } from "../../../../db";
import { formatDate } from "../../../../util";

interface DetailScreenProps extends RouterProps {
  onClose: () => void;
  cavityId: string;
}

export const DetailScreen: FC<DetailScreenProps> = ({
  navigation,
  onClose,
  cavityId,
}) => {
  const [cavity, setCavity] = useState<CavityRegister | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCavity = async () => {
      if (!cavityId) {
        setError("ID da cavidade não fornecido.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const cavityCollection =
          database.collections.get<CavityRegister>("cavity_register");
        const foundCavity = await cavityCollection.find(cavityId); // Find by ID
        console.log({ foundCavity });
        setCavity(foundCavity);
      } catch (err) {
        console.error("Error fetching cavity details:", err);
        setError("Erro ao carregar detalhes da cavidade.");
        setCavity(null); // Clear any previous data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCavity();
  }, [cavityId]);

  if (isLoading) {
    return (
      <View
        style={{
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <Divider />
        <TextInter color={colors.white[100]} weight="medium">
          Carregando detalhes...
        </TextInter>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Header title="Erro" navigation={navigation} onCustomReturn={onClose} />
        <Divider />
        <TextInter color={colors.error[100]} style={{ marginTop: 20 }}>
          {error}
        </TextInter>
      </View>
    );
  }

  if (!cavity) {
    return (
      <View style={styles.centered}>
        <Header
          title="Não Encontrado"
          navigation={navigation}
          onCustomReturn={onClose}
        />
        <Divider />
        <TextInter style={{ marginTop: 20 }}>
          Cavidade não encontrada.
        </TextInter>
      </View>
    );
  }

  const parseJsonField = (
    fieldData: string | undefined | null,
    defaultValue: any = null
  ) => {
    if (!fieldData) return defaultValue;
    try {
      return JSON.parse(fieldData);
    } catch (e) {
      console.warn("Failed to parse JSON field:", fieldData, e);
      return defaultValue;
    }
  };

  const formatFlags = (
    obj: Record<string, any> | undefined, // Use Record<string, any>
    labels: Record<string, string>,
    includeOutro = true
  ): string => {
    if (!obj) return "Não informado";
    const items: string[] = [];
    // Iterate through the labels provided, checking if the corresponding key exists and is true in obj
    for (const key in labels) {
      // Check if the key exists on the object before accessing it
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === true) {
        items.push(labels[key]);
      }
    }
    // Handle 'outro' field if requested and present
    if (
      includeOutro &&
      typeof obj.outro === "string" &&
      obj.outro.trim() !== ""
    ) {
      // Check if 'outroEnabled' exists and is true, or just add 'outro' if it exists
      const outroEnabled = "outroEnabled" in obj ? obj.outroEnabled : true;
      if (outroEnabled) {
        items.push(`Outro: ${obj.outro.trim()}`);
      }
    }
    // Handle exclusive 'nenhuma' flag if present
    if (
      Object.prototype.hasOwnProperty.call(obj, "nenhuma") &&
      obj["nenhuma"] === true
    ) {
      // Return only 'Nenhuma' if it's true and defined in labels
      return labels["nenhuma"] || "Nenhuma";
    }

    return items.length > 0 ? items.join(", ") : "Nenhuma"; // Default to 'Nenhuma' if no flags are true
  };

  const formatPosicaoVertente = (posicao?: Posicao_vertente): string =>
    formatFlags(
      posicao,
      { topo: "Topo", alta: "Alta", media: "Média", baixa: "Baixa" },
      false
    );
  const formatInsercao = (insercao?: Insercao): string =>
    formatFlags(insercao, {
      afloramento_rochoso_continuo: "Afloramento rochoso contínuo",
      afloramento_isolado: "Afloramento isolado",
      escarpa_rochosa_continua: "Escarpa rochosa contínua",
      escarpa_rochosa_descontinua: "Escarpa rochosa descontínua",
      dolina: "Dolina",
      deposito_talus: "Depósito tálus",
    });
  const formatVegetacao = (vegetacao?: Vegetacao): string =>
    formatFlags(vegetacao, {
      cerrado: "Cerrado",
      campo_rupestre: "Campo rupestre",
      floresta_estacional_semidecidual: "Floresta estacional semidecidual",
      floresta_ombrofila: "Floresta ombrófila",
      mata_seca: "Mata seca",
      campo_sujo: "Campo sujo",
    });
  const formatArqueologia = (arq?: Arqueologia): string => {
    if (!arq?.possui) return "Não possui ou não informado";
    return formatFlags(arq.tipos, {
      material_litico: "Material lítico",
      material_ceramico: "Material cerâmico",
      pintura_rupestre: "Pintura rupestre",
      gravura: "Gravura",
      ossada_humana: "Ossada humana",
      enterramento: "Enterramento",
      nao_identificado: "Não identificado",
    });
  };
  const formatPaleontologia = (pal?: Paleontologia): string => {
    if (!pal?.possui) return "Não possui ou não informado";
    return formatFlags(pal.tipos, {
      ossada: "Ossada",
      iconofossil: "Iconofóssil",
      jazigo: "Jazigo",
      nao_identificado: "Não identificado",
    });
  };
  const formatDificuldadesExternas = (dif?: Dificuldades_externas): string =>
    formatFlags(
      dif,
      {
        rastejamento: "Rastejamento",
        quebra_corpo: "Quebra corpo",
        teto_baixo: "Teto baixo",
        natacao: "Natação",
        sifao: "Sifão",
        blocos_instaveis: "Blocos instáveis",
        lances_verticais: "Lances verticais",
        cachoeira: "Cachoeira",
        trechos_escorregadios: "Trechos escorregadios",
        passagem_curso_agua: "Passagem curso d'água",
        nenhuma: "Nenhuma",
      },
      false
    ); // 'nenhuma' is exclusive
  const formatUsoCavidade = (uso?: Uso_cavidade): string =>
    formatFlags(uso, {
      religioso: "Religioso",
      cientifico_cultural: "Científico/Cultural",
      social: "Social",
      minerario: "Minerário",
      pedagogico: "Pedagógico",
      esportivo: "Esportivo",
      turistico: "Turístico",
      incipiente: "Incipiente",
      massa: "Massa",
      aventura: "Aventura",
      mergulho: "Mergulho",
      rapel: "Rapel",
    });
  const formatInfraestruturaAcesso = (infra?: Infraestrutura_acesso): string =>
    formatFlags(
      infra,
      {
        receptivo: "Receptivo",
        condutor_para_visitantes: "Condutor para visitantes",
        lanchonete_ou_restaurante: "Lanchonete/Restaurante",
        pousada_ou_hotel: "Pousada/Hotel",
        nenhuma: "Nenhuma",
      },
      false
    ); // 'nenhuma' is exclusive
  const formatGrupoLitologico = (grupo?: Grupo_litologico): string =>
    formatFlags(grupo, {
      rochas_carbonaticas: "Rochas carbonáticas",
      rochas_ferriferas_ferruginosas: "Rochas ferríferas/ferruginosas",
      rochas_siliciclasticas: "Rochas siliciclásticas",
      rochas_peliticas: "Rochas pelíticas",
      rochas_granito_gnaissicas: "Rochas granito/gnáissicas",
    });
  const formatInfraestruturaInterna = (
    infra?: Infraestrutura_interna
  ): string => {
    if (!infra) return "Não informado";
    const items = [];
    if (infra.passarela) items.push("Passarela");
    if (infra.corrimao) {
      const corrimaoTipos = formatFlags(infra.corrimao, {
        ferro: "Ferro",
        madeira: "Madeira",
        corda: "Corda",
      });
      if (corrimaoTipos !== "Nenhuma")
        items.push(`Corrimão (${corrimaoTipos})`);
    }
    if (infra.portao) items.push("Portão");
    if (infra.escada) items.push("Escada");
    if (infra.corda) items.push("Corda");
    if (infra.iluminacao_artificial) items.push("Iluminação artificial");
    if (infra.ponto_ancoragem) items.push("Ponto de ancoragem");
    if (infra.nenhuma) items.push("Nenhuma");
    return items.length > 0 ? items.join(", ") : "Nenhuma";
  };
  const formatDificuldadesInternas = (
    dif?: Dificuldades_progressao_interna
  ): string =>
    formatFlags(dif, {
      teto_baixo: "Teto baixo",
      blocos_instaveis: "Blocos instáveis",
      trechos_escorregadios: "Trechos escorregadios",
      rastejamento: "Rastejamento",
      natacao: "Natação",
      lances_verticais: "Lances verticais",
      passagem_curso_agua: "Passagem curso d'água",
      quebra_corpo: "Quebra corpo",
      sifao: "Sifão",
      cachoeira: "Cachoeira",
      nenhuma: "Nenhuma",
    });
  console.log({ cavity });
  const formatMorfologia = (morf?: MorfologiaData): string[] => {
    if (!morf) return ["Não informado"];
    const padrao = formatFlags(morf.padrao_planimetrico, {
      retilinea: "Retilínea",
      anastomosada: "Anástomosada",
      espongiforme: "Espongiforme",
      labirintica: "Labiríntica",
      reticulado: "Reticulado",
      ramiforme: "Ramiforme",
      dendritico: "Dendrítico",
    });
    const forma = formatFlags(morf.forma_secoes, {
      circular: "Circular",
      eliptica_horizontal: "Elíptica horizontal",
      eliptica_vertical: "Elíptica vertical",
      eliptica_inclinada: "Elíptica inclinada",
      lenticular_vertical: "Lenticular vertical",
      lenticular_horizontal: "Lenticular horizontal",
      poligonal: "Poligonal",
      poligonal_tabular: "Poligonal tabular",
      triangular: "Triangular",
      fechadura: "Fechadura",
      linear_inclinada: "Linear inclinada",
      linear_vertical: "Linear vertical",
      irregular: "Irregular",
      mista: "Mista",
    });
    return [`Padrão Planimétrico: ${padrao}`, `Forma das Seções: ${forma}`];
  };

  const formatHidrologia = (hidro?: HidrologiaData): string[] => {
    if (!hidro) return ["Não informado"];
    const features: string[] = [];
    const formatFeature = (feature?: HidrologiaFeature, label?: string) => {
      if (feature?.possui && label) {
        return `${label}: Sim (${feature.tipo || "Tipo N/A"})`;
      }
      return null; // Return null if not present or possui is false
    };
    features.push(
      formatFeature(hidro.curso_agua, "Curso d'água") || "Curso d'água: Não"
    );
    features.push(formatFeature(hidro.lago, "Lago") || "Lago: Não");
    features.push(
      formatFeature(hidro.sumidouro, "Sumidouro") || "Sumidouro: Não"
    );
    features.push(
      formatFeature(hidro.surgencia, "Surgência") || "Surgência: Não"
    );
    features.push(
      formatFeature(hidro.gotejamento, "Gotejamento") || "Gotejamento: Não"
    );
    features.push(
      formatFeature(hidro.empossamento, "Empossamento") || "Empossamento: Não"
    );
    features.push(
      formatFeature(hidro.condensacao, "Condensação") || "Condensação: Não"
    );
    features.push(formatFeature(hidro.exudacao, "Exudação") || "Exudação: Não");

    if (hidro.outro) {
      features.push(`Outro: ${hidro.outro}`);
    }
    return features;
  };

  const formatSedimentos = (sed?: SedimentosData): string[] => {
    if (!sed) return ["Não informado"];
    const result: string[] = [];

    // Sedimentação Clástica
    const clastica = sed.sedimentacao_clastica;
    if (clastica?.possui) {
      result.push("Sedimentação Clástica: Sim");
      const tiposClasticos: string[] = [];
      const tipo = clastica.tipo;
      if (tipo) {
        if (tipo.rochoso) tiposClasticos.push("Rochoso");
        const formatDetalhe = (detalhe?: SedimentoDetalhe, label?: string) =>
          detalhe && label
            ? `${label} (Dist: ${detalhe.distribuicao || "N/A"}, Orig: ${
                detalhe.origem || "N/A"
              })`
            : null;
        tiposClasticos.push(formatDetalhe(tipo.argila, "Argila") || "");
        tiposClasticos.push(formatDetalhe(tipo.silte, "Silte") || "");
        tiposClasticos.push(formatDetalhe(tipo.areia, "Areia") || "");
        tiposClasticos.push(
          formatDetalhe(tipo.fracao_granulo, "Grânulo") || ""
        );
        tiposClasticos.push(
          formatDetalhe(tipo.seixo_predominante, "Seixo") || ""
        );
        tiposClasticos.push(formatDetalhe(tipo.fracao_calhau, "Calhau") || "");
        tiposClasticos.push(
          formatDetalhe(tipo.matacao_predominante, "Matacão") || ""
        );
      }
      result.push(
        `  Tipos Clásticos: ${
          tiposClasticos.filter((t) => t).join(", ") || "Nenhum"
        }`
      );
    } else {
      result.push("Sedimentação Clástica: Não ou não informado");
    }

    // Sedimentação Orgânica
    const organica = sed.sedimentacao_organica;
    if (organica?.possui) {
      result.push("Sedimentação Orgânica: Sim");
      const tiposOrganicos: string[] = [];
      const tipoOrg = organica.tipo;
      if (tipoOrg) {
        if (tipoOrg.guano) {
          const guanoTipos: string[] = [];
          const formatGuano = (gTipo?: GuanoTipo, label?: string) =>
            gTipo?.possui && label ? `${label} (${gTipo.tipo || "N/A"})` : null;
          guanoTipos.push(
            formatGuano(tipoOrg.guano.carnivoro, "Carnívoro") || ""
          );
          guanoTipos.push(
            formatGuano(tipoOrg.guano.frugivoro, "Frugívoro") || ""
          );
          guanoTipos.push(
            formatGuano(tipoOrg.guano.hematofago, "Hematófago") || ""
          );
          // Corrected typo: inderterminado -> indeterminado
          guanoTipos.push(
            formatGuano(
              (tipoOrg.guano as any).inderterminado,
              "Indeterminado"
            ) || ""
          ); // Use 'as any' to handle potential typo in data
          if (guanoTipos.filter((t) => t).length > 0) {
            tiposOrganicos.push(
              `Guano: ${guanoTipos.filter((t) => t).join(", ")}`
            );
          }
        }
        if (tipoOrg.folhico) tiposOrganicos.push("Folhiço");
        if (tipoOrg.galhos) tiposOrganicos.push("Galhos");
        if (tipoOrg.raizes) tiposOrganicos.push("Raízes");
        if (tipoOrg.vestigios_ninhos)
          tiposOrganicos.push("Vestígios de ninhos");
        if (tipoOrg.pelotas_regurgitacao)
          tiposOrganicos.push("Pelotas de regurgitação");
      }
      result.push(
        `  Tipos Orgânicos: ${tiposOrganicos.join(", ") || "Nenhum"}`
      );
    } else {
      result.push("Sedimentação Orgânica: Não ou não informado");
    }

    return result;
  };

  const entradasData: Entrada[] = parseJsonField(cavity.entradas, []);
  const arqueologiaData: Arqueologia | null = parseJsonField(
    cavity.arqueologia,
    null
  );
  const espeleotemasData: Espeleotemas | null = parseJsonField(
    cavity.espeleotemas,
    null
  );
  const biotaData: Biota | null = parseJsonField(cavity.biota, null);
  const paleontologiaData: Paleontologia | null = parseJsonField(
    cavity.paleontologia,
    null
  );
  const caracterizacaoInternaData: CaracterizacaoInterna | null =
    parseJsonField(cavity.caracterizacao_interna, null);
  const dificuldadesExternasData: Dificuldades_externas | null = parseJsonField(
    cavity.dificuldades_externas,
    null
  );
  const aspectosSocioambientaisData: AspectosSocioambientais | null =
    parseJsonField(cavity.aspectos_socioambientais, null);
  const morfologiaData: MorfologiaData | null = parseJsonField(
    cavity.morfologia,
    null
  );
  const hidrologiaData: HidrologiaData | null = parseJsonField(
    cavity.hidrologia,
    null
  );
  const sedimentosData: SedimentosData | null = parseJsonField(
    cavity.sedimentos,
    null
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header
        title="Visualizar Caracterização"
        navigation={navigation}
        onCustomReturn={onClose}
      />
      <Divider />
      <View style={styles.container}>
        <TextInter color={colors.white[100]} fontSize={19}>
          Registro
        </TextInter>
        <Divider />
        <LabelText
          label="Responsável pelo registro"
          text={cavity.responsavel || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Nome da cavidade"
          text={cavity.nome_cavidade || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Nome do sistema"
          text={cavity.nome_sistema || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Localidade"
          text={cavity.localidade || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Município"
          text={cavity.municipio || "Não informado"}
        />
        <Divider />
        <LabelText label="UF" text={cavity.uf || "Não informado"} />
        <Divider />
        <LabelText
          label="Data"
          text={formatDate(cavity.data) || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Desenvolvimento Linear (m)"
          text={cavity.desenvolvimento_linear?.toString() ?? "Não informado"}
        />
        <Divider />
        <TextInter
          weight="medium"
          color={colors.dark[60]}
          style={styles.subHeader}
        >
          Entradas ({entradasData.length})
        </TextInter>
        {Array.isArray(entradasData) && entradasData.length > 0 ? (
          entradasData.map((entrada, index) => (
            <View key={index} style={styles.entradaContainer}>
              <View style={styles.entradaHeader}>
                <TextInter weight="semi-bold" color={colors.white[90]}>
                  Entrada {index + 1}
                </TextInter>
                {entrada.principal && (
                  <TextInter
                    fontSize={12}
                    color={colors.accent[100]}
                    weight="bold"
                  >
                    {" "}
                    (Principal)
                  </TextInter>
                )}
              </View>
              <LabelText
                label="Datum"
                text={entrada.coordenadas?.datum || "N/A"}
              />
              <Divider height={12} />
              <LabelText
                label="UTM E"
                text={entrada.coordenadas?.utm?.utm_e?.toString() ?? "N/A"}
              />
              <Divider height={12} />
              <LabelText
                label="UTM N"
                text={entrada.coordenadas?.utm?.utm_n?.toString() ?? "N/A"}
              />
              <Divider height={12} />
              <LabelText
                label="Zona UTM"
                text={entrada.coordenadas?.utm?.zona || "N/A"}
              />
              <Divider height={12} />
              <LabelText
                label="Elevação (m)"
                text={entrada.coordenadas?.utm?.elevacao?.toString() ?? "N/A"}
              />
              <Divider height={12} />
              <LabelText
                label="Inserção"
                text={formatInsercao(entrada.caracteristicas?.insercao)}
              />
              <Divider height={12} />
              <LabelText
                label="Posição Vertente"
                text={formatPosicaoVertente(
                  entrada.caracteristicas?.posicao_vertente
                )}
              />
              <Divider height={12} />
              <LabelText
                label="Vegetação"
                text={formatVegetacao(entrada.caracteristicas?.vegetacao)}
              />
              <Divider height={12} />
              {entrada.foto ? (
                <>
                  <LabelText label="Foto" text="" />
                  <Image
                    style={styles.entradaImage}
                    source={{ uri: entrada.foto }}
                    resizeMode="cover"
                    onError={(e) =>
                      console.log("Image load error:", e.nativeEvent.error)
                    }
                  />
                </>
              ) : (
                <LabelText label="Foto" text="Nenhuma imagem" />
              )}
              {index < entradasData.length - 1 && <Divider height={15} />}
            </View>
          ))
        ) : (
          <TextInter fontSize={12} color={colors.dark[60]}>
            Nenhuma entrada informada.
          </TextInter>
        )}
        <Divider height={18} />
        <View style={styles.sectionContainer}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Caracterização Interna
          </TextInter>
          <Divider />
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Morfologia
          </TextInter>
          {formatMorfologia(morfologiaData || undefined).map((line, index) => (
            <TextInter key={`morf-${index}`} style={styles.detailText}>
              {line}
            </TextInter>
          ))}
          <Divider />
          {/* Display Hidrologia */}
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Hidrologia
          </TextInter>
          {formatHidrologia(hidrologiaData || undefined).map((line, index) => (
            <TextInter key={`hidro-${index}`} style={styles.detailText}>
              {line}
            </TextInter>
          ))}
          <Divider />
          <LabelText
            label="Grupo Litológico"
            text={formatGrupoLitologico(
              caracterizacaoInternaData?.grupo_litologico
            )}
          />
          <Divider />
          <LabelText
            label="Desenvolvimento Predominante"
            text={
              caracterizacaoInternaData?.desenvolvimento_predominante ||
              "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Estado de Conservação"
            text={
              caracterizacaoInternaData?.estado_conservacao || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Infraestrutura Interna"
            text={formatInfraestruturaInterna(
              caracterizacaoInternaData?.infraestrutura_interna
            )}
          />
          <Divider />
          <LabelText
            label="Dificuldades de Progressão Interna"
            text={formatDificuldadesInternas(
              caracterizacaoInternaData?.dificuldades_progressao_interna
            )}
          />
          {/* Display Espeleotemas */}
          <Divider />
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Espeleotemas
          </TextInter>
          {espeleotemasData?.possui ? (
            espeleotemasData.lista && espeleotemasData.lista.length > 0 ? (
              espeleotemasData.lista.map((item, index) => (
                <LabelText
                  key={item.id || index}
                  label={`- ${item.tipo || "Tipo não informado"}`}
                  text={`Porte: ${item.porte || "N/A"}, Frequência: ${
                    item.frequencia || "N/A"
                  }, Conservação: ${item.estado_conservacao || "N/A"}`}
                />
              ))
            ) : (
              <TextInter fontSize={12} color={colors.dark[60]}>
                Lista de espeleotemas não disponível.
              </TextInter>
            )
          ) : (
            <TextInter fontSize={12} color={colors.dark[60]}>
              Não possui ou não informado.
            </TextInter>
          )}
          <Divider />
          {/* Display Sedimentos */}
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Sedimentos
          </TextInter>
          {formatSedimentos(sedimentosData || undefined).map((line, index) => (
            <TextInter key={`sed-${index}`} style={styles.detailText}>
              {line}
            </TextInter>
          ))}
        </View>
        <Divider height={18} />
        <View style={styles.sectionContainer}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Biota
          </TextInter>
          <Divider />
          <LabelText
            label="Invertebrados"
            text={
              formatFlags(
                biotaData?.invertebrados,
                { possui: "Possui" },
                false
              ) +
                (biotaData?.invertebrados?.tipos
                  ? `: ${biotaData.invertebrados.tipos.join(", ")}`
                  : "") +
                (biotaData?.invertebrados?.outroEnabled &&
                biotaData?.invertebrados?.outro
                  ? `, Outro: ${biotaData.invertebrados.outro}`
                  : "") || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Invertebrados Aquáticos"
            text={
              formatFlags(
                biotaData?.invertebrados_aquaticos,
                { possui: "Possui" },
                false
              ) +
                (biotaData?.invertebrados_aquaticos?.tipos
                  ? `: ${biotaData.invertebrados_aquaticos.tipos.join(", ")}`
                  : "") +
                (biotaData?.invertebrados_aquaticos?.outroEnabled &&
                biotaData?.invertebrados_aquaticos?.outro
                  ? `, Outro: ${biotaData.invertebrados_aquaticos.outro}`
                  : "") || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Anfíbios"
            text={
              formatFlags(biotaData?.anfibios, { possui: "Possui" }, false) +
                (biotaData?.anfibios?.tipos
                  ? `: ${biotaData.anfibios.tipos.join(", ")}`
                  : "") +
                (biotaData?.anfibios?.outroEnabled && biotaData?.anfibios?.outro
                  ? `, Outro: ${biotaData.anfibios.outro}`
                  : "") || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Répteis"
            text={
              formatFlags(biotaData?.repteis, { possui: "Possui" }, false) +
                (biotaData?.repteis?.tipos
                  ? `: ${biotaData.repteis.tipos.join(", ")}`
                  : "") +
                (biotaData?.repteis?.outroEnabled && biotaData?.repteis?.outro
                  ? `, Outro: ${biotaData.repteis.outro}`
                  : "") || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Aves"
            text={
              formatFlags(biotaData?.aves, { possui: "Possui" }, false) +
                (biotaData?.aves?.tipos
                  ? `: ${biotaData.aves.tipos.join(", ")}`
                  : "") +
                (biotaData?.aves?.outroEnabled && biotaData?.aves?.outro
                  ? `, Outro: ${biotaData.aves.outro}`
                  : "") || "Não informado"
            }
          />
          <Divider />
          <LabelText
            label="Peixes"
            text={biotaData?.peixes ? "Sim" : "Não ou não informado"}
          />
          <Divider />
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Morcegos
          </TextInter>
          {biotaData?.morcegos?.possui ? (
            biotaData.morcegos.tipos && biotaData.morcegos.tipos.length > 0 ? (
              biotaData.morcegos.tipos.map((morcego, index) => (
                <LabelText
                  key={index}
                  label={`- ${morcego.tipo || "Tipo não informado"}`}
                  text={`Quantidade: ${morcego.quantidade || "N/A"}`}
                />
              ))
            ) : (
              <TextInter fontSize={12} color={colors.dark[60]}>
                Tipos não especificados.
              </TextInter>
            )
          ) : (
            <TextInter fontSize={12} color={colors.dark[60]}>
              Não possui ou não informado.
            </TextInter>
          )}
          {biotaData?.morcegos?.observacoes_gerais && (
            <LabelText
              label="Obs. Morcegos"
              text={biotaData.morcegos.observacoes_gerais}
            />
          )}
        </View>
        <Divider height={18} />
        <View style={styles.sectionContainer}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Arqueologia
          </TextInter>
          <Divider />
          <LabelText
            label="Vestígios"
            text={formatArqueologia(arqueologiaData || undefined)}
          />
        </View>
        <Divider height={18} />

        {/* Section: Paleontologia */}
        <View style={styles.sectionContainer}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Paleontologia
          </TextInter>
          <Divider />
          <LabelText
            label="Vestígios"
            text={formatPaleontologia(paleontologiaData || undefined)}
          />
        </View>
        <Divider height={18} />

        {/* Section: Aspectos Externos */}
        <View style={styles.sectionContainer}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Aspectos Externos
          </TextInter>
          <Divider />
          <LabelText
            label="Dificuldades Externas"
            text={formatDificuldadesExternas(
              dificuldadesExternasData || undefined
            )}
          />
          <Divider />
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Aspectos Socioambientais
          </TextInter>
          <LabelText
            label="Uso da Cavidade"
            text={formatUsoCavidade(aspectosSocioambientaisData?.uso_cavidade)}
          />
          <Divider height={5} />
          <LabelText
            label="Comunidade Envolvida"
            text={
              aspectosSocioambientaisData?.comunidade_envolvida?.envolvida
                ? "Sim"
                : "Não ou não informado"
            }
          />
          {aspectosSocioambientaisData?.comunidade_envolvida?.envolvida &&
            aspectosSocioambientaisData?.comunidade_envolvida?.descricao && (
              <LabelText
                label="Descrição (Comunidade)"
                text={
                  aspectosSocioambientaisData.comunidade_envolvida.descricao
                }
              />
            )}
          <Divider height={5} />
          <LabelText
            label="Área Protegida"
            text={
              aspectosSocioambientaisData?.area_protegida?.federal?.nome
                ? `Federal: ${
                    aspectosSocioambientaisData.area_protegida.federal.nome
                  } (${
                    aspectosSocioambientaisData.area_protegida.federal.zona ||
                    "Zona N/A"
                  })`
                : aspectosSocioambientaisData?.area_protegida?.estadual?.nome
                ? `Estadual: ${
                    aspectosSocioambientaisData.area_protegida.estadual.nome
                  } (${
                    aspectosSocioambientaisData.area_protegida.estadual.zona ||
                    "Zona N/A"
                  })`
                : aspectosSocioambientaisData?.area_protegida?.municipal?.nome
                ? `Municipal: ${
                    aspectosSocioambientaisData.area_protegida.municipal.nome
                  } (${
                    aspectosSocioambientaisData.area_protegida.municipal.zona ||
                    "Zona N/A"
                  })`
                : aspectosSocioambientaisData?.area_protegida?.nao_determinado
                ? "Não foi possível determinar"
                : "Não informado"
            }
          />
          <Divider height={5} />
          <LabelText
            label="Infraestrutura de Acesso"
            text={formatInfraestruturaAcesso(
              aspectosSocioambientaisData?.infraestrutura_acesso
            )}
          />
        </View>
        <Divider height={18} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30434f",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },
  image: {
    width: 161,
    height: 91,
  },
  centered: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.dark[90],
  },
  subHeader: {
    marginBottom: 8,
    marginTop: 5,
  },
  entradaContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent[100],
    paddingBottom: 5,
  },
  entradaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  entradaText: {
    fontSize: 13,
    color: colors.dark[20],
    marginTop: 1,
  },
  entradaImage: {
    width: "80%",
    aspectRatio: 16 / 9,
    height: undefined,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  sectionContainer: {
    borderWidth: 1,
    borderColor: colors.dark[50],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.dark[80],
  },
  detailText: {
    fontSize: 13,
    color: colors.dark[20],
    marginTop: 1,
    marginBottom: 3, // Add some space between lines
    lineHeight: 18, // Improve readability
  },
});
