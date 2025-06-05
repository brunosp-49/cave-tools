import React, { useState, useEffect, FC, useCallback } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateTopography, } from "../../../redux/topographySlice";
import { StepComponentProps } from "../../editCavity";
import { colors } from "../../../assets/colors";
import TextInter from "../../../components/textInter";
import { Input } from "../../../components/input";
import { LongButton } from "../../../components/longButton";
import PlusIcon from "../../../components/icons/plusIcon";
import { Divider } from "../../../components/divider";
import type { TopographyPoint } from "../../../types";

const createEmptyReduxPoint = (cavity_id: string): TopographyPoint => ({
  cavity_id: cavity_id,
  from: 0,
  to: 0,
  distance: 0,
  azimuth: 0,
  incline: 0,
  turnUp: 0,
  turnDown: 0,
  turnRight: 0,
  turnLeft: 0,
});

const StepThree: FC<StepComponentProps> = ({ navigation, validationAttempted }) => {
  const dispatch = useDispatch();
  const { topography, cavity_id } = useSelector((state: RootState) => ({
    topography: state.topography.topography,
    cavity_id: state.topography.cavity_id
  }));

  useEffect(() => {
    if (topography[0].cavity_id === '') {
      handleInputChange(0, 'cavity_id', cavity_id)
    }
  }, [])

  const handleInputChange = useCallback(
    (index: number, field: keyof TopographyPoint, text: string | number) => {
      const numericValue = text === "" ? 0 : text;

      dispatch(
        updateTopography({
          path: [index, field],
          value: numericValue,
        })
      );
    },
    [dispatch]
  );

  const addPoint = useCallback(() => {
    dispatch(
      updateTopography({
        path: [topography.length],
        value: createEmptyReduxPoint(cavity_id),
      })
    );
  }, [dispatch, topography.length]);

  const removePoint = useCallback(
    (indexToRemove: number) => {
      const newArray = topography.filter((_, idx) => idx !== indexToRemove);
      dispatch(
        updateTopography({
          path: [],
          value: newArray,
        })
      );
    },
    [dispatch, topography]
  );

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Divider height={10} />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Inserir informações topográficas
        </TextInter>

        <View style={styles.body}>
          {topography.map((point, index) => (
            <View key={index} style={styles.pointContainer}>
              <TextInter fontSize={16} style={{ marginBottom: 10 }} weight="bold" color={colors.white[100]}>
                Topografia {index + 1}
              </TextInter>
              <Input
                label="Referência (De)"
                placeholder="Digite Aqui"
                value={point.from.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'from', text)
                }
              />

              <Input
                label="Referência (Para)"
                placeholder="Digite Aqui"
                value={point.to.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'to', text)
                }
              />

              <Input
                label="Distância"
                placeholder="Digite Aqui"
                value={point.distance.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'distance', text)
                }
              />

              <Input
                label="Azimute"
                placeholder="Digite Aqui"
                value={point.azimuth.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'azimuth', text)
                }
              />

              <Input
                label="Inclinação"
                placeholder="Digite Aqui"
                value={point.incline.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'incline', text)
                }
              />

              <Input
                label="Para cima"
                placeholder="Digite Aqui"
                value={point.turnUp.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'turnUp', text)
                }
              />

              <Input
                label="Para baixo"
                placeholder="Digite Aqui"
                value={point.turnDown.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'turnDown', text)
                }
              />

              <Input
                label="Para direita"
                placeholder="Digite Aqui"
                value={point.turnRight.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'turnRight', text)
                }
              />

              <Input
                label="Para esquerda"
                placeholder="Digite Aqui"
                value={point.turnLeft.toString()}
                keyboardType="numeric"
                onChangeText={text =>
                  handleInputChange(index, 'turnLeft', text)
                }
              />
              {topography.length > 1 && index >= 1 && (
                <LongButton
                  title="Remover esta topografia"
                  mode="cancel"
                  onPress={() => removePoint(index)}
                />
              )}
            </View>
          ))}
        </View>

        <LongButton
          title='Adicionar'
          leftIcon={<PlusIcon />}
          onPress={() => addPoint()}
        />
      </View>
    </SafeAreaView>
  )
}

export default StepThree;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    gap: 30,
  },
  body: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  pointContainer: {
    width: "100%",
    marginBottom: 40,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.dark[50],
  },
});