import React, { useState, FC, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { removePointAndLines, addTopoLine } from "../../../redux/drawingSlice";
import { LongButton } from "../../../components/longButton";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import PlusIcon from "../../../components/icons/plusIcon";
import { Ionicons } from "@expo/vector-icons";
import {
  PointData,
  TopoDataLine,
  TopoLineFormData,
  StepProps,
} from "../../../types";
import { TopographyCanvas } from "../../../components/topography/topographyCanvas";
import { NextButton } from "../../../components/button/nextButton";
import { ReturnButton } from "../../../components/button/returnButton";
import { Header } from "../../../components/header";
import { Divider } from "../../../components/divider";

const calculateNewPoint = (
  startPoint: PointData,
  data: TopoLineFormData
): { x: number; y: number } => {
  const D = parseFloat(data.distancia) || 0;
  const A = parseFloat(data.azimute) || 0;
  const C = parseFloat(data.paraCima) || 0;
  const B = parseFloat(data.paraBaixo) || 0;
  const Dt = parseFloat(data.paraDireita) || 0;
  const E = parseFloat(data.paraEsquerda) || 0;

  const azimuteRad = (A * Math.PI) / 180;
  let endX = startPoint.x + D * Math.sin(azimuteRad);
  let endY = startPoint.y - D * Math.cos(azimuteRad);
  endY -= C;
  endY += B;
  endX += Dt;
  endX -= E;

  return { x: endX, y: endY };
};

const StepThree: FC<StepProps> = ({ onNext, onBack }) => {
  const dispatch = useDispatch();
  const { points, dataLines } = useSelector(
    (state: RootState) => state.drawing
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [nextPointId, setNextPointId] = useState(points.length);
  const [formData, setFormData] = useState<TopoLineFormData>({
    refDe: points.length > 0 ? points[points.length - 1].id : "0",
    refPara: "",
    distancia: "",
    azimute: "",
    inclinacao: "",
    paraCima: "",
    paraBaixo: "",
    paraDireita: "",
    paraEsquerda: "",
  });

  const handleFormChange = (field: keyof TopoLineFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPoint = useCallback(() => {
    if (!formData.refDe || !formData.distancia || !formData.azimute) {
      Alert.alert(
        "Campos Obrigatórios",
        "Os campos 'Referência (De)', 'Distância' e 'Azimute' são obrigatórios."
      );
      return;
    }
    const startPoint = points.find((p) => p.id === formData.refDe);
    if (!startPoint) {
      Alert.alert(
        "Erro",
        `Ponto de referência 'De' (${formData.refDe}) não encontrado.`
      );
      return;
    }

    const { x: endX, y: endY } = calculateNewPoint(startPoint, formData);
    const newPointId = formData.refPara || nextPointId.toString();
    const newPoint: PointData = {
      id: newPointId,
      x: endX,
      y: endY,
      label: `${newPointId}`,
    };
    const newLine: TopoDataLine = {
      points: [`M${startPoint.x},${startPoint.y}`, `L${endX},${endY}`],
      color: "#1589e5",
      type: "data_line",
      sourceData: { ...formData, refPara: newPointId },
    };
    dispatch(addTopoLine({ point: newPoint, line: newLine }));

    if (!formData.refPara) {
      setNextPointId((prev) => prev + 1);
    }
    setFormData({
      refDe: newPointId,
      refPara: "",
      distancia: "",
      azimute: "",
      inclinacao: "",
      paraCima: "",
      paraBaixo: "",
      paraDireita: "",
      paraEsquerda: "",
    });
  }, [formData, points, nextPointId, dispatch]);

  const handleRemoveLine = useCallback(
    (line: TopoDataLine) => {
      const pointIdToRemove = line.sourceData.refPara;
      Alert.alert(
        "Confirmar Exclusão",
        `Deseja remover o Ponto ${pointIdToRemove} e suas linhas?`,
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
    },
    [dispatch]
  );

  return (
    <View style={styles.main}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Header title="Desenho da Topografia" onCustomReturn={onBack} />
      </View>
      <TopographyCanvas />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <PlusIcon />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.listContainer}
              contentContainerStyle={styles.listContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formSection}>
                <TextInter
                  fontSize={18}
                  weight="medium"
                  color={colors.white[100]}
                  style={styles.sectionTitle}
                >
                  Adicionar Ponto Topográfico
                </TextInter>
                <TextInter weight="medium" style={styles.label}>
                  Referência (De)
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  value={formData.refDe}
                  placeholder="Ex: 0, 1, 2"
                  onChangeText={(text) => handleFormChange("refDe", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Referência (Para)
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 1, 2, 3 (opcional)"
                  value={formData.refPara}
                  onChangeText={(text) => handleFormChange("refPara", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Distância (metros)
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 5.2"
                  keyboardType="numeric"
                  value={formData.distancia}
                  onChangeText={(text) => handleFormChange("distancia", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Azimute (graus)
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="Ex: 90 (N=0/360, E=90)"
                  value={formData.azimute}
                  onChangeText={(text) => handleFormChange("azimute", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Inclinação (graus)
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 10"
                  keyboardType="numeric"
                  value={formData.inclinacao}
                  onChangeText={(text) => handleFormChange("inclinacao", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Para Cima
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 0.5"
                  keyboardType="numeric"
                  value={formData.paraCima}
                  onChangeText={(text) => handleFormChange("paraCima", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Para Baixo
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 0.2"
                  keyboardType="numeric"
                  value={formData.paraBaixo}
                  onChangeText={(text) => handleFormChange("paraBaixo", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Para Direita
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 0.1"
                  keyboardType="numeric"
                  value={formData.paraDireita}
                  onChangeText={(text) => handleFormChange("paraDireita", text)}
                  placeholderTextColor={colors.dark[60]}
                />
                <TextInter weight="medium" style={styles.label}>
                  Para Esquerda
                </TextInter>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 0.1"
                  keyboardType="numeric"
                  value={formData.paraEsquerda}
                  onChangeText={(text) =>
                    handleFormChange("paraEsquerda", text)
                  }
                  placeholderTextColor={colors.dark[60]}
                />
                <Divider height={15} />
                <LongButton
                  title="Adicionar Ponto"
                  leftIcon={<PlusIcon />}
                  onPress={handleAddPoint}
                />
              </View>

              <View>
                <TextInter
                  fontSize={18}
                  weight="medium"
                  color={colors.white[100]}
                  style={styles.sectionTitle}
                >
                  Pontos Criados ({dataLines.length})
                </TextInter>
                {dataLines.length > 0 ? (
                  dataLines.map((item) => (
                    <View
                      key={`line-to-${item.sourceData.refPara}`}
                      style={styles.itemContainer}
                    >
                      <View style={styles.itemTextContainer}>
                        <TextInter
                          weight="bold"
                          color={colors.white[100]}
                        >{`De: ${item.sourceData.refDe} → Para: ${item.sourceData.refPara}`}</TextInter>
                        <TextInter
                          fontSize={12}
                          color={colors.white[80]}
                        >{`Dist: ${item.sourceData.distancia}m / Az: ${item.sourceData.azimute}° / Incl: ${item.sourceData.inclinacao}°`}</TextInter>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveLine(item)}
                        style={styles.deleteButton}
                      >
                        <Ionicons
                          name="trash-sharp"
                          size={20}
                          color={colors.error[100]}
                        />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <TextInter style={styles.emptyListText}>
                    Nenhum ponto criado ainda.
                  </TextInter>
                )}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={30} color={colors.white[100]} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.buttonContainer}>
        <ReturnButton onPress={onBack} />
        <NextButton onPress={onNext} buttonTitle="Finalizar" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: colors.dark[90] },
  fab: {
    position: "absolute",
    bottom: 190,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent[100],
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
    backgroundColor: colors.dark[90],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    height: "85%",
    backgroundColor: colors.dark[90],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  closeButton: { position: "absolute", top: 10, right: 15, padding: 10 },
  listContainer: { flex: 1, marginTop: 30 },
  listContentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  formSection: { paddingBottom: 20 },
  sectionTitle: {
    marginBottom: 15,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
  },
  emptyListText: { textAlign: "center", marginTop: 20, color: colors.dark[60] },
  itemContainer: {
    backgroundColor: colors.dark[80],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTextContainer: { flex: 1, marginRight: 10 },
  deleteButton: { padding: 8 },
  label: {
    color: colors.white[100],
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.dark[80],
    color: colors.white[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.dark[70],
    marginBottom: 16,
  },
});

export default StepThree;
