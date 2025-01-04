import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import { Select } from "../../../components/select";
import { DividerColorLine } from "../../../components/dividerColorLine";

export const StepEight = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Sedimentos Clásticos
      </TextInter>
      <Divider />
      <Checkbox
        label="Rochoso (solo incipiente)"
        checked={false}
        onChange={() => {}}
      />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de solo incipiente
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Argila" checked={true} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={false} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Silte" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={false} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Areia" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={false} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Fração grânulo" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={true} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox
          label="Seixo predominante"
          checked={false}
          onChange={() => {}}
        />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={true} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Fração calhau" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={true} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox
          label="Matacão predominante"
          checked={false}
          onChange={() => {}}
        />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={true} onChange={() => {}} />
          <Divider height={12} />
        </View>
        <DividerColorLine />
      </View>
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Fração grânulo" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Select
            label="Tipo"
            required
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <TextInter color={colors.white[100]} weight="medium">
            Título
          </TextInter>
          <Divider height={12} />
          <Checkbox label="Autóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Alóctone" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Checkbox label="Mista" checked={true} onChange={() => {}} />
          <Divider height={12} />
        </View>
      </View>
      <DividerColorLine />
      <Divider height={18} />
      <Checkbox
        label="Rochoso (solo incipiente)"
        checked={false}
        onChange={() => {}}
      />
      <View style={styles.secondLayer}>
        <Divider height={12} />
        <Checkbox label="Guano" checked={false} onChange={() => {}} />
        <View style={styles.thirdLayer}>
          <Divider height={8} />
          <Checkbox label="Carnívoro" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Select
            label="Tipo"
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <Checkbox label="Frugívoro" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Select
            label="Tipo"
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <Checkbox label="Hematófago" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Select
            label="Tipo"
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
          <Checkbox label="Indeterminado" checked={false} onChange={() => {}} />
          <Divider height={12} />
          <Select
            label="Tipo"
            onChangeText={() => {}}
            value=""
            placeholder="Selecione o tipo"
            optionsList={[
              { id: "1", value: "Tipo 1" },
              { id: "2", value: "Tipo 2" },
            ]}
          />
        </View>
        <Checkbox label="Folhiço" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Galhos" checked={true} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Raízes" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Vestígios de ninhos"
          checked={true}
          onChange={() => {}}
        />
        <Divider height={12} />
        <Checkbox
          label="Pelotas de regurgitação"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
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
  thirdLayer: {
    paddingLeft: 30,
    marginTop: 12,
  },
});
