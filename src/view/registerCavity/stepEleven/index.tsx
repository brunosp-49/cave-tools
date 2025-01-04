import React, { FC } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../../types";
import { Header } from "../../../components/header";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import RadioButtonGroup from "../../../components/radio";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { DividerColorLine } from "../../../components/dividerColorLine";

export const StepEleven = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Arqueologia em superfície
      </TextInter>
      <Divider />
      <RadioButtonGroup
        onValueChange={() => {}}
        options={[
          {
            id: "1",
            value: "Presença",
            label: "Presença",
            children: (
              <View style={styles.secondLayer}>
                <Checkbox
                  checked={false}
                  label="Material lítico"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Material cerâmico"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Pintura rupestre"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox checked={false} label="Gravura" onChange={() => {}} />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Ossada humana"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Enterramento"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Não identificado"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox checked={true} label="Outro" onChange={() => {}} />
                <Divider height={12} />
                <Input placeholder="Especifique aqui" label="Outro" />
              </View>
            ),
          },
          { id: "2", value: "Ausência", label: "Ausência" },
        ]}
      />
      <DividerColorLine />
      <Divider height={12} />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Paleontologia
      </TextInter>
      <Divider />
      <RadioButtonGroup
        onValueChange={() => {}}
        options={[
          {
            id: "1",
            value: "Presença",
            label: "Presença",
            children: (
              <View style={styles.secondLayer}>
                <Checkbox
                  checked={false}
                  label="Material lítico"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Material cerâmico"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Pintura rupestre"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox checked={false} label="Gravura" onChange={() => {}} />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Ossada humana"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Enterramento"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox
                  checked={false}
                  label="Não identificado"
                  onChange={() => {}}
                />
                <Divider height={12} />
                <Checkbox checked={true} label="Outro" onChange={() => {}} />
                <Divider height={12} />
                <Input placeholder="Especifique aqui" label="Outro" />
              </View>
            ),
          },
          { id: "2", value: "Ausência", label: "Ausência" },
        ]}
      />
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
  secondLayer: {
    paddingLeft: 30,
    marginTop: 10,
  },
});
