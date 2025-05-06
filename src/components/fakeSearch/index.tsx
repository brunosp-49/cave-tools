import {
  KeyboardType,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { FC } from "react";
import { Ionicons } from "@expo/vector-icons";
import TextInter from "../textInter";
import { useAppSelector } from "../../hook";

interface SearchProps {
  placeholder: string;
  onPress: () => void;
}

export const FakeSearch: FC<SearchProps> = ({ placeholder, onPress }) => {
  const { searchCharacterization } = useAppSelector((state) => state.user);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.buttonContainer}>
          <Ionicons name="search" color={colors.dark[60]} size={22} />
        </TouchableOpacity>
        <View style={styles.input}>
          <TextInter color={colors.dark[60]} weight="medium">
            {searchCharacterization.length
              ? searchCharacterization
              : placeholder}
          </TextInter>
        </View>
      </View>
      <View style={styles.spaceContainer}></View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    width: "100%",
    justifyContent: "center",
  },
  input: {
    height: 58,
    flex: 1,
    paddingLeft: 8,
    paddingRight: 24,
    fontSize: 15,
    color: colors.white[100],
    justifyContent: "center",
  },
  inputContainer: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: colors.dark[80],
    borderRadius: 10,
  },
  spaceContainer: {
    height: 24,
    width: "100%",
    justifyContent: "center",
  },
  buttonContainer: {
    paddingLeft: 24,
  },
});
