import React, { FC } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { StepComponentProps } from "../../editCavity";
import { colors } from "../../../assets/colors";
import type { TopographyPoint } from "../../../types";
import TextInter from "../../../components/textInter";
import { Divider } from "../../../components/divider";
import DrawPoints from "../../../components/topography/drawPoints";

const StepFour: FC<StepComponentProps> = ({ navigation, validationAttempted }) => {
  const topography = useSelector((state: RootState) => state.topography.topography);

  const topographies: TopographyPoint[] = topography || [];

  return (
    <SafeAreaView style={styles.main}>
      <Divider height={20} />
      <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
        Desenho da Cavidade
      </TextInter>
      <DrawPoints
        topographies={topographies}
      />
    </SafeAreaView>
  )
}

export default StepFour;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    width: '100%',
    height: 'auto'
  },
});