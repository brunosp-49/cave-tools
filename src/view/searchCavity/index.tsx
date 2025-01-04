import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { updateCurrentStep } from "../../redux/cavitySlice";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { Input } from "../../components/input";
import { Divider } from "../../components/divider";
import { FakeSearch } from "../../components/fakeSearch";
import { CavityCard } from "../home/components/cavityCard";
import { Search } from "../../components/search";

const SearchCavity: FC<RouterProps> = ({ navigation }) => {
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header title="Pesquisar Cavidades" navigation={navigation} />
        <Divider />
        <Search placeholder="Ficha de Caracterização" autoFocus />
        <Divider height={16} />
        <FlatList
          data={[
            { name: "Caverna Azul", date: String(new Date()), id: 1 },
            { name: "Caverna Verde", date: String(new Date()), id: 2 },
            { name: "Caverna Rochosa", date: String(new Date()), id: 3 },
          ]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CavityCard
              cavity={item}
              onPress={() => setDetailIsVisible(true)}
            />
          )}
          ItemSeparatorComponent={({}) => <Divider height={12} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchCavity;

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
