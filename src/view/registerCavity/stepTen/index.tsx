import React, { FC } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RouterProps } from "../../../types";
import { Header } from "../../../components/header";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import { DividerColorLine } from "../../../components/dividerColorLine";
import { InputMultiline } from "../../../components/inputMultiline";

export const StepTen = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Biota
      </TextInter>
      <Divider />
      <Checkbox label="Invertebrado" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Aranha" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Ácaro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Amblípigo" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Opinião" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Opilião" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Pseudo-escorpião"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
        <Checkbox label="Escorpião" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Formiga" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Besouro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Mosca" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Mosquito" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Mariposa" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Barata" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Cupim" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Grilo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Percevejo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Piolho de cobra" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Centopeia" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Lacraia" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Caramujo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Tatuzinho de jardim"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
        <Checkbox label="Outro" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <DividerColorLine />
      <Divider />
      <Checkbox
        label="Invertebrado aquático"
        checked={true}
        onChange={() => {}}
      />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Caramujo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Bivalve" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Camarão" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Caranguejo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Outro" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <DividerColorLine />
      <Divider />
      <Checkbox label="Anfíbio" checked={true} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Sapo" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Rã" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Perereca" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Outro" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <DividerColorLine />
      <Divider />
      <Checkbox label="Réptil" checked={true} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Serpente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Lagarto" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Outro" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <DividerColorLine />
      <Divider />
      <Checkbox label="Ave" checked={true} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Urubu" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Gavião" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Arara azul" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Arara vermelha" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Papagaio" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Coruja" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Outro" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <DividerColorLine />
      <Divider />
      <Checkbox label="Peixe" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Morcego" checked={true} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Frugívoro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Checkbox label="Hematófago" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Divider height={12} />
        <Checkbox label="Carnívoro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Divider height={12} />
        <Checkbox label="Nectarívoro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Divider height={12} />
        <Checkbox label="Insetívoro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Divider height={12} />
        <Checkbox label="Piscívoro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <Divider height={12} />
        <Checkbox label="Indeterminado" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Select
          reduceSize
          onChangeText={() => {}}
          value=""
          placeholder="Selecione"
          optionsList={[
            { id: "1", value: "Tipo 1" },
            { id: "2", value: "Tipo 2" },
          ]}
        />
        <InputMultiline placeholder="Especifique aqui" label="Morcego - Observações Gerais"/>
      </View>
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
