import React, { useState, FC, useCallback } from "react";
import { View, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { StepComponentProps } from "../../editCavity";
import { colors } from "../../../assets/colors";
import TextInter from "../../../components/textInter";
import { Divider } from "../../../components/divider";
import { CavityCard } from "../../cavity/components/cavityCard";
import type CavityRegister from "../../../db/model/cavityRegister";
import { database } from "../../../db";
import { Q } from "@nozbe/watermelondb";
import { useFocusEffect } from "@react-navigation/native";
import { DefaultTopographyModal } from "../../../components/modal/defaultTopographyModal";
import { updateCavityId, updateCurrentStep } from "../../../redux/topographySlice";

const StepTwo: FC<StepComponentProps> = ({ navigation, validationAttempted }) => {
  const dispatch = useDispatch();
  const { topography, currentStep, mode, filter } = useSelector((state: RootState) => ({
    topography: state.topography.cavity_id,
    filter: state.topography.projectFilter,
    currentStep: state.topography.currentStep,
    mode: state.topography.mode
  }));
  const [latestCavities, setLatestCavities] = useState<any[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const fetchLatestCavities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingCavities(true);
    }
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");

      const filters = [];
      if (filter.project?.value) {
        filters.push(Q.where('projeto_id', filter.project.value));
      }
      if (filter.cavity_name) {
        filters.push(Q.where('nome_cavidade', Q.like(`%${filter.cavity_name}%`)));
      }
      // if (filter.cavity_id) {
      //   filters.push(Q.where('cavity_id', filter.cavity_id));
      // }
      if (filter.state) {
        filters.push(Q.where('uf', filter.state));
      }
      if (filter.city) {
        filters.push(Q.where('municipio', filter.city));
      }

      const fetchedCavities = await cavityCollection.query(
        ...filters,
      ).fetch();
      setLatestCavities(fetchedCavities);
    } catch (error) {
      console.error("Error fetching cavities:", error);
    } finally {
      if (showLoading) {
        setIsLoadingCavities(false);
      }
    }
  }, []);

  const handleOpenDetail = useCallback((cavityId: string) => {
    dispatch(updateCavityId(cavityId));

    if (mode === 'view') {
      navigation.navigate('TopographyDetailScreen');
      return;
    }

    setIsOpenModal(!isOpenModal)
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchLatestCavities(true);
      return () => { };
    }, [fetchLatestCavities])
  );

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoadingCavities ? (
        <ActivityIndicator size="large" color={colors.accent[100]} />
      ) : (
        <TextInter color={colors.dark[60]} style={{ textAlign: "center" }}>
          Nenhuma cavidade encontrada.
        </TextInter>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.main}>
      <Divider height={20} />
      <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
        Cavidades encontradas
      </TextInter>
      <Divider height={10} />

      <View>
        <FlatList
          data={latestCavities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CavityCard
              cavity={item}
              onPress={() => handleOpenDetail(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <Divider height={12} />}
          ListEmptyComponent={renderEmptyList}
          scrollEnabled={false}
        />
      </View>
      <DefaultTopographyModal
        title="Inserção de informações topográficas"
        message="Existe um dispositivo Bluetooth contectado a este celular. Deseja importar os dados para preenchimento das informações topográficas? Caso não deseje inserir por Bluetooth, poderá inserir as informações por meio de planilha .xls ou manualmente."
        isOpen={isOpenModal}
        visibleIcon={false}
        onConfirm={() => {
          dispatch(updateCurrentStep(currentStep + 1));
          setIsOpenModal(!isOpenModal)
        }}
        onClose={() => setIsOpenModal(!isOpenModal)}
        titleButtonConfirm="Cadastrar manualmente"
        titleButtonCancel="Voltar por enquanto"
        enableLongButton={true}
      />
    </SafeAreaView>
  )
}

export default StepTwo;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    width: '100%',
    height: 'auto'
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  }
});