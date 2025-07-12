import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TextInter from "../../../textInter";
import { colors } from "../../../../assets/colors";
import { RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { TopoDataLine } from "../../../../types";
import { removePointAndLines } from "../../../../redux/drawingSlice";

interface TopoInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onEditPoint?: (line: TopoDataLine) => void;
  onDeletePoint?: (line: TopoDataLine) => void;
  isReadOnly?: boolean;
}

const columns = [
  { key: "refDe", title: "Referência (De)", width: 120 },
  { key: "refPara", title: "Referência (Para)", width: 120 },
  { key: "distancia", title: "Distância (m)", width: 110 },
  { key: "azimute", title: "Azimute (°)", width: 100 },
  { key: "inclinacao", title: "Inclinação (°)", width: 110 },
  { key: "paraCima", title: "Para cima", width: 100 },
  { key: "paraBaixo", title: "Para baixo", width: 100 },
  { key: "paraDireita", title: "Para direita", width: 100 },
  { key: "paraEsquerda", title: "Para esquerda", width: 110 },
  { key: "actions", title: "Ações", width: 100 },
];

const TopoInfoModal: React.FC<TopoInfoModalProps> = ({
  visible,
  onClose,
  onDeletePoint,
  onEditPoint,
  isReadOnly = false,
}) => {
  const { dataLines } = useSelector((state: RootState) => state.drawing);
  const dispatch = useDispatch();

  const handleRemoveLine = (line: TopoDataLine) => {
    const pointIdToRemove = line.sourceData.refPara;
    Alert.alert(
      "Remover Ponto",
      `Tem certeza que deseja remover a linha para o Ponto ${pointIdToRemove}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () =>
            dispatch(removePointAndLines({ pointId: pointIdToRemove })),
        },
      ]
    );
  };

  const TableRow = ({
    item,
    isHeader = false,
  }: {
    item?: TopoDataLine;
    isHeader?: boolean;
  }) => (
    <View style={isHeader ? styles.tableHeader : styles.tableRow}>
      {columns.map((col) => {
        if (col.key === "actions" && !isHeader && item && !isReadOnly) {
          return (
            <View
              key={col.key}
              style={[styles.cell, styles.actionCell, { width: col.width }]}
            >
              <TouchableOpacity
                onPress={() => onEditPoint && onEditPoint(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.accent[100] },
                ]}
              >
                <Ionicons name="pencil" size={20} color={colors.white[100]} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDeletePoint && onDeletePoint(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.error[100] },
                ]}
              >
                <Ionicons
                  name="trash-sharp"
                  size={20}
                  color={colors.white[100]}
                />
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <TextInter
            key={col.key}
            style={[styles.cell, { width: col.width }]}
            weight={isHeader ? "bold" : "regular"}
            color={isHeader ? colors.white[100] : colors.white[80]}
            numberOfLines={1}
          >
            {isHeader
              ? col.title
              : item?.sourceData[col.key as keyof typeof item.sourceData]}
          </TextInter>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.headerModalStyle}>
            <TextInter color={colors.white[100]} fontSize={18} weight="bold">
              Informações Topográficas
            </TextInter>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={30} color={colors.white[100]} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal>
            <View>
              <TableRow isHeader />
              <ScrollView nestedScrollEnabled={true}>
                {dataLines.length > 0 ? (
                  dataLines.map((item, index) => (
                    <TableRow key={index} item={item} />
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <TextInter style={styles.emptyListText}>
                      Nenhum ponto criado ainda.
                    </TextInter>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "60%",
    width: "100%",
    backgroundColor: colors.dark[90],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
  },
  headerModalStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[70],
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[70],
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: colors.dark[90],
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark[80],
    paddingLeft: 20,
    height: 52,
  },
  cell: {
    fontSize: 14,
    textAlign: "left",
    paddingRight: 10,
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 50,
    width: columns.reduce((acc, col) => acc + col.width, 0),
    alignItems: "flex-start",
    paddingLeft: Dimensions.get("window").width * 0.24,
  },
  emptyListText: {
    color: colors.dark[60],
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
  },
  actionButton: {
    paddingHorizontal: 8,
    borderRadius: 6,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TopoInfoModal;
