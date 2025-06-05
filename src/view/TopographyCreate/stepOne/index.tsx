import React, { FC, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateProjectFilter, type ProjectFilter, } from "../../../redux/topographySlice";
import { StepComponentProps } from "../../editCavity";
import { colors } from "../../../assets/colors";
import { Input } from "../../../components/input";
import { Select } from "../../../components/select";
import { showError } from "../../../redux/loadingSlice";
import type { ProjectModel } from "../../../types";
import { fetchAllProjects } from "../../../db/controller";

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

const StepOne: FC<StepComponentProps> = ({ navigation, validationAttempted }) => {
  const dispatch = useDispatch();
  const projectFilter = useSelector((state: RootState) => state.topography.projectFilter) as ProjectFilter;
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);

  const handleProjectFilterChange = useCallback(
    (field: keyof ProjectFilter, value: any) => {
      dispatch(
        updateProjectFilter({
          ...projectFilter,
          [field]: value,
        })
      );
    },
    [dispatch, projectFilter]
  );

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
        dispatch(showError({ title: "Erro ao Carregar Projetos", message: "Não foi possível buscar a lista de projetos." }))
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      if (isMounted) loadProjects();
    });

    loadProjects();
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={styles.body}>
          <Select
            placeholder={isLoadingProjects ? "Carregando projetos..." : "Selecione um projeto"}
            label="Selecione o projeto"
            value={projectFilter.project.value}
            onChangeText={(obj: SelectOption) => handleProjectFilterChange('project', obj)}
            optionsList={projectOptions}
            disabled={isLoadingProjects}
          />
          <Input
            label="Nome da Cavidade"
            placeholder="Digite o nome da cavidade"
            value={projectFilter.cavity_name}
            onChangeText={text => handleProjectFilterChange('cavity_name', text)}
          />
          <Input
            label="Código da Cavidade"
            placeholder="Digite o código da cavidade"
            keyboardType="numeric"
            value={projectFilter.cavity_id.toString()}
            onChangeText={text => handleProjectFilterChange('cavity_id', text)}
          />
          <Select
            label="UF"
            placeholder="Selecione a UF"
            optionsList={ufOptions}
            value={projectFilter.state || ""}
            onChangeText={(selectedOption: SelectOption) => {
              handleProjectFilterChange('state', selectedOption.id);
            }}
          />
          <Input
            label="Município"
            placeholder="Digite o nome do município"
            value={projectFilter.city}
            onChangeText={text => handleProjectFilterChange('city', text)}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default StepOne;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 30,
    paddingVertical: 30
  },
  body: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
  },
});