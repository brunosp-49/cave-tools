import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { Checkbox } from "../../../components/checkbox";
import { Input } from "../../../components/input";

export const StepSix = () => {
  return (
    <View style={styles.container}>
      <Divider />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Topografia (Mapa da Cavidade)
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Grupo litológico
      </TextInter>
      <Divider />
      <Input
        label="Projeção horizontal (m)"
        placeholder="Digite a projeção horizontal"
      />
      <Input
        label="Desnível do piso (m)"
        placeholder="Digite o desnível do pisos"
      />
      <Input label="Área (m²)" placeholder="Digite a área" />
      <Input label="Volume (m³)" placeholder="Digite o volume" />
      <TextInter color={colors.white[100]} weight="medium">
        Previsão
      </TextInter>
      <Divider />
      <Input label="BCRA" placeholder="Digite o valor BCRA" />
      <Input label="UIS" placeholder="Digite o valor UIS" />
      <TextInter color={colors.white[100]} fontSize={19} weight="medium">
        Morfologia
      </TextInter>
      <Divider />
      <TextInter color={colors.white[100]} weight="medium">
        Padrão planimétrico predominante:
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Retilínea" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Anastomosada" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Espongiforme" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Labiríntica" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Reticulado" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Ramiforme" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Dendrítico" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outro" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Input label="Outro" placeholder="Especifique aqui" />
      <TextInter color={colors.white[100]} weight="medium">
        Forma predominante das seções:
      </TextInter>
      <Divider height={12} />
      <Checkbox label="Circular" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Elíptica vertical" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox
        label="Elíptica horizontal"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Elíptica inclinada"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Lenticular vertical"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox
        label="Lenticular horizontal"
        checked={false}
        onChange={() => {}}
      />
      <Divider height={12} />
      <Checkbox label="Poligonal" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Poligonal tubular" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Triangular" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Fechadura" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Linear inclinada" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Linear vertical" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Irregular" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Mista" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Checkbox label="Outro" checked={false} onChange={() => {}} />
      <Divider height={12} />
      <Input label="Outro" placeholder="Especifique aqui" />
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
});
