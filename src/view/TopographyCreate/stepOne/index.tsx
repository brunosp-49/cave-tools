import React, { FC, useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { colors } from "../../../assets/colors";
import { Input } from "../../../components/input";
import { Select } from "../../../components/select";
import { showError } from "../../../redux/loadingSlice";
import type { ProjectModel, StepProps } from "../../../types";
import { fetchAllProjects } from "../../../db/controller";
import {
  ProjectFilter,
  updateProjectFilter,
} from "../../../redux/topographySlice";
import { Header } from "../../../components/header";
import { NextButton } from "../../../components/button/nextButton";
import { ReturnButton } from "../../../components/button/returnButton";

interface SelectOption {
  id: string;
  value: string;
}

const ufOptions: SelectOption[] = [
  { id: "AC", value: "Acre" },
  { id: "AL", value: "Alagoas" },
  { id: "AP", value: "Amapá" },
  { id: "AM", value: "Amazonas" },
  { id: "BA", value: "Bahia" },
  { id: "CE", value: "Ceará" },
  { id: "DF", value: "Distrito Federal" },
  { id: "ES", value: "Espírito Santo" },
  { id: "GO", value: "Goiás" },
  { id: "MA", value: "Maranhão" },
  { id: "MT", value: "Mato Grosso" },
  { id: "MS", value: "Mato Grosso do Sul" },
  { id: "MG", value: "Minas Gerais" },
  { id: "PA", value: "Pará" },
  { id: "PB", value: "Paraíba" },
  { id: "PR", value: "Paraná" },
  { id: "PE", value: "Pernambuco" },
  { id: "PI", value: "Piauí" },
  { id: "RJ", value: "Rio de Janeiro" },
  { id: "RN", value: "Rio Grande do Norte" },
  { id: "RS", value: "Rio Grande do Sul" },
  { id: "RO", value: "Rondônia" },
  { id: "RR", value: "Roraima" },
  { id: "SC", value: "Santa Catarina" },
  { id: "SP", value: "São Paulo" },
  { id: "SE", value: "Sergipe" },
  { id: "TO", value: "Tocantins" },
].sort((a, b) => a.value.localeCompare(b.value));

const StepOne: FC<StepProps> = ({ navigation, onNext, onBack }) => {
  const dispatch = useDispatch();
  const projectFilter = useSelector(
    (state: RootState) => state.topography.projectFilter
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);

  const handleProjectFilterChange = useCallback(
    (field: keyof ProjectFilter, value: any) => {
      dispatch(updateProjectFilter({ [field]: value }));
    },
    [dispatch]
  );

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projects: ProjectModel[] = await fetchAllProjects();
        if (isMounted) {
          const options = projects.map((project) => ({
            // --- CORREÇÃO AQUI ---
            // Usamos o 'projeto_id' que é a referência correta, em vez do '_id' interno.
            id: project.projeto_id,
            value: project.nome_projeto,
          }));
          setProjectOptions(options);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        dispatch(
          showError({
            title: "Erro ao Carregar Projetos",
            message: "Tente novamente mais tarde.",
          })
        );
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <View style={styles.main}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Criar Topografia" onCustomReturn={onBack} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Select
          placeholder={
            isLoadingProjects ? "Carregando..." : "Selecione um projeto"
          }
          label="Selecione o projeto"
          value={projectFilter.project?.value || ""}
          onChangeText={(obj: SelectOption) =>
            handleProjectFilterChange("project", obj)
          }
          optionsList={projectOptions}
          disabled={isLoadingProjects}
        />
        <Input
          label="Nome da Cavidade"
          placeholder="Digite o nome da cavidade"
          value={projectFilter.cavity_name}
          onChangeText={(text) =>
            handleProjectFilterChange("cavity_name", text)
          }
        />
        <Input
          label="Código da Cavidade"
          placeholder="Digite o código da cavidade"
          keyboardType="numeric"
          value={projectFilter.cavity_id.toString()}
          onChangeText={(text) => handleProjectFilterChange("cavity_id", text)}
        />
        <Select
          label="UF"
          placeholder="Selecione a UF"
          optionsList={ufOptions}
          value={projectFilter.state || ""}
          onChangeText={(opt: SelectOption) =>
            handleProjectFilterChange("state", opt.id)
          }
        />
        <Input
          label="Município"
          placeholder="Digite o nome do município"
          value={projectFilter.city}
          onChangeText={(text) => handleProjectFilterChange("city", text)}
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <ReturnButton onPress={onBack} buttonTitle="Cancelar" />
        <NextButton onPress={onNext} buttonTitle="Continuar" />
      </View>
    </View>
  );
};

export default StepOne;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.dark[90],
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
    backgroundColor: colors.dark[90],
  },
});
