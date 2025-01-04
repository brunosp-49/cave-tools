import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";
import RadioButtonGroup from "../../../components/radio";

export const StepFive = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Caracterização interna da cavidade
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Grupo litológico
      </TextInter>
      <Divider height={12} />
      <Checkbox
        label="Rochas carbonáticas"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas ferríferas e/ou ferruginosas"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Rochas siliciclásticas"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Rochas pelíticas" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Rochas granito-gnáissicas"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Outros" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Input placeholder="Especifique aqui" label="Outro" />
      <TextInter color={colors.white[100]} weight="medium">
        Desenvolvimento predominante
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        onValueChange={() => {}}
        options={[
          { id: "1", value: "Horizontal", label: "Horizontal" },
          { id: "2", value: "Vertical", label: "Vertical" },
        ]}
      />
      <Divider height={12} />
      <TextInter color={colors.white[100]} weight="medium">
        Estado de conservação
      </TextInter>
      <Divider height={12} />
      <RadioButtonGroup
        onValueChange={() => {}}
        options={[
          { id: "1", value: "Conservada", label: "Conservada" },
          {
            id: "2",
            value: "Depredação localizada",
            label: "Depredação localizada",
          },
        ]}
      />
      <Divider height={5} />
      <Input label="Depredação localizada" placeholder="Reportar Condição" />
      <Checkbox
        label="Depredação intensa"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={18} />
      <Input label="Depredação intensa" placeholder="Reportar Condição" />
      <TextInter color={colors.white[100]} weight="medium">
        Infraestrutura interna
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Passarela" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Corrimão" checked={false} onChange={() => {}} />
      <View style={styles.secondLayer}>
        <TextInter color={colors.white[100]} weight="medium">
          Infraestrutura interna
        </TextInter>
        <Divider height={12} />
        <Checkbox label="Ferro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Madeira" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Corda" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Checkbox label="Outro" checked={false} onChange={() => {}} />
        <Divider height={12} />
        <Input label="Outro" placeholder="Outro" />
      </View>
      <Checkbox label="Portão" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Escada" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Corda" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Iluminação artificial"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Ponto de ancoragem (splits)"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Nenhum" checked={false} onChange={() => {}} />
      <Divider height={18} />
      <TextInter color={colors.white[100]} weight="medium">
        Dificuldade de progressão interna
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Teto baixo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Blocos instáveis" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Trechos escorregadios"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Rastejamento" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Natação" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Lances verticais" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Passagem em curso d'água"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Quebra-copo" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Sifão" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Cachoeira" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Nenhum" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outros" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Input label="Outro" placeholder="Outro" />
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
