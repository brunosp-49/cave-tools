import React, { useState, useEffect, FC, useMemo } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "../../../components/divider";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import { useDispatch, useSelector } from "react-redux";
import { showError } from "../../../redux/loadingSlice";
import { Camera } from "react-native-vision-camera";
import { CavityModal } from "./cavityModal";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { LongButton } from "../../../components/longButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Entrada, ProjectModel } from "../../../types"; // RouterProps removido daqui, virá de StepComponentProps
import { RootState } from "../../../redux/store";
import {
  addEntrada,
  removeEntrada,
  setEntradaPrincipal,
  updateCavidadeData,
} from "../../../redux/cavitySlice";
import { fetchAllProjects } from "../../../db/controller";
import { StepComponentProps } from "../../editCavity";

interface SelectOption {
  id: string;
  value: string;
}

const ufOptions: SelectOption[] = [
  { id: 'AC', value: 'Acre' }, { id: 'AL', value: 'Alagoas' }, { id: 'AP', value: 'Amapá' },
  { id: 'AM', value: 'Amazonas' }, { id: 'BA', value: 'Bahia' }, { id: 'CE', value: 'Ceará' },
  { id: 'DF', value: 'Distrito Federal' }, { id: 'ES', value: 'Espírito Santo' }, { id: 'GO', value: 'Goiás' },
  { id: 'MA', value: 'Maranhão' }, { id: 'MT', value: 'Mato Grosso' }, { id: 'MS', value: 'Mato Grosso do Sul' },
  { id: 'MG', value: 'Minas Gerais' }, { id: 'PA', value: 'Pará' }, { id: 'PB', value: 'Paraíba' },
  { id: 'PR', value: 'Paraná' }, { id: 'PE', value: 'Pernambuco' }, { id: 'PI', value: 'Piauí' },
  { id: 'RJ', value: 'Rio de Janeiro' }, { id: 'RN', value: 'Rio Grande do Norte' }, { id: 'RS', value: 'Rio Grande do Sul' },
  { id: 'RO', value: 'Rondônia' }, { id: 'RR', value: 'Roraima' }, { id: 'SC', value: 'Santa Catarina' },
  { id: 'SP', value: 'São Paulo' }, { id: 'SE', value: 'Sergipe' }, { id: 'TO', value: 'Tocantins' }
].sort((a, b) => a.value.localeCompare(b.value));

// Função auxiliar para verificar se um campo está preenchido (similar à do EditCavity)
const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "number" && isNaN(value)) return false;
  return true;
};

