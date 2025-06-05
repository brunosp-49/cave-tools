import type { FC } from "react"
import { ScrollView, View, FlatList, Text, StyleSheet } from "react-native"
import type { TableTopographyProps } from "../../../types"
import { colors } from "../../../assets/colors"

const TableTopography: FC<TableTopographyProps> = ({ topography }) => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Informações Topográficas
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        <View>
          <View style={[styles.headerRow]}>
            <Text style={styles.headerCell}>Referência (De)</Text>
            <Text style={styles.headerCell}>Referência (Para)</Text>
            <Text style={styles.headerCell}>Distância (m)</Text>
            <Text style={styles.headerCell}>Azimute (°)</Text>
            <Text style={styles.headerCell}>Inclinação (°)</Text>
            <Text style={styles.headerCell}>Para cima</Text>
            <Text style={styles.headerCell}>Para baixo</Text>
            <Text style={styles.headerCell}>Para direita</Text>
            <Text style={styles.headerCell}>Para esquerda</Text>
          </View>

          <View style={styles.listWrapper}>
            <FlatList
              data={topography}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={true}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.cell}>{item.from}</Text>
                  <Text style={styles.cell}>{item.to}</Text>
                  <Text style={styles.cell}>{item.distance}</Text>
                  <Text style={styles.cell}>{item.incline}</Text>
                  <Text style={styles.cell}>{item.azimuth}</Text>
                  <Text style={styles.cell}>{item.turnUp}</Text>
                  <Text style={styles.cell}>{item.turnDown}</Text>
                  <Text style={styles.cell}>{item.turnRight}</Text>
                  <Text style={styles.cell}>{item.turnLeft}</Text>
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default TableTopography;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: colors.dark[90],
    padding: 10,
    marginTop: 20,
    height: 300,
    borderColor: colors.dark[80],
    borderWidth: 1,
    width: '100%'
  },
  title: {
    color: colors.white[100],
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[80],
  },
  headerCell: {
    width: 140,
    paddingVertical: 8,
    color: colors.white[100],
    fontWeight: "bold",
    textAlign: "left",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[70],
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[80],
  },
  listWrapper: {
    maxHeight: "80%",
  },
  headerText: {
    color: colors.white[100],
    fontWeight: "bold",
    width: 140,
    textAlign: "left",
  },
  headerTextTitle: {
    fontSize: 20
  },
  cell: {
    width: 140,
    paddingVertical: 8,
    color: colors.white[100],
    textAlign: "left",
  },
});
