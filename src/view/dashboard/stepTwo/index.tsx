import React, { FC, useMemo, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  GestureResponderEvent,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Collapse } from "../../../components/collapse";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { Cavidade, Padrao_planimetrico_predominante } from "../../../types";

// Tipo para os dados do tooltip, incluindo coordenadas
interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: number;
  percentage: string;
  color: string;
}

const PIE_CHART_COLORS = [
  "#25A0E2",
  "#1A6E9C",
  "#5DAEE4",
  "#175C81",
  "#85C6EB",
  "#238dc8",
  "#1f7bad",
  "#144A68",
  "#A8D8F0",
  "#0F334D",
];

// Componente customizad

export const StepTwo: FC = () => {
  const { filteredCavities } = useSelector(
    (state: RootState) => state.dashboard
  );

  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const touchPosition = useRef({ x: 0, y: 0 });

  const dataPorMunicipio = useMemo(() => {
    if (!filteredCavities.length) return [];
    const counts = filteredCavities.reduce((acc, cavidade) => {
      const municipio = cavidade.municipio || "Não informado";
      acc[municipio] = (acc[municipio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, count], index) => ({
      value: count,
      label: name,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));
  }, [filteredCavities]);

  const dataDevLinear = useMemo(() => {
    if (!filteredCavities.length) return [];
    const ranges = {
      "0-5m": 0,
      "5.1-10m": 0,
      "10.1-15m": 0,
      "15.1-20m": 0,
      ">20.1m": 0,
    };
    filteredCavities.forEach((cavidade) => {
      const dev = parseFloat(String(cavidade.desenvolvimento_linear));
      if (isNaN(dev)) return;
      if (dev >= 0 && dev <= 5) ranges["0-5m"]++;
      else if (dev >= 5.1 && dev <= 10) ranges["5.1-10m"]++;
      else if (dev >= 10.1 && dev <= 15) ranges["10.1-15m"]++;
      else if (dev >= 15.1 && dev <= 20) ranges["15.1-20m"]++;
      else if (dev >= 20.1) ranges[">20.1m"]++;
    });
    return Object.entries(ranges).map(([name, count], index) => ({
      value: count,
      label: name,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));
  }, [filteredCavities]);

  const dataJurisdicao = useMemo(() => {
    if (!filteredCavities.length) return [];
    const counts = {
      "Nenhuma/Não se aplica": 0,
      Federal: 0,
      Estadual: 0,
      Municipal: 0,
    };
    filteredCavities.forEach((cavidade) => {
      const area = cavidade.aspectos_socioambientais?.area_protegida;
      if (area?.federal) counts.Federal++;
      else if (area?.estadual) counts.Estadual++;
      else if (area?.municipal) counts.Municipal++;
      else counts["Nenhuma/Não se aplica"]++;
    });
    return Object.entries(counts).map(([name, count]) => ({
      value: count,
      label: name,
    }));
  }, [filteredCavities]);

  const dataGrupoLitologico = useMemo(() => {
    if (!filteredCavities.length) return [];
    const counts = filteredCavities.reduce((acc, cavidade) => {
      const grupo_litologico =
        cavidade.caracterizacao_interna?.grupo_litologico;
      let category = "Outro";
      if (grupo_litologico) {
        if (grupo_litologico.rochas_carbonaticas) category = "Carbonáticas";
        else if (grupo_litologico.rochas_ferriferas_ferruginosas)
          category = "Ferríferas";
        else if (grupo_litologico.rochas_siliciclasticas)
          category = "Siliciclásticas";
        else if (grupo_litologico.rochas_peliticas) category = "Pelíticas";
        else if (grupo_litologico.rochas_granito_gnaissicas)
          category = "Granito-gnáissicas";
      }
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({
      value: count,
      label: name.length > 15 ? `${name.substring(0, 12)}...` : name,
    }));
  }, [filteredCavities]);

  const dataDevPredominante = useMemo(() => {
    if (!filteredCavities.length) return [];
    const counts = filteredCavities.reduce((acc, cavidade) => {
      const padrao = cavidade.morfologia?.padrao_planimetrico;
      let category = "Não informado";
      if (padrao) {
        const foundKey = Object.keys(padrao).find(
          (key) =>
            padrao[key as keyof Padrao_planimetrico_predominante] === true
        );
        if (foundKey)
          category = foundKey.charAt(0).toUpperCase() + foundKey.slice(1);
      }
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count], index) => ({
      value: count,
      label: name,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
    }));
  }, [filteredCavities]);

  if (filteredCavities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TextInter color={colors.white[80]}>
          Nenhum dado encontrado para os filtros aplicados.
        </TextInter>
      </View>
    );
  }

  const renderPieChart = (
    title: string,
    data: { value: number; color: string; label: string }[]
  ) => {
    const seriesData = data.filter((d) => d.value > 0);
    if (seriesData.length === 0) {
      return (
        <Collapse title={title}>
          <TextInter style={styles.noDataText}>
            Sem dados para este gráfico
          </TextInter>
        </Collapse>
      );
    }

    const totalForChart = seriesData.reduce((sum, item) => sum + item.value, 0);

    return (
      <Collapse title={title}>
        <View style={styles.chartWrapper}>
          <PieChart
            data={seriesData}
            donut
            backgroundColor={colors.dark[90]}
            radius={120}
            innerRadius={70}
            showTooltip
            tooltipComponent={(item: any) => {
              const base = seriesData[item];
              const percentage = ((base.value / totalForChart) * 100).toFixed(
                1
              );
              return (
                <View style={styles.tooltipContainer}>
                  <View
                    style={[
                      styles.tooltipColor,
                      { backgroundColor: base.color },
                    ]}
                  />
                  <Divider height={5} />
                  <TextInter weight="bold" color={colors.white[100]}>
                    {base.label}
                  </TextInter>
                  <Divider height={5} />
                  <TextInter color={colors.white[80]}>
                    {`Quant: ${base.value}`}
                  </TextInter>
                  <TextInter color={colors.white[80]}>
                    {`(${percentage}%)`}
                  </TextInter>
                </View>
              );
            }}
          />
        </View>
      </Collapse>
    );
  };

  const renderBarChart = (
    title: string,
    data: { value: number; label: string }[]
  ) => {
    const chartData = data.filter((d) => d.value > 0);
    if (chartData.length === 0) {
      return (
        <Collapse title={title}>
          <TextInter style={styles.noDataText}>
            Sem dados para este gráfico
          </TextInter>
        </Collapse>
      );
    }
    return (
      <Collapse title={title}>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            barWidth={35}
            barBorderRadius={4}
            frontColor={colors.accent[100]}
            gradientColor={colors.accent[100]}
            yAxisTextStyle={{ color: colors.white[80] }}
            xAxisLabelTextStyle={{
              color: colors.white[80],
              textAlign: "center",
              width: 70,
            }}
            isAnimated
            noOfSections={4}
            yAxisLabelSuffix=" cav."
            rotateLabel
          />
        </View>
      </Collapse>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        onScrollBeginDrag={() => setTooltipData(null)}
      >
        <Divider />
        {renderPieChart("Cavidades por Município", dataPorMunicipio)}
        <Divider height={10} />
        {renderPieChart("Desenvolvimento Linear (metros)", dataDevLinear)}
        <Divider height={10} />
        {renderBarChart("Jurisdição da Área Protegida", dataJurisdicao)}
        <Divider height={10} />
        {renderBarChart("Grupo Litológico", dataGrupoLitologico)}
        <Divider height={10} />
        {renderPieChart("Desenvolvimento Predominante", dataDevPredominante)}
        <Divider />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  noDataText: {
    color: colors.white[80],
    textAlign: "center",
    paddingVertical: 40,
    fontStyle: "italic",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  chartContainer: {
    alignItems: "center",
    flex: 1,
  },
  tooltipContainer: {
    position: "absolute",
    backgroundColor: colors.dark[70],
    borderRadius: 8,
    padding: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 1000,
    minWidth: 90,
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tooltipColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
});

export default StepTwo;
