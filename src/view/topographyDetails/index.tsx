import {
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { FC, useEffect, useState } from "react";
import { RouterProps, type TopographyData, type TopographyPoint } from "../../types";
import { Divider } from "../../components/divider";
import { useDispatch, useSelector } from "react-redux";
import { FakeBottomTab } from "../../components/fakeBottomTab";
import { fetchAllTopographies } from "../../db/controller";
import { showError } from "../../redux/loadingSlice";
import DrawPoints from "../../components/topography/drawPoints";
import type { RootState } from "../../redux/store";
import TableTopography from "./components/tableTopography";

export const TopographyDetailScreen: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [topographyOptions, setTopographyOptions] = useState<TopographyPoint[]>([]);
  const {
    cavity_id,
  } = useSelector((state: RootState) => ({
    cavity_id: state.topography.cavity_id,
  }));

  useEffect(() => {
    let isMounted = true;
    const loadTopographyPoint = async () => {
      try {
        const topographies: TopographyData[] = await fetchAllTopographies();
        console.log(topographies)
        if (isMounted) {
          const options: TopographyPoint[] = topographies.filter(topo => topo.cavity_id === cavity_id).map((topo) => ({
            cavity_id: topo.cavity_id,
            from: topo.from,
            to: topo.to,
            distance: topo.distance,
            azimuth: topo.azimuth,
            incline: topo.incline,
            turnUp: topo.turnUp,
            turnDown: topo.turnDown,
            turnRight: topo.turnRight,
            turnLeft: topo.turnLeft,
          }));
          setTopographyOptions(options);
        }
      } catch (error) {
        console.error("Failed to load projects", error);
        dispatch(showError({ title: "Erro ao Carregar Topografias", message: "Não foi possível buscar a lista de projetos." }))
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      if (isMounted) loadTopographyPoint();
    });

    loadTopographyPoint();
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header title="Topografia" navigation={navigation} onCustomReturn={() => navigation.goBack()} />
        <Divider height={12} />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Visualizar informação topográfica
        </TextInter>
        <Divider height={8} />

        <DrawPoints hiddenButtons={true} topographies={topographyOptions} />

        <TableTopography topography={topographyOptions} />
      </View>
      <FakeBottomTab onPress={() => navigation.navigate("RegisterCavity")} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
});
