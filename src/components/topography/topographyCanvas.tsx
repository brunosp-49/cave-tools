import React, { useState, useRef, useEffect, FC } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import Svg, { Path, G, Circle, Text as SvgText } from "react-native-svg";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import {
  setViewBox,
  startPath,
  addPointToPath,
  endPath,
  setActiveTool,
  setSelectedColor,
  undo,
  redo,
  erasePathsNearPoint,
} from "../../redux/drawingSlice";
import { ActiveTool } from "../../types";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { colors } from "../../assets/colors";
import TopoInfoModal from "./components/topoInfoModal";

const { width: screenWidth } = Dimensions.get("window");
const DRAWING_COLORS = ["black", "#E53935", "#1E88E5", "#43A047", "#FDD835"];

const TOOLS: Record<
  ActiveTool,
  { library: "Ionicons" | "FontAwesome6"; name: any }
> = {
  pan: { library: "Ionicons", name: "hand-right-outline" },
  draw: { library: "Ionicons", name: "pencil-outline" },
  erase: { library: "FontAwesome6", name: "eraser" },
};

const DataPoint = ({
  cx,
  cy,
  label,
  scale = 1,
}: {
  cx: number;
  cy: number;
  label: string;
  scale?: number;
}) => (
  <G>
    <Circle
      cx={cx}
      cy={cy}
      r={6 * scale}
      fill={colors.accent[100]}
      stroke="white"
      strokeWidth={1.5 * scale}
    />
    <SvgText
      x={cx + 10 * scale}
      y={cy + 5 * scale}
      fill={"#000"}
      fontSize={14 * scale}
      fontWeight="bold"
      textAnchor="start"
    >
      {label}
    </SvgText>
  </G>
);

interface TopographyCanvasProps {
  isReadOnly?: boolean;
}

