import React from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";

export const StepSeven = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Hidrologia
      </TextInter>
      <Divider />
      <Checkbox label="Curso d’água" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de curso d’água
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Lago ou Lagoa" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de lago ou lagoa
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Sumidouro" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de sumidouro
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Surgência" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de surgência
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Gotejamento" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de gotejamento
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Condensação" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de condensação
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Empoçamento" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de empoçamento
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Exudação" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Selecione o tipo de exudação
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Perene" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Intermitente" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox
          label="Não soube informar"
          checked={false}
          onChange={() => {}}
        />
        <Divider height={12} />
      </View>
      <Divider height={12} />
      <Checkbox label="Outros" checked={true} onChange={() => {}} />
      <Divider height={12} />
      <Input placeholder="Especifique aqui" label="Outro" />
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
