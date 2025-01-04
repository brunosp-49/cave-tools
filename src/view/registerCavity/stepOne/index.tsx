import React, { useState, useEffect, FC, useRef } from "react";
import { StyleSheet, View, Image, Modal, TouchableOpacity } from "react-native";
import { launchImageLibraryAsync } from "expo-image-picker";
import { Divider } from "../../../components/divider";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { LongButton } from "../../../components/longButton";
import Geolocation from "@react-native-community/geolocation";
import { useDispatch } from "react-redux";
import { showError } from "../../../redux/loadingSlice";
import { requestPermissions } from "../../../util";
import UploadIcon from "../../../components/icons/uploadIcon";
import { CustomSelect } from "../../../components/customSelect";
import {
  Camera,
  CameraDevice,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import Ionicons from "@expo/vector-icons/Ionicons";

interface SelectOption {
  id: string;
  value: string;
}

export const StepOne: FC = () => {
  const [select, setSelect] = useState<SelectOption>({ id: "", value: "" });
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [showGeoInputs, setShowGeoInputs] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraIsOpen, setCameraIsOpen] = useState<boolean>(false);
  const device = useCameraDevice("back") as CameraDevice | undefined;

  const dispatch = useDispatch();

  const camera = useRef<Camera>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== "granted") {
        dispatch(
          showError({
            title: "Camera Permission Denied",
            message: "Please allow camera access to take photos.",
          })
        );
      }
    };
    requestCameraPermission();
  }, [dispatch]);

  const getCurrentPosition = () => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setShowGeoInputs(true);
      },
      (error) => {
        dispatch(
          showError({
            title: "Erro ao obter localização",
            message:
              "Autorize e mantenha a localização ativa para coletar automaticamente a sua localização.",
          })
        );
        requestPermissions();
        setIsLoading(false);
        console.error(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const pickImageFromGallery = async () => {
    requestPermissions();
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    if (device) {
      setCameraIsOpen(true);
    }
  };

  const format = useCameraFormat(device, [
    {
      photoResolution: { width: 1280, height: 720 },
      autoFocusSystem: "contrast-detection",
    },
  ]);

  const handleCapture = async () => {
    try {
      console.log({ camera: camera.current });
      if (camera.current === null) {
        console.error("Camera reference is null");
        return;
      }

      const file = await camera.current.takePhoto();
      const imageUrl = `file://${file.path}`;

      setSelectedImage(imageUrl);
      setCameraIsOpen(false);
    } catch (error) {
      console.error("Error during photo capture:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Divider />
      <Select
        placeholder="Selecione um projeto"
        label="Selecione o projeto"
        required
        value={select.value}
        onChangeText={(obj: SelectOption) => setSelect(obj)}
        optionsList={[
          { id: "1", value: "Projeto 1" },
          { id: "2", value: "Projeto 2" },
          { id: "3", value: "Projeto 3" },
          { id: "4", value: "Projeto 4" },
          { id: "5", value: "Projeto 5" },
          { id: "6", value: "Projeto 6" },
          { id: "7", value: "Projeto 7" },
          { id: "8", value: "Projeto 8" },
          { id: "9", value: "Projeto 9" },
          { id: "10", value: "Projeto 10" },
        ]}
      />
      <Input
        placeholder="Digite o nome do responsável"
        label="Responsável pelo registro"
        required
      />
      <Input
        label="Nome da cavidade"
        placeholder="Digite o nome da cavidade"
        required
      />
      <Input label="Nome do sistema" placeholder="Digite o nome do sistema" />
      <Input label="Município" placeholder="Digite o nome do município" />
      <Input label="Localidade" placeholder="Digite a localidade" />
      <View style={styles.dubleInputContainer}>
        <View style={styles.dubleLeftContainer}>
          <Input label="UF" placeholder="Digite a UF" mask="99" />
        </View>
        <View style={styles.dubleRightContainer}>
          <Input placeholder="DD/MM/AAAA" label="Data" mask="99/99/9999" />
        </View>
      </View>
      <Input placeholder="Digite o DATUM" label="DATUM" />
      <TextInter color={colors.white[100]} weight="medium">
        Coordenadas Geográficas *
      </TextInter>
      {!showGeoInputs ? (
        <>
          <Divider height={10} />
          <LongButton
            title="Inserir Manualmente"
            onPress={() => setShowGeoInputs(true)}
            disabled={isLoading}
          />
          <Divider height={10} />
          <LongButton
            title="Coletar Automaticamente"
            onPress={getCurrentPosition}
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
          <Divider height={10} />
          <View style={styles.dubleInputContainer}>
            <View style={styles.dubleLeftContainer}>
              <Input
                label="Longitude"
                placeholder="Digite a longitude"
                value={longitude}
              />
            </View>
            <View style={styles.dubleRightContainer}>
              <Input
                placeholder="Digite a latitude"
                label="Latitude"
                value={latitude}
              />
            </View>
          </View>
        </>
      )}
      <Divider />
      <CustomSelect
        label="Foto da entrada da cavidade"
        optionsList={[
          {
            id: "1",
            value: "Galeria",
            onPress: pickImageFromGallery,
          },
          {
            id: "2",
            value: "Câmera",
            onPress: takePhotoWithCamera,
          },
        ]}
      >
        <View style={styles.uploadContainer}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: 177, height: 100 }}
            />
          ) : (
            <>
              <UploadIcon />
              <TextInter weight="regular" color={colors.dark[60]}>
                Selecionar Imagem
              </TextInter>
            </>
          )}
        </View>
      </CustomSelect>
      <Modal visible={cameraIsOpen && Boolean(device)}>
        <View style={styles.cameraContainer}>
          {device && (
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={cameraIsOpen}
              photo={true}
              format={format}
            />
          )}
          <TouchableOpacity style={styles.button} onPress={handleCapture}>
            <Ionicons name="camera" size={30} color={"#5b5b5b"} />
          </TouchableOpacity>
        </View>
      </Modal>
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
  dubleInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dubleLeftContainer: {
    width: "47%",
  },
  dubleRightContainer: {
    width: "47%",
  },
  uploadContainer: {
    width: "100%",
    height: 126,
    backgroundColor: colors.dark[80],
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1.8,
    borderColor: colors.white[20],
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
  },
  button: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    borderWidth: 5,
    borderColor: colors.white[90],
    backgroundColor: "rgba(255, 255, 255, 0.548)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonInside: {},
});
