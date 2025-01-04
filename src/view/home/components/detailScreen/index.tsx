import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Divider } from "../../../../components/divider";
import { Header } from "../../../../components/header";
import TextInter from "../../../../components/textInter";
import { colors } from "../../../../assets/colors";
import { RouterProps } from "../../../../types";
import { FC } from "react";
import { LabelText } from "../../../../components/labelText";

interface DetailScreenProps extends RouterProps {
  onClose: () => void;
}

export const DetailScreen: FC<DetailScreenProps> = ({
  navigation,
  onClose,
}) => {
  return (
    <ScrollView>
      <Header
        title="Visualizar Caracterização"
        navigation={navigation}
        onCustomReturn={onClose}
      />
      <Divider />
      <View style={styles.container}>
        <TextInter color={colors.white[100]} fontSize={19}>
          Registro
        </TextInter>
        <Divider />
        <LabelText
          label="Responsável pelo registro"
          text="Fernando Gomes da Fonseca"
        />
        <Divider />
        <LabelText label="Nome da cavidade" text="Floresta Mágica" />
        <Divider />
        <LabelText label="Nome do sistema" text="Flor de liz" />
        <Divider />
        <LabelText
          label="Localidade"
          text="Campo Verde, próximo ao verde manchaF"
        />
        <Divider />
        <LabelText label="Município" text="Mata Verde" />
        <Divider />
        <LabelText label="Data" text="14/08/2024" />
        <Divider />
        <LabelText label="DATUM" text="WGS84s" />
        <Divider />
        <LabelText
          label="Coordenadas Geográficas"
          text="Latitude: 40.748817° N, Longitude: -73.985428° W"
        />
        <Divider />
        <LabelText label="Foto da entrada da cavidade" text="" />
        <Image
          style={styles.image}
          source={{
            uri: "https://images.unsplash.com/photo-1589072894364-cdafe42024b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
          }}
        />
      </View>
      <Divider height={18} />
      <View style={styles.container}>
        <TextInter color={colors.white[100]} fontSize={19}>
          Uso da cavidade
        </TextInter>
        <Divider />
        <LabelText
          label="Responsável pelo registro"
          text="Fernando Gomes da Fonseca"
        />
        <Divider />
        <LabelText label="Nome da cavidade" text="Floresta Mágica" />
        <Divider />
        <LabelText label="Nome do sistema" text="Flor de liz" />
        <Divider />
        <LabelText
          label="Localidade"
          text="Campo Verde, próximo ao verde manchaF"
        />
        <Divider />
        <LabelText label="Município" text="Mata Verde" />
        <Divider />
        <LabelText label="Data" text="14/08/2024" />
        <Divider />
        <LabelText label="DATUM" text="WGS84s" />
        <Divider />
        <LabelText
          label="Coordenadas Geográficas"
          text="Latitude: 40.748817° N, Longitude: -73.985428° W"
        />
        <Divider />
        <LabelText label="Foto da entrada da cavidade" text="" />
        <Image
          style={styles.image}
          source={{
            uri: "https://images.unsplash.com/photo-1589072894364-cdafe42024b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30434f",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 25,
  },
  image: {
    width: 161,
    height: 91,
  },
});
