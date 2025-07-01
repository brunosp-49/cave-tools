import React, { useState, FC, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { colors } from "../../../assets/colors";
import TextInter from "../../../components/textInter";
import { Divider } from "../../../components/divider";
import { CavityCard } from "../../cavity/components/cavityCard";
import { database } from "../../../db";
import { Q } from "@nozbe/watermelondb";
import { useFocusEffect } from "@react-navigation/native";
import { DefaultTopographyModal } from "../../../components/modal/defaultTopographyModal";
import { updateCavityId } from "../../../redux/topographySlice";
import { Header } from "../../../components/header";
import { ReturnButton } from "../../../components/button/returnButton";
import CavityRegister from "../../../db/model/cavityRegister";
import TopographyDrawing from "../../../db/model/topography";
import { StepProps } from "../../../types";
// Note que NextButton não é usado aqui, então pode ser removido se não for usado em outro lugar no arquivo.

const StepTwo: FC<StepProps> = ({ navigation, onNext, onBack }) => {
  const dispatch = useDispatch();
  const { filter } = useSelector((state: RootState) => ({
    filter: state.topography.projectFilter,
  }));

  const [latestCavities, setLatestCavities] = useState<CavityRegister[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const fetchLatestCavities = useCallback(async () => {
    setIsLoadingCavities(true);
    try {
      const drawingsCollection = database.get<TopographyDrawing>(
        "topography_drawings"
      );
      const allDrawings = await drawingsCollection.query().fetch();
      const usedCavityIds = allDrawings.map((d) => d.cavity_id);

      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const filters = [];

      if (usedCavityIds.length > 0) {
        filters.push(Q.where("id", Q.notIn(usedCavityIds)));
      }

      if (filter.project?.id) {
        filters.push(Q.where("projeto_id", filter.project.id));
      }
      if (filter.cavity_name) {
        filters.push(
          Q.where("nome_cavidade", Q.like(`%${filter.cavity_name}%`))
        );
      }
      if (filter.state) {
        filters.push(Q.where("uf", filter.state));
      }
      if (filter.city) {
        filters.push(Q.where("municipio", Q.like(`%${filter.city}%`)));
      }

      const availableCavities = await cavityCollection
        .query(...filters)
        .fetch();
      setLatestCavities(availableCavities);
    } catch (error) {
      console.error("Error fetching available cavities:", error);
    } finally {
      setIsLoadingCavities(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetchLatestCavities();
    }, [fetchLatestCavities])
  );

  const handleCardPress = useCallback(
    (cavityId: string) => {
      dispatch(updateCavityId(cavityId));
      setIsOpenModal(true);
    },
    [dispatch]
  );

  const handleModalConfirm = () => {
    setIsOpenModal(false);
    onNext();
  };

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoadingCavities ? (
        <ActivityIndicator size="large" color={colors.accent[100]} />
      ) : (
        <TextInter color={colors.dark[60]} style={{ textAlign: "center" }}>
          Nenhuma cavidade disponível para nova topografia.
        </TextInter>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: CavityRegister }) => (
    <CavityCard cavity={item} onPress={() => handleCardPress(item.id)} />
  );

  return (
    <View style={styles.main}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header title="Selecionar Cavidade" onCustomReturn={onBack} />
      </View>
      <TextInter
        style={styles.title}
        fontSize={19}
        weight="medium"
        color={colors.white[100]}
      >
        Cavidades Disponíveis
      </TextInter>
      <FlatList
        data={latestCavities}
        style={styles.list}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Divider height={12} />}
        ListEmptyComponent={renderEmptyList}
      />

      <View style={styles.buttonContainer}>
        <ReturnButton onPress={onBack} />
      </View>

      <DefaultTopographyModal
        isOpen={isOpenModal}
        title="Iniciar Topografia"
        message="Deseja iniciar o desenho topográfico para a cavidade selecionada?"
        visibleIcon={false}
        onConfirm={handleModalConfirm}
        onClose={() => setIsOpenModal(false)}
        onCancel={() => setIsOpenModal(false)} // Adicionando onCancel para o botão secundário
        titleButtonConfirm="Sim, iniciar"
        titleButtonCancel="Cancelar"
        enableLongButton={true} // <-- PROP ADICIONADA PARA MOSTRAR O BOTÃO DE CONFIRMAR
        enableBackButton={true} // <-- PROP ADICIONADA PARA MOSTRAR O BOTÃO DE CANCELAR
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  title: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
    backgroundColor: colors.dark[90],
  },
});

export default StepTwo;
