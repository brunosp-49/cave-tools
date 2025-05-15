import React, { useState, useEffect, FC, useRef, useMemo } from "react";
import {
  FlatList,
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
import { Entrada, ProjectModel, RouterProps } from "../../../types";
import { RootState } from "../../../redux/store";
import {
  addEntrada,
  removeEntrada,
  setEntradaPrincipal,
  updateCavidadeData,
} from "../../../redux/cavitySlice";
import { fetchAllProjects } from "../../../db/controller";
import Project from "../../../db/model/project";

interface SelectOption {
  id: string;
  value: string;
}

const ufOptions: SelectOption[] = [
  { id: 'AC', value: 'Acre' },
  { id: 'AL', value: 'Alagoas' },
  { id: 'AP', value: 'Amapá' },
  { id: 'AM', value: 'Amazonas' },
  { id: 'BA', value: 'Bahia' },
  { id: 'CE', value: 'Ceará' },
  { id: 'DF', value: 'Distrito Federal' },
  { id: 'ES', value: 'Espírito Santo' },
  { id: 'GO', value: 'Goiás' },
  { id: 'MA', value: 'Maranhão' },
  { id: 'MT', value: 'Mato Grosso' },
  { id: 'MS', value: 'Mato Grosso do Sul' },
  { id: 'MG', value: 'Minas Gerais' },
  { id: 'PA', value: 'Pará' },
  { id: 'PB', value: 'Paraíba' },
  { id: 'PR', value: 'Paraná' },
  { id: 'PE', value: 'Pernambuco' },
  { id: 'PI', value: 'Piauí' },
  { id: 'RJ', value: 'Rio de Janeiro' },
  { id: 'RN', value: 'Rio Grande do Norte' },
  { id: 'RS', value: 'Rio Grande do Sul' },
  { id: 'RO', value: 'Rondônia' },
  { id: 'RR', value: 'Roraima' },
  { id: 'SC', value: 'Santa Catarina' },
  { id: 'SP', value: 'São Paulo' },
  { id: 'SE', value: 'Sergipe' },
  { id: 'TO', value: 'Tocantins' }
].sort((a, b) => a.value.localeCompare(b.value));

export const StepOne: FC<RouterProps> = ({navigation}) => {
  const [cavityModalIsOpen, setCavityModalIsOpen] = useState(false);
  const dispatch = useDispatch();
  const cavidade = useSelector((state: RootState) => state.cavity.cavidade);
  const entradas = cavidade.entradas || [];
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<SelectOption | null>(
    null
  );

  const selectedUfOption = useMemo(() => {
    return ufOptions.find(opt => opt.id === cavidade.uf);
  }, [cavidade.uf]);

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
    let isMounted = true; // Prevent state update on unmounted component
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects: ProjectModel[] = await fetchAllProjects(); // Assuming Project type has _id and nome_projeto
        if (isMounted) {
          const options = projects.map((project) => ({
            id: String(project._id), // Use .id if available, fallback to _id
            value: project.nome_projeto,
          }));
          setProjectOptions(options);

          // If cavidade.projeto_id is already filled, find and set the selectedProject
          if (cavidade.projeto_id) {
            const current = options.find((opt) => opt.id === cavidade.projeto_id);
            if (current) setSelectedProject(current);
          }
          setIsLoadingProjects(false);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        if (isMounted) setIsLoadingProjects(false);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadProjects);

    loadProjects();
    return () => {
      isMounted = false; // Cleanup function
      unsubscribe(); // Remove focus listener
    };
  }, [cavidade.projeto_id, navigation]);

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
        placeholder="Selecione um projeto"
        label="Selecione o projeto"
        required
        value={selectedProject?.value || ""} // Display selected project name
        onChangeText={(obj: SelectOption) => {
          setSelectedProject(obj);
          handleInputChange(["projeto_id"], obj.id); // Save project ID to Redux
        }}
        optionsList={projectOptions}
      />
      <Input
        placeholder="Digite o nome do responsável"
        label="Responsável pelo registro"
        required
        value={cavidade.responsavel || ""}
        onChangeText={(text) => handleInputChange(["responsavel"], text)}
      />
      <Input
        label="Nome da cavidade"
        placeholder="Digite o nome da cavidade"
        required
        value={cavidade.nome_cavidade || ""}
        onChangeText={(text) => handleInputChange(["nome_cavidade"], text)}
      />
      <Input
        label="Nome do sistema"
        placeholder="Digite o nome do sistema"
        value={cavidade.nome_sistema || ""}
        onChangeText={(text) => handleInputChange(["nome_sistema"], text)}
      />
      <Input
        label="Município"
        placeholder="Digite o nome do município"
        value={cavidade.municipio || ""}
        onChangeText={(text) => handleInputChange(["municipio"], text)}
      />
      <Input
        label="Localidade"
        placeholder="Digite a localidade"
        value={cavidade.localidade || ""}
        onChangeText={(text) => handleInputChange(["localidade"], text)}
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
      />
      <Input
        placeholder="DD/MM/AAAA"
        label="Data"
        mask="99/99/9999"
        keyboardType="numeric"
        value={cavidade.data || ""}
        onChangeTextMask={(text) => handleInputChange(["data"], text)}
      />
      <TextInter color={colors.white[100]} weight="medium">
        Cavidades *
      </TextInter>
      <Divider />
      {entradas.map((item, index) => (
        <View key={index} style={{ marginBottom: 15 }}>
          <View
            style={{
              backgroundColor: colors.dark[80],
              height: 70,
              borderRadius: 10,
              paddingLeft: 10,
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: item.foto || undefined }}
              style={{
                width: 60,
                height: 50,
                borderRadius: 5,
              }}
            />
            <TouchableOpacity
              onPress={() => !item.principal && handleSetPrincipal(index)}
              disabled={item.principal}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <TextInter
                color={item.principal ? colors.white[100] : colors.white[80]}
                weight="medium"
                fontSize={12}
                style={{ marginRight: 10 }}
              >
                Principal
              </TextInter>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={item.principal ? colors.accent[100] : colors.dark[70]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: "20%",
                height: "100%",
                backgroundColor: colors.dark[70],
                justifyContent: "center",
                alignItems: "center",
                borderTopEndRadius: 10,
                borderBottomEndRadius: 10,
              }}
            >
              <Ionicons
                name="trash-sharp"
                size={24}
                color={"#F4364C"}
                onPress={() => handleDeleteEntry(index)}
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
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
  buttonInside: {},
});
