import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ActiveTool,
  FreeDrawPath,
  PointData,
  TopoDataLine,
  ViewBox,
} from "../types";

interface DrawingState {
  points: PointData[];
  dataLines: TopoDataLine[];
  paths: FreeDrawPath[];
  currentPath: string[];
  selectedColor: string;
  history: FreeDrawPath[][];
  historyPointer: number;
  viewBox: ViewBox;
  activeTool: ActiveTool;
}

const initialState: DrawingState = {
  points: [{ id: "0", x: 0, y: 0, label: "Ponto 0" }],
  dataLines: [],
  paths: [],
  currentPath: [],
  selectedColor: "black",
  history: [[]],
  historyPointer: 0,
  viewBox: { x: 0, y: 0, width: 100, height: 100 },
  activeTool: "pan",
};

const updateHistory = (state: DrawingState) => {
  const newHistory = state.history.slice(0, state.historyPointer + 1);
  newHistory.push(state.paths);
  state.history = newHistory;
  state.historyPointer = newHistory.length - 1;
};

// Função auxiliar para cálculo geométrico
function getSqDistanceToSegment(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
) {
  const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
  if (l2 === 0) return Math.pow(p.x - v.x, 2) + Math.pow(p.y - v.y, 2);

  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.pow(p.x - projection.x, 2) + Math.pow(p.y - projection.y, 2);
}

const drawingSlice = createSlice({
  name: "drawing",
  initialState,
  reducers: {
    addTopoLine(
      state,
      action: PayloadAction<{ point: PointData; line: TopoDataLine }>
    ) {
      state.points.push(action.payload.point);
      state.dataLines.push(action.payload.line);
    },
    removePointAndLines(state, action: PayloadAction<{ pointId: string }>) {
      const { pointId } = action.payload;
      state.points = state.points.filter((p) => p.id !== pointId);
      state.dataLines = state.dataLines.filter(
        (line) => line.sourceData.refPara !== pointId
      );
    },
    setViewBox(state, action: PayloadAction<ViewBox>) {
      state.viewBox = action.payload;
    },
    setActiveTool(state, action: PayloadAction<ActiveTool>) {
      if (state.activeTool === "draw" && action.payload !== "draw") {
        state.currentPath = [];
      }
      state.activeTool = action.payload;
    },
    setSelectedColor(state, action: PayloadAction<string>) {
      state.selectedColor = action.payload;
    },
    startPath(state, action: PayloadAction<string>) {
      state.currentPath = [action.payload];
    },
    addPointToPath(state, action: PayloadAction<string>) {
      state.currentPath.push(action.payload);
    },
    endPath(state) {
      if (state.currentPath.length > 1) {
        state.paths.push({
          points: state.currentPath,
          color: state.selectedColor,
        });
        updateHistory(state);
      }
      state.currentPath = [];
    },
    erasePathsNearPoint(
      state,
      action: PayloadAction<{ x: number; y: number; tolerance: number }>
    ) {
      const { x, y, tolerance } = action.payload;
      const touchPoint = { x, y };
      const toleranceSq = Math.pow(tolerance, 2);
      let pathWasErased = false;

      const remainingPaths = state.paths.filter((path) => {
        const points = path.points.map((pStr) => {
          // --- ESTA É A LINHA CORRIGIDA ---
          // Removemos a letra e qualquer espaço antes de converter para número
          const coords = pStr.trim().substring(1).split(',').map(Number);
          return { x: coords[0], y: coords[1] };
        });

        for (let i = 0; i < points.length - 1; i++) {
          const segmentStart = points[i];
          const segmentEnd = points[i+1];
          // Se qualquer ponto for inválido, pula este segmento
          if (isNaN(segmentStart.x) || isNaN(segmentStart.y) || isNaN(segmentEnd.x) || isNaN(segmentEnd.y)) {
              continue;
          }
          const distSq = getSqDistanceToSegment(touchPoint, segmentStart, segmentEnd);
          
          if (distSq < toleranceSq) {
            pathWasErased = true;
            return false;
          }
        }
        return true;
      });

      if (pathWasErased) {
        state.paths = remainingPaths;
        updateHistory(state);
      }
    },
    undo(state) {
      if (state.historyPointer > 0) {
        state.historyPointer -= 1;
        state.paths = [...state.history[state.historyPointer]];
      }
    },
    redo(state) {
      if (state.historyPointer < state.history.length - 1) {
        state.historyPointer += 1;
        state.paths = [...state.history[state.historyPointer]];
      }
    },
    loadDrawingState(state, action: PayloadAction<DrawingState>) {
      return action.payload;
    },
    resetDrawingState: () => initialState,
  },
});

export const {
  addTopoLine,
  removePointAndLines,
  setViewBox,
  resetDrawingState,
  setActiveTool,
  startPath,
  addPointToPath,
  endPath,
  setSelectedColor,
  undo,
  redo,
  erasePathsNearPoint,
  loadDrawingState,
} = drawingSlice.actions;

export default drawingSlice.reducer;