export const TopographyCanvas: FC<TopographyCanvasProps> = ({
  isReadOnly = false,
}) => {
  const dispatch = useDispatch();
  const {
    points,
    dataLines,
    paths,
    viewBox,
    activeTool,
    currentPath,
    selectedColor,
    historyPointer,
    history,
  } = useSelector((state: RootState) => state.drawing);

  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [isToolPickerVisible, setToolPickerVisible] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const activeToolRef = useRef(activeTool);
  const viewBoxRef = useRef(viewBox);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    viewBoxRef.current = viewBox;
  }, [viewBox]);

  const svgContainerLayout = useRef({ width: 1, height: 1 });
  const scale = viewBox.width / screenWidth;

  const getTransformedCoordinates = (x: number, y: number) => {
    const currentViewBox = viewBoxRef.current;
    const svgX =
      currentViewBox.x +
      (x / svgContainerLayout.current.width) * currentViewBox.width;
    const svgY =
      currentViewBox.y +
      (y / svgContainerLayout.current.height) * currentViewBox.height;
    return { x: svgX, y: svgY };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !isReadOnly &&
        (activeToolRef.current === "draw" || activeToolRef.current === "erase"),
      onMoveShouldSetPanResponder: () =>
        !isReadOnly &&
        (activeToolRef.current === "draw" || activeToolRef.current === "erase"),
      onPanResponderGrant: (evt) => {
        if (activeToolRef.current === "draw") {
          const { x, y } = getTransformedCoordinates(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY
          );
          dispatch(startPath(`M${x},${y}`));
        }
      },
      onPanResponderMove: (evt) => {
        const { x, y } = getTransformedCoordinates(
          evt.nativeEvent.locationX,
          evt.nativeEvent.locationY
        );
        if (activeToolRef.current === "draw") {
          dispatch(addPointToPath(` L${x},${y}`));
        } else if (activeToolRef.current === "erase") {
          const tolerance = 15 * scale;
          dispatch(erasePathsNearPoint({ x, y, tolerance }));
        }
      },
      onPanResponderRelease: () => {
        if (activeToolRef.current === "draw") {
          dispatch(endPath());
        }
      },
    })
  ).current;

  // Lógica para Pan (mover com 1 dedo)
  const panStart = useRef({ viewBoxX: 0, viewBoxY: 0 }).current;
  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      panStart.viewBoxX = viewBox.x;
      panStart.viewBoxY = viewBox.y;
    }
  };
  const onPanEvent = (event: any) => {
    const scaleX = viewBox.width / svgContainerLayout.current.width;
    const scaleY = viewBox.height / svgContainerLayout.current.height;
    dispatch(
      setViewBox({
        ...viewBox,
        x: panStart.viewBoxX - event.nativeEvent.translationX * scaleX,
        y: panStart.viewBoxY - event.nativeEvent.translationY * scaleY,
      })
    );
  };

  // Lógica para Pinch (zoom com 2 dedos)
  const baseViewBox = useRef(viewBox);
  const pinchFocalPoint = useRef({ x: 0, y: 0 });

  const onPinchEvent = (event: PinchGestureHandlerGestureEvent) => {
    const { scale } = event.nativeEvent;
    const newWidth = baseViewBox.current.width / scale;
    const newHeight = baseViewBox.current.height / scale;
    const focalSvgX =
      baseViewBox.current.x +
      (pinchFocalPoint.current.x / svgContainerLayout.current.width) *
        baseViewBox.current.width;
    const focalSvgY =
      baseViewBox.current.y +
      (pinchFocalPoint.current.y / svgContainerLayout.current.height) *
        baseViewBox.current.height;
    const newX = focalSvgX - (focalSvgX - baseViewBox.current.x) / scale;
    const newY = focalSvgY - (focalSvgY - baseViewBox.current.y) / scale;
    dispatch(
      setViewBox({ x: newX, y: newY, width: newWidth, height: newHeight })
    );
  };

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      baseViewBox.current = viewBoxRef.current;
      pinchFocalPoint.current = {
        x: event.nativeEvent.focalX,
        y: event.nativeEvent.focalY,
      };
    }
  };

  const handleColorSelect = (color: string) => {
    dispatch(setSelectedColor(color));
    setColorPickerVisible(false);
  };

  const handleToolSelect = (tool: ActiveTool) => {
    dispatch(setActiveTool(tool));
    setToolPickerVisible(false);
  };

  const ToolIcon = ({
    tool,
    color,
    size = 28,
  }: {
    tool: ActiveTool;
    color: string;
    size?: number;
  }) => {
    const { library, name } = TOOLS[tool];
    if (library === "FontAwesome6") {
      return <FontAwesome6 name={name} size={size * 0.8} color={color} />;
    }
    return <Ionicons name={name} size={size} color={color} />;
  };

  return (
    <View style={styles.canvasContainer}>
      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}
        enabled={!isListModalOpen && (isReadOnly || activeTool === "pan")}
      >
        <PanGestureHandler
          enabled={!isListModalOpen && (isReadOnly || activeTool === "pan")}
          onGestureEvent={onPanEvent}
          onHandlerStateChange={onPanStateChange}
          minPointers={1}
          maxPointers={1}
        >
          <View
            style={styles.svgContainer}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              svgContainerLayout.current.width = layout.width;
              svgContainerLayout.current.height = layout.height;
              if (viewBox.width === 100) {
                dispatch(
                  setViewBox({
                    x: -layout.width / 2,
                    y: -layout.height / 2,
                    width: layout.width,
                    height: layout.height,
                  })
                );
              }
            }}
            {...(!isReadOnly && activeTool !== "pan"
              ? panResponder.panHandlers
              : {})}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            >
              <G>
                {dataLines.map((line, index) => (
                  <Path
                    key={`line-${index}`}
                    d={line.points.join("")}
                    stroke={line.color}
                    strokeWidth={2 * scale}
                    fill="none"
                  />
                ))}
                {paths.map((path, index) => (
                  <Path
                    key={`path-${index}`}
                    d={path.points.join("")}
                    stroke={path.color}
                    strokeWidth={2.5 * scale}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {currentPath.length > 0 && (
                  <Path
                    d={currentPath.join("")}
                    stroke={selectedColor}
                    strokeWidth={2.5 * scale}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {points.map((point) => (
                  <DataPoint
                    key={`point-${point.id}`}
                    cx={point.x}
                    cy={point.y}
                    label={point.label}
                    scale={scale}
                  />
                ))}
              </G>
            </Svg>
          </View>
        </PanGestureHandler>
      </PinchGestureHandler>

      {!isReadOnly && (
        <>
          {isToolPickerVisible && (
            <View style={styles.toolPickerContainer}>
              {Object.keys(TOOLS).map((toolKey) => {
                const tool = toolKey as ActiveTool;
                return (
                  <TouchableOpacity
                    key={tool}
                    onPress={() => handleToolSelect(tool)}
                    style={[
                      styles.toolButton,
                      activeTool === tool && styles.activeToolButton,
                    ]}
                  >
                    <ToolIcon
                      tool={tool}
                      color={activeTool === tool ? colors.accent[100] : "#333"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {isColorPickerVisible && (
            <View style={styles.colorPickerContainer}>
              {DRAWING_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => handleColorSelect(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                />
              ))}
            </View>
          )}

          <View style={styles.toolbar}>
            <TouchableOpacity
              onPress={() => setToolPickerVisible(!isToolPickerVisible)}
              style={styles.toolButton}
            >
              <ToolIcon tool={activeTool} color={"#333"} />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={() => setColorPickerVisible(!isColorPickerVisible)}
              style={[
                styles.mainColorButton,
                { backgroundColor: selectedColor },
              ]}
            />
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={() => dispatch(undo())}
              style={styles.toolButton}
              disabled={historyPointer === 0}
            >
              <Ionicons
                name="arrow-undo-outline"
                size={24}
                color={historyPointer === 0 ? "#999" : "#333"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => dispatch(redo())}
              style={styles.toolButton}
              disabled={historyPointer >= history.length - 1}
            >
              <Ionicons
                name="arrow-redo-outline"
                size={24}
                color={historyPointer >= history.length - 1 ? "#999" : "#333"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
      <TopoInfoModal
        visible={isListModalOpen}
        isReadOnly={isReadOnly}
        onClose={() => setIsListModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  svgContainer: {
    flex: 1,
  },
  toolbar: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toolButton: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeToolButton: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderRadius: 15,
  },
  mainColorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    marginHorizontal: 10,
  },
  colorPickerContainer: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    flexDirection: "row",
    elevation: 11,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toolPickerContainer: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 11,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: colors.accent[100],
    transform: [{ scale: 1.1 }],
  },
  separator: {
    width: 1,
    height: "60%",
    backgroundColor: "#E0E0E0",
  },
  listButtonView: {
    position: "absolute",
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent[100],
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  listButton: {
    position: "absolute",
    bottom: 90,
    left: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent[100],
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});
