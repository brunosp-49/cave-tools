import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Divider } from "../../components/divider";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { colors } from "../../assets/colors";
import { RouterProps } from "../../types";
import { FC, useCallback, useEffect, useState } from "react";
import { LabelText } from "../../components/labelText";
import { database } from "../../db";
import Project from "../../db/model/project";
import { formatDate } from "../../util";
import { LongButton } from "../../components/longButton";
import { ProjectCard } from "../project/components/projectCard";
import CavityRegister from "../../db/model/cavityRegister";
import { Q } from "@nozbe/watermelondb";
import { CavityCard } from "../cavity/components/cavityCard";
import { useFocusEffect } from "@react-navigation/native";
import { DetailScreenCavity } from "../detailScreenCavity";

export const DetailScreenProject: FC<RouterProps> = ({ navigation, route }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestCavities, setLatestCavities] = useState<CavityRegister[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!route.params.projectId) {
        setError("ID do projeto não fornecido.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const projectCollection = database.collections.get<Project>("project");
        const foundProject = await projectCollection.find(
          route.params.projectId
        ); // Find by ID
        console.log({ foundProject });
        setProject(foundProject);
      } catch (err) {
        console.error("Error fetching cavity details:", err);
        setError("Erro ao carregar detalhes da cavidade.");
        setProject(null); // Clear any previous data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [route.params.projectId]);

  const handleOpenDetail = useCallback((cavityId: string) => {
    navigation.navigate("DetailScreenCavity", { cavityId });
  }, []);

  const fetchLatestCavities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingCavities(true);
    }
    console.log("Fetching latest cavities...");
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const fetchedCavities = await cavityCollection
        .query(
          Q.where("projeto_id", route.params.projectId),
          Q.sortBy("data", Q.desc)
        )
        .fetch();
      setLatestCavities(fetchedCavities);
    } catch (error) {
      console.error("Error fetching cavities:", error);
    } finally {
      if (showLoading) {
        setIsLoadingCavities(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching data...");
      fetchLatestCavities(true);
    }, [fetchLatestCavities])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("ProjectScreen");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [navigation])
  );

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
        <Header title="Erro" navigation={navigation} />
        <Divider />
        <TextInter color={colors.error[100]} style={{ marginTop: 20 }}>
          {error}
        </TextInter>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centered}>
        <Header title="Não Encontrado" navigation={navigation} />
        <Divider />
        <TextInter style={{ marginTop: 20 }}>Projeto não encontrada.</TextInter>
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

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoadingCavities ? (
        <ActivityIndicator size="large" color={colors.accent[100]} />
      ) : (
        <TextInter color={colors.dark[60]} style={{ textAlign: "center" }}>
          Nenhuma cavidade cadastrada ainda.
        </TextInter>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.main}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header
        title="Visualizar Projeto"
        navigation={navigation}
        onCustomReturn={() => navigation.navigate("ProjectScreen")}
      />
      <Divider />
      <View style={styles.container}>
        <TextInter color={colors.white[100]} fontSize={19}>
          Registro
        </TextInter>
        <Divider />
        <LabelText
          label="Nome"
          text={project.nome_projeto || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Usuário responsável"
          text={project.responsavel || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Descrição"
          text={project.descricao_projeto || "Não informado"}
        />
        <Divider />
        <LabelText
          label="Data da criação"
          text={formatDate(project.inicio) || "Não informado"}
        />
      </View>
      <Divider />
      {!project.uploaded && (
        <>
          <LongButton
            title="Editar"
            onPress={() =>
              navigation.navigate("EditProject", { projectId: project.id })
            }
          />
          <Divider />
        </>
      )}
      <TextInter fontSize={18} weight="medium" color={colors.white[100]}>
        Cavidades do projeto(salvas offline)
      </TextInter>
      <Divider />
      <FlatList
        data={latestCavities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CavityCard cavity={item} onPress={() => handleOpenDetail(item.id)} />
        )}
        ItemSeparatorComponent={() => <Divider height={12} />}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={
          latestCavities.length === 0
            ? styles.emptyListContent
            : { paddingBottom: Platform.OS === "ios" ? 110 : 84 }
        }
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.dark[50],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 25,
    backgroundColor: colors.dark[80],
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
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
