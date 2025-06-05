import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../../assets/colors";
import TextInter from "../../../../components/textInter";
import CheckIcon from "../../../../components/icons/checkIcon";
import CalendarIcon from "../../../../components/icons/calendarIcon";
import { formatDate } from "../../../../util";
import Project from "../../../../db/model/project";

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onPress }) => {
  console.log({project})
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} key={project.id}>
      <View style={styles.topContainer}>
        <TextInter
          weight="medium"
          color={colors.white[100]}
          style={styles.title}
          fontSize={16}
        >
          {project.nome_projeto || "Nome Indisponível"}
        </TextInter>
        {project.uploaded && <CheckIcon />}
      </View>
      <View style={styles.bottomContainer}>
        <CalendarIcon />
        <TextInter fontSize={12} color={colors.dark[60]} style={styles.date}>
          {formatDate(project.inicio)}
        </TextInter>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark[80],
    paddingVertical: 18,
    paddingLeft: 24,
    paddingRight: 10,
    paddingTop: 10,
    borderRadius: 10,
    height: 88,
    justifyContent: "space-between",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginBottom: 2,
  },
  title: {
    marginTop: 8,
  },
  date: {
    marginLeft: 8,
  },
});