export const StepOne: FC<StepComponentProps> = ({ navigation, validationAttempted }) => {
  const [cavityModalIsOpen, setCavityModalIsOpen] = useState(false);
  const dispatch = useDispatch();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const entradas = cavidade.entradas || [];
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  // selectedProject não é mais necessário aqui se o value do Select for direto do Redux
  // const [selectedProject, setSelectedProject] = useState<SelectOption | null>(null);

  const selectedUfOption = useMemo(() => {
    return ufOptions.find(opt => opt.id === cavidade.uf);
  }, [cavidade.uf]);

  const selectedProjectOption = useMemo(() => {
    return projectOptions.find(opt => opt.id === cavidade.projeto_id);
  }, [cavidade.projeto_id, projectOptions]);


  // Lógica de Erros Específicos para StepOne
  const stepOneErrors = useMemo(() => {
    if (!validationAttempted) {
      return {}; // Sem erros se a validação não foi tentada
    }
    const errors: { [key: string]: string } = {};
    const errorMsgRequired = "Este campo é obrigatório.";

    if (!isFieldFilled(cavidade.projeto_id)) {
      errors.projeto_id = errorMsgRequired;
    }
    if (!isFieldFilled(cavidade.responsavel)) {
      errors.responsavel = errorMsgRequired;
    }
    if (!isFieldFilled(cavidade.municipio)) {
      errors.municipio = errorMsgRequired;
    }
    if (!isFieldFilled(cavidade.uf)) {
      errors.uf = errorMsgRequired;
    }
    if (!isFieldFilled(cavidade.nome_sistema)) {
      errors.nome_sistema = errorMsgRequired;
    }
    if (!isFieldFilled(cavidade.nome_cavidade)) {
      errors.nome_cavidade = errorMsgRequired;
    }
    if (!Array.isArray(entradas) || entradas.length === 0) {
      errors.entradas = "Pelo menos uma entrada deve ser adicionada.";
    }
    // Adicione outras validações específicas do StepOne aqui, se necessário
    // Ex: UF e Município podem ser obrigatórios dependendo da regra de negócio.
    // if (!isFieldFilled(cavidade.uf)) {
    //   errors.uf = errorMsgRequired;
    // }
    // if (!isFieldFilled(cavidade.municipio)) {
    //   errors.municipio = errorMsgRequired;
    // }


    return errors;
  }, [validationAttempted, cavidade, entradas]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== "granted") {
        dispatch(
          showError({
            title: "Permissão da Câmera Negada",
            message: "Por favor, permita o acesso à câmera para adicionar fotos.",
          })
        );
      }
    };
    requestCameraPermission();
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects: ProjectModel[] = await fetchAllProjects();
        if (isMounted) {
          const options = projects.map((project) => ({
            id: String(project._id), // Garante que o ID é string
            value: project.nome_projeto,
          }));
          setProjectOptions(options);
          setIsLoadingProjects(false);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        if (isMounted) setIsLoadingProjects(false);
        dispatch(showError({title: "Erro ao Carregar Projetos", message: "Não foi possível buscar a lista de projetos."}))
      }
    };

    // Usar navigation.addListener não é o ideal para carregar dados em focus.
    // useFocusEffect do @react-navigation/native é melhor.
    // Mas se esta é a sua abordagem atual, mantenha-a ou considere refatorar.
    const unsubscribe = navigation.addListener("focus", () => {
        if (isMounted) loadProjects(); // Recarregar projetos ao focar na tela
    });

    loadProjects(); // Carga inicial
    return () => {
      isMounted = false;
      unsubscribe(); // Limpar o listener
    };
  }, [dispatch, navigation]); // Removido cavidade.projeto_id para evitar recargas desnecessárias ao selecionar projeto

  const handleInputChange = (path: (string | number)[], value: any) => {
    dispatch(updateCavidadeData({ path, value }));
  };

  const handleSetPrincipal = (indexToSet: number) => {
    dispatch(setEntradaPrincipal(indexToSet));
  };

  const handleDeleteEntry = (indexToRemove: number) => {
    dispatch(removeEntrada(indexToRemove));
  };

  const handleSaveEntry = (newEntry: Entrada) => {
    dispatch(addEntrada(newEntry));
    setCavityModalIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Divider />
      <Select
        placeholder={isLoadingProjects ? "Carregando projetos..." : "Selecione um projeto"}
        label="Selecione o projeto"
        required
        value={selectedProjectOption?.value || ""}
        onChangeText={(obj: SelectOption) => {
          // setSelectedProject(obj); // Não mais necessário se value vem do Redux
          handleInputChange(["projeto_id"], obj.id);
        }}
        optionsList={projectOptions}
        hasError={!!stepOneErrors.projeto_id}
        errorMessage={stepOneErrors.projeto_id}
        disabled={isLoadingProjects}
      />
      <Input
        placeholder="Digite o nome do responsável"
        label="Responsável pelo registro"
        required
        value={cavidade.responsavel || ""}
        onChangeText={(text) => handleInputChange(["responsavel"], text)}
        hasError={!!stepOneErrors.responsavel}
        errorMessage={stepOneErrors.responsavel}
      />
      <Input
        label="Nome da cavidade"
        placeholder="Digite o nome da cavidade"
        required
        value={cavidade.nome_cavidade || ""}
        onChangeText={(text) => handleInputChange(["nome_cavidade"], text)}
        hasError={!!stepOneErrors.nome_cavidade}
        errorMessage={stepOneErrors.nome_cavidade}
      />
      <Input
        label="Nome do sistema"
        placeholder="Digite o nome do sistema"
        value={cavidade.nome_sistema || ""}
        onChangeText={(text) => handleInputChange(["nome_sistema"], text)}
        required
        hasError={!!stepOneErrors.nome_sistema}
        errorMessage={stepOneErrors.nome_sistema}
        // Não há validação específica para nome_sistema em validateStep, então sem erro
      />
      <Select
        label="UF"
        placeholder="Selecione a UF"
        required
        optionsList={ufOptions}
        value={selectedUfOption?.value || ""}
        onChangeText={(selectedOption: SelectOption) => {
          handleInputChange(["uf"], selectedOption.id);
        }}
        hasError={!!stepOneErrors.uf} // Adicione se UF for obrigatório
        errorMessage={stepOneErrors.uf}
      />
      <Input
        label="Município"
        placeholder="Digite o nome do município"
        value={cavidade.municipio || ""}
        required
        onChangeText={(text) => handleInputChange(["municipio"], text)}
        hasError={!!stepOneErrors.municipio} // Adicione se Município for obrigatório
        errorMessage={stepOneErrors.municipio}
      />
      <Input
        label="Localidade"
        placeholder="Digite a localidade"
        value={cavidade.localidade || ""}
        onChangeText={(text) => handleInputChange(["localidade"], text)}
      />
      <Input
        placeholder="DD/MM/AAAA"
        label="Data"
        mask="99/99/9999"
        keyboardType="numeric"
        value={cavidade.data || ""}
        onChangeTextMask={(text) => handleInputChange(["data"], text)}
        // Não há validação específica para data em validateStep, então sem erro
      />
      <TextInter color={colors.white[100]} weight="medium">
        Entradas da Cavidade *
      </TextInter>
      {validationAttempted && !!stepOneErrors.entradas && (
        <TextInter color={colors.error[100]} fontSize={12} style={styles.errorText}>
          {stepOneErrors.entradas}
        </TextInter>
      )}
      <Divider />
      {entradas.map((item, index) => (
        <View key={index} style={styles.entryItemContainer}>
          <View style={styles.entryContent}>
            <Image
              source={{ uri: item.foto || undefined }} // Fallback para undefined se foto for null
              style={styles.entryImage}
              defaultSource={require('../../../assets/images/logo.png')} // Adicione uma imagem placeholder
            />
            <TouchableOpacity
              onPress={() => !item.principal && handleSetPrincipal(index)}
              disabled={item.principal}
              style={styles.principalButton}
            >
              <TextInter
                color={item.principal ? colors.white[100] : colors.white[80]}
                weight="medium"
                fontSize={12}
                style={{ marginRight: 10 }}
              >
                {item.principal ? 'Principal' : 'Definir como principal'}
              </TextInter>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={item.principal ? colors.accent[100] : colors.dark[70]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEntry(index)}
            >
              <Ionicons
                name="trash-sharp"
                size={24}
                color={"#F4364C"}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {entradas.length > 0 && <View style={{ height: 24 }} />}
      <LongButton
        title="Nova entrada"
        onPress={() => setCavityModalIsOpen(true)}
        leftIcon={<Ionicons name="add" size={30} color={colors.white[100]} />}
      />
      <CavityModal
        isOpen={cavityModalIsOpen}
        onClose={() => setCavityModalIsOpen(false)}
        onSave={handleSaveEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: "100%", // Removido para permitir que ScrollView controle o tamanho
    // width: "100%",  // Removido
    paddingBottom: 30,
  },
  entryItemContainer: {
    marginBottom: 15,
  },
  entryContent: {
    backgroundColor: colors.dark[80],
    height: 70,
    borderRadius: 10,
    paddingLeft: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  entryImage: {
    width: 60,
    height: 50,
    borderRadius: 5,
    backgroundColor: colors.dark[70], // Placeholder background
  },
  principalButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10, // Adicionado padding para melhor toque
    flex: 1, // Para ocupar espaço e centralizar o texto
    justifyContent: 'center'
  },
  deleteButton: {
    width: 60, // Largura fixa para o botão de deletar
    height: "100%",
    backgroundColor: colors.dark[70],
    justifyContent: "center",
    alignItems: "center",
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 8,
  },
  inputSpacing: { // Pode ser usado para Inputs se necessário
    marginBottom: 10,
  }
});

