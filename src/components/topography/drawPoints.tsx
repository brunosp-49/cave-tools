import { useMemo, useState, FC } from "react";
import type { TopographyPoint } from "../../types";
import { Modal, SafeAreaView, TouchableOpacity, View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Line } from "react-native-svg";
import WideScreenIcon from "../icons/wideScreen";
import { colors } from "../../assets/colors";
import PlusIcon from "../icons/plusIcon";
import MinusIcon from "../icons/minusIcon";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SVG_PREVIEW_HEIGHT = 200;
const INITIAL_POINT = { x: SVG_PREVIEW_HEIGHT / 2, y: SVG_PREVIEW_HEIGHT / 2 };

type LineCoords = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

interface DrawPointsProps {
  topographies: TopographyPoint[];
  hiddenButtons?: boolean;
}

const DrawPoints: FC<DrawPointsProps> = ({ topographies, hiddenButtons }) => {
  const [scale, setScale] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);

  const lines = useMemo<LineCoords[]>(() => {
    let prevX = INITIAL_POINT.x;
    let prevY = INITIAL_POINT.y;

    return topographies.sort((a, b) => a.from - b.from).map((pt) => {
      const effectiveInclineDeg = pt.incline + pt.turnUp - pt.turnDown;
      const inclineRad = (effectiveInclineDeg * Math.PI) / 180;

      const effectiveAzimuthDeg = pt.azimuth + pt.turnRight - pt.turnLeft;
      const azRad = (effectiveAzimuthDeg * Math.PI) / 180;

      const horizontalDistance = pt.distance * Math.cos(inclineRad);

      const deltaX_m = horizontalDistance * Math.sin(azRad);
      const deltaY_m = horizontalDistance * Math.cos(azRad) * -1;

      const dxPx = deltaX_m * scale;
      const dyPx = deltaY_m * scale;

      const x1 = prevX;
      const y1 = prevY;
      const x2 = prevX + dxPx;
      const y2 = prevY + dyPx;

      prevX = x2;
      prevY = y2;

      return { x1, y1, x2, y2 };
    });
  }, [topographies, scale]);
  const zoomIn = () => setScale((prev) => prev * 1.2);
  const zoomOut = () => setScale((prev) => prev / 1.2);
  const openFullscreen = () => setModalVisible(true);
  const closeFullscreen = () => setModalVisible(false);

  return (
    <SafeAreaView>
      <Svg
        width={'100%'}
        height={SVG_PREVIEW_HEIGHT}
        fill={'#000'}
        color={'#000'}
        style={styles.svg}
      >
        {lines.map((line, idx) => (
          <Line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="red"
            strokeWidth={1}
          />
        ))}
      </Svg>

      {!hiddenButtons && (
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <PlusIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <MinusIcon />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={openFullscreen}>
            <WideScreenIcon />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeFullscreen}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svgFullscreen}>
            {lines.map((line, idx) => (
              <Line
                key={idx}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="red"
                strokeWidth={4}
              />
            ))}
          </Svg>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

export default DrawPoints;


const styles = StyleSheet.create({
  svg: {
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 20,
  },
  zoomContainer: {
    alignItems: "center",
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8
  },
  zoomButton: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.dark[60],
    alignItems: "center",
    textAlign: 'center',
    justifyContent: "center",
    marginVertical: 8,
  },
  zoomText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 24,
    alignSelf: 'center'
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.dark[90],
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark[60],
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  closeText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 24,
  },
  svgFullscreen: {
    marginTop: 80,
    backgroundColor: "white",
  },
});
