import {
  Alert,
  Animated,
  BackHandler,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { Divider } from "../../components/divider";
import { FC, useCallback, useRef, useState } from "react";
import { RouterProps } from "../../types";
import HatManIcon from "../../components/icons/hatManIcon";
import PieChartIcon from "../../components/icons/pieChart";
import { MenuCard } from "./components/menuCard";
import BookPenIcon from "../../components/icons/bookPenIcon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { CheckProjectsModal } from "./components/checkProjectsLoadingModal";
import { setIsCheckingLoading } from "../../redux/loadingSlice";
import { Ionicons } from "@expo/vector-icons";
import { useInternetConnection } from "../../hook/useInternetConnection";
import { UploadDataModal } from "./components/modal/uploadModalData";
import { useAppSelector } from "../../hook";
import PapersIcon from "../../components/icons/papersIcon";
import { FakeBottomTab } from "../../components/fakeBottomTab";
import { StatusBar } from "expo-status-bar";

export const HomeScreen: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const { userName } = useAppSelector((state) => state.user);

  const checkingState = useSelector(
    (state: RootState) => state.loading.checkingLoading
  );
  const isConnected = useInternetConnection();

  const handleUploadSuccess = useCallback(() => {
    console.log("Upload successful on HomeScreen!");
    // Show success message
    setShowSuccessMessage(true);
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide message after a delay
    const timer = setTimeout(() => {
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessMessage(false);
      });
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, [successOpacity]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header
          disableReturn
          helloLeftComponent={
            <View>
              <TextInter color={colors.dark[60]}>👋 Olá!</TextInter>
              <TextInter fontSize={23} weight="medium" color={colors.white[90]}>
                {userName.split(" ")[0]}
              </TextInter>
            </View>
          }
          navigation={navigation}
        />
        <Divider />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Selecione o que deseja fazer:
        </TextInter>
        <Divider height={28} />
        <FlatList
          data={[
            {
              title: "Caracterização Espeleológica",
              icon: <HatManIcon />,
              id: 1,
              onPress: () => navigation.navigate("CavityScreen"),
              disabled: false,
            },
            {
              title: "Informações Topográficas",
              icon: <BookPenIcon />,
              id: 2,
              onPress: () => navigation.navigate("TopographyScreen"),
              disabled: false,
            },
            {
              title: "Dashboard",
              icon: <PieChartIcon />,
              id: 4,
              onPress: () => navigation.navigate("Dashboard"),
              disabled: false,
            },
            {
              title: "Projetos",
              icon: <PapersIcon />,
              id: 5,
              onPress: () => navigation.navigate("ProjectScreen"),
              disabled: false,
            },
            {
              title: "Enviar Dados Pendentes",
              icon: (
                <Ionicons
                  name="cloud-upload"
                  size={42}
                  color={isConnected ? colors.accent[100] : colors.accent[30]}
                  style={{ marginRight: 4 }}
                />
              ),
              id: 6,
              onPress: () => setIsUploadModalVisible(true),
              disabled: !isConnected,
            },
          ]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MenuCard
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
              disabled={item.id === 3 || !isConnected}
            />
          )}
          ItemSeparatorComponent={({}) => <Divider height={16} />}
        />
        <CheckProjectsModal
          visible={checkingState}
          navigation={navigation}
          onClose={() => dispatch(setIsCheckingLoading(false))}
        />
        <UploadDataModal
          visible={isUploadModalVisible}
          onClose={() => setIsUploadModalVisible(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </View>
      {showSuccessMessage && (
        <Animated.View
          style={[styles.successMessageContainer, { opacity: successOpacity }]}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.white[100]}
          />
          <TextInter style={styles.successMessageText}>
            Dados enviados com sucesso!
          </TextInter>
        </Animated.View>
      )}
      <FakeBottomTab onPress={() => navigation.navigate("RegisterCavity")} />
      <StatusBar style="inverted" backgroundColor={colors.dark[90]} />
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
  successMessageContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: colors.accent[100], // Success color
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successMessageText: {
    color: colors.white[100],
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});
