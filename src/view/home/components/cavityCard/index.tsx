import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../../assets/colors";
import TextInter from "../../../../components/textInter";
import CheckIcon from "../../../../components/icons/checkIcon";
import CalendarIcon from "../../../../components/icons/calendarIcon";
import { formatDate } from "../../../../util";
import { Divider } from "../../../../components/divider";

interface CavityCardProps {
  cavity: {
    name: string;
    date: string;
    id: number;
  };
  onPress: () => void;
}

export const CavityCard: React.FC<CavityCardProps> = ({ cavity, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.containerLeft}>
        <TextInter weight="medium" color={colors.white[100]}>
          {cavity.name}
        </TextInter>
        <Divider height={8} />
        <View style={styles.dateContainer}>
          <CalendarIcon />
          <Text>{"  "}</Text>
          <TextInter fontSize={13} weight="regular" color={colors.dark[60]}>
            {formatDate(cavity.date)}
          </TextInter>
        </View>
      </View>
      <View style={styles.containerRight}>
        <CheckIcon />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 88,
    backgroundColor: colors.dark[80],
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  containerLeft: {
    height: "100%",
    width: "80%",
    justifyContent: "center",
    paddingLeft: 14,
  },
  containerRight: {
    alignItems: "flex-end",
    height: "100%",
    width: "20%",
  },
  dateContainer: {
    flexDirection: "row",
  },
});
