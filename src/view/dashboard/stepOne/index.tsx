import React, { FC, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Divider } from "../../../components/divider";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store";
import { setDashboardFilters } from "../../../redux/dashboardSlice";
import { fetchAllProjects } from "../../../db/controller";
import { ProjectModel } from "../../../types";

interface SelectOption {
    id: string;
    value: string;
}

export const StepOne: FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const filters = useSelector((state: RootState) => state.dashboard.filters);
    const [projectOptions, setProjectOptions] = useState<SelectOption[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const projects: ProjectModel[] = await fetchAllProjects();
                const options = projects.map(p => ({ id: p.projeto_id, value: p.nome_projeto }));
                setProjectOptions(options);
            } catch (error) {
                console.error("Erro ao carregar projetos para o dashboard:", error);
            } finally {
                setIsLoadingProjects(false);
            }
        };
        loadProjects();
    }, []);

    const handleFilterChange = (field: keyof typeof filters, value: any) => {
        dispatch(setDashboardFilters({ [field]: value }));
    };
    
    // Encontra o valor do projeto selecionado para exibir no Select
    const selectedProjectValue = projectOptions.find(p => p.id === filters.projetoId)?.value || '';

    return (
        <View style={styles.container}>
            <Divider />
            <Select
                placeholder={isLoadingProjects ? "Carregando..." : "Todos os projetos"}
                label="Selecione o projeto (opcional)"
                value={selectedProjectValue}
                onChangeText={(obj) => handleFilterChange('projetoId', obj ? obj.id : null)}
                optionsList={projectOptions}
                disabled={isLoadingProjects}
            />
            <Input 
                placeholder="Digite o nome da cavidade" 
                label="Nome da cavidade"
                value={filters.nomeCavidade}
                onChangeText={(text) => handleFilterChange('nomeCavidade', text)} 
            />
            <Input
                label="Código da cavidade"
                placeholder="Digite o código da cavidade"
                value={filters.codigoCavidade}
                onChangeText={(text) => handleFilterChange('codigoCavidade', text)} 
            />
            <Input 
                label="Município" 
                placeholder="Digite o nome do município"
                value={filters.municipio}
                onChangeText={(text) => handleFilterChange('municipio', text)} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingBottom: 30,
  },
});