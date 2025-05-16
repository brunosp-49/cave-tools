import React, { FC, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider } from "../../../../components/divider";
import TextInter from "../../../../components/textInter";
import { colors } from "../../../../assets/colors";
import { Checkbox } from "../../../../components/checkbox";
import { Input } from "../../../../components/input";
import {
  Camera,
  CameraDevice,
  CameraRuntimeError,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";
import { LongButton } from "../../../../components/longButton";
import UTMConverter from "utm-latlng";
import { useDispatch } from "react-redux";
import { showError } from "../../../../redux/loadingSlice";
import { requestPermissions } from "../../../../util";
import { CustomSelect } from "../../../../components/customSelect";
import { launchImageLibraryAsync } from "expo-image-picker";
import UploadIcon from "../../../../components/icons/uploadIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Entrada } from "../../../../types";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { NextButton } from "../../../../components/button/nextButton";
import { ReturnButton } from "../../../../components/button/returnButton";
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Entrada) => void;
}

interface InsercaoState {
  afloramentoContinuo: boolean;
  afloramentoIsolado: boolean;
  escarpaContinua: boolean;
  escarpaDescontinua: boolean;
  dolina: boolean;
  depositoTalus: boolean;
  outro: boolean;
  outroTexto: string;
}

export const CavityModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [datum, setDatum] = useState<string>("SIRGAS 2000");
  const [showGeoInputs, setShowGeoInputs] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [accuracy, setAccuracy] = useState<string>("");
  const [altitude, setAltitude] = useState<string>("");
  const [satellites, setSatellites] = useState<string>("");
  const [utmZone, setUtmZone] = useState<string>("");
  const [utmE, setUtmE] = useState<string>("");
  const [utmN, setUtmN] = useState<string>("");
  const utmConverter = new UTMConverter();
  const [insercao, setInsercao] = useState({
    afloramentoContinuo: false,
    afloramentoIsolado: false,
    escarpaContinua: false,
    escarpaDescontinua: false,
    dolina: false,
    depositoTalus: false,
    outro: false,
    outroTexto: "",
  });

  const [posicaoVertente, setPosicaoVertente] = useState({
    topo: false,
    alta: false,
    media: false,
    baixa: false,
  });

  const [vegetacao, setVegetacao] = useState({
    cerrado: false,
    campoRupestre: false,
    florestaSemidecidual: false,
    florestaOmbrofila: false,
    mataSeca: false,
    campoSujo: false,
    outro: false,
    outroTexto: "",
  });
  const [isAutoGeoInfos, setIsAutoGeoInfos] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Stores base64 data URI string or null
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false); // Loading indicator for image processing
  const [cameraIsOpen, setCameraIsOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const device = useCameraDevice("back") as CameraDevice | undefined;
  const camera = useRef<Camera>(null);

  const convertFileToBase64 = async (uri: string): Promise<string | null> => {
    setIsLoadingImage(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Basic Mime Type detection based on extension
      let mimeType = "image/jpeg"; // Default
      const lowerUri = uri.toLowerCase();
      if (lowerUri.endsWith(".png")) mimeType = "image/png";
      else if (lowerUri.endsWith(".webp")) mimeType = "image/webp";
      else if (lowerUri.endsWith(".gif")) mimeType = "image/gif";

      // Construct Data URI string
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error("Error converting image file to Base64:", error);
      dispatch(
        showError({
          title: "Erro de Imagem",
          message: "Não foi possível processar o arquivo de imagem.",
        })
      );
      return null;
    } finally {
      setIsLoadingImage(false); // Ensure loading stops
    }
  };

  const resetStates = () => {
    setDatum("SIRGAS 2000");
    setShowGeoInputs(false);
    setIsLoading(false);
    setLatitude("");
    setLongitude("");
    setAccuracy("");
    setAltitude("");
    setSatellites("");
    setUtmZone("");
    setUtmE("");
    setUtmN("");
    setCameraIsOpen(false);
    setSelectedImage(null);
    setInsercao({
      afloramentoContinuo: false,
      afloramentoIsolado: false,
      escarpaContinua: false,
      escarpaDescontinua: false,
      dolina: false,
      depositoTalus: false,
      outro: false,
      outroTexto: "",
    });
    setPosicaoVertente({
      topo: false,
      alta: false,
      media: false,
      baixa: false,
    });
    setVegetacao({
      cerrado: false,
      campoRupestre: false,
      florestaSemidecidual: false,
      florestaOmbrofila: false,
      mataSeca: false,
      campoSujo: false,
      outro: false,
      outroTexto: "",
    });
    setIsAutoGeoInfos(false);
  };

    const getCurrentPosition = useCallback(async () => {
    setIsLoading(true);
    try {
      // Request location permission first
      const permission = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      if (permission !== RESULTS.GRANTED) {
        // Handle the case where the user denies permission
        setIsLoading(false);
        dispatch(
          showError({
            title: "Permissão de Localização Negada",
            message:
              "A coleta automática de localização requer permissão de localização.",
          }),
        );
        return;
      }
      if(permission !== RESULTS.GRANTED) return;
      // Permission is granted, get the current position
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude } = position.coords;
          const { satellites = 0 } = position?.extras || {}; // Satellites are optional

          // Convert latitude and longitude to numbers.  Important!
          const latNum = Number(latitude);
          const lonNum = Number(longitude);
          const accuracyNum = Number(accuracy);
          const altitudeNum = Number(altitude);
          const satellitesNum = Number(satellites);

          // Check if the conversion resulted in valid numbers
          if (isNaN(latNum) || latNum < -90 || latNum > 90 || isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
            dispatch(
              showError({
                title: "Coordenadas Inválidas",
                message:
                  "A localização retornou coordenadas inválidas.",
              }),
            );
            setIsLoading(false);
            return;
          }

          // Check for valid accuracy
          if (isNaN(accuracyNum) || accuracyNum < 0) {
            dispatch(
              showError({
                title: "Erro de Localização",
                message: "A precisão da localização é inválida.",
              }),
            );
             setIsLoading(false);
            return;
          }
          console.log({accuracy:  Math.floor(accuracyNum), latNum, lonNum})
          const utm = utmConverter.convertLatLngToUtm(
            latNum,
            lonNum,
            Math.floor(accuracyNum), // Pass the numeric accuracy
          );

          console.log({utm})

          setLatitude(String(latNum));
          setLongitude(String(lonNum));
          setAccuracy(String(accuracyNum));
          setAltitude(String(altitudeNum));
          setSatellites(String(satellitesNum)); //  pass the numeric value
          if (typeof utm !== "string") {
            setUtmZone(utm.ZoneNumber + utm.ZoneLetter);
          }
          if (typeof utm !== "string") {
             setUtmE(String(utm.Easting));
          }
          if (typeof utm !== "string") {
            setUtmN(String(utm.Northing));
          }
          setShowGeoInputs(true);
          setIsLoading(false);
          setIsAutoGeoInfos(true);
        },
        (error) => {
          dispatch(
            showError({
              title: "Erro ao obter localização",
              message:
                "Ocorreu um erro ao obter a localização: " + error.message,
            }),
          );
          setIsLoading(false);
          console.error(error.code, error.message);
        },
        { accuracy: { android: "balanced", ios: "nearestTenMeters"} },
      );
    } catch (error: any) {
       dispatch(
          showError({
            title: "Erro ao obter permissão de localização",
            message:
              "Ocorreu um erro ao obter a permissão de localização: " + error.message,
          }),
        );
        setIsLoading(false);
        console.error("Error requesting location permission:", error);
    }
  }, [dispatch, utmConverter]);

  const pickImageFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      dispatch(
        showError({
          title: "Permissão Negada",
          message: "Permissão da galeria é necessária.",
        })
      );
      return;
    }

    setIsLoadingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          let mimeType =
            asset.mimeType ??
            (asset.uri.includes(".png") ? "image/png" : "image/jpeg");
          const base64DataUri = `data:${mimeType};base64,${asset.base64}`;
          setSelectedImage(base64DataUri);
        } else {
          console.warn(
            "Base64 not directly available from picker, trying FileSystem conversion."
          );
          const base64DataUri = await convertFileToBase64(asset.uri);
          setSelectedImage(base64DataUri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      dispatch(
        showError({
          title: "Erro de Galeria",
          message: "Não foi possível selecionar a imagem.",
        })
      );
    } finally {
      setIsLoadingImage(false);
    }
  }, [dispatch, convertFileToBase64]);

  const takePhotoWithCamera = useCallback(async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status !== "granted") {
      const newStatus = await Camera.requestCameraPermission();
      if (newStatus !== "granted") {
        dispatch(
          showError({
            title: "Permissão Negada",
            message: "Permissão de câmera é necessária.",
          })
        );
        return;
      }
    }
    if (device) {
      setCameraIsOpen(true);
    } else {
      dispatch(
        showError({
          title: "Erro de Câmera",
          message: "Nenhum dispositivo de câmera traseira encontrado.",
        })
      );
    }
  }, [device, dispatch]);

  const handleCapture = useCallback(async () => {
    if (!camera.current) {
      console.error("Camera ref not available");
      dispatch(
        showError({
          title: "Erro",
          message: "Referência da câmera não encontrada.",
        })
      );
      return;
    }
    setIsLoadingImage(true);

    try {
      console.log("Attempting to take photo...");
      const photo = await camera.current.takePhoto({
        flash: "off",
      });
      console.log("Photo taken successfully, path:", photo.path);

      setCameraIsOpen(false);

      const fileUri =
        Platform.OS === "android" ? `file://${photo.path}` : photo.path;
      const base64DataUri = await convertFileToBase64(fileUri);
      setSelectedImage(base64DataUri);

      // Optional: Delete temporary file if needed
      // await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error("Error taking photo:", error);
      setCameraIsOpen(false);

      if (error instanceof CameraRuntimeError) {
        dispatch(
          showError({
            title: "Erro de Câmera",
            message: `(${error.code}) ${error.message}`,
          })
        );
      } else {
        dispatch(
          showError({
            title: "Erro de Captura",
            message: "Não foi possível tirar a foto.",
          })
        );
      }
    } finally {
      setIsLoadingImage(false);
    }
  }, [camera, dispatch, convertFileToBase64]);

  const format = useCameraFormat(device, [
    { photoAspectRatio: 16 / 9 },
    { photoResolution: "max" },
    {
      photoResolution: { width: 1280, height: 720 },
      autoFocusSystem: "contrast-detection",
    },
  ]);

  const requiredFields = [
    datum,
    latitude,
    longitude,
    accuracy,
    altitude,
    satellites,
    utmZone,
    utmE,
    utmN,
    selectedImage,
  ];

  const validateFields = () => {
    if (requiredFields.some((field) => !field)) return false;

    if (vegetacao.outro && !vegetacao.outroTexto.trim()) return false;
    if (insercao.outro && !insercao.outroTexto.trim()) return false;

    return true;
  };

  const onSaveEntry = () => {
    const pontoAtual = utmConverter.convertLatLngToUtm(
      Number(latitude),
      Number(longitude),
      Math.floor(Number(accuracy))
    );

    const latRef = -19.123456;
    const lonRef = -43.123456;
    const pontoRef = utmConverter.convertLatLngToUtm(
      latRef,
      lonRef,
      Math.floor(Number(accuracy))
    );
    const graus_e = pontoAtual.Easting - pontoRef.Easting;
    const graus_n = pontoAtual.Northing - pontoRef.Northing;
    const erro_gps = Math.sqrt(Math.pow(graus_e, 2) + Math.pow(graus_n, 2));
    onSave({
      principal: false,
      foto: selectedImage,
      coordenadas: {
        datum,
        coleta_automatica: isAutoGeoInfos,
        graus_e,
        graus_n,
        erro_gps,
        satelites: Number(satellites),
        utm: {
          zona: utmZone,
          utm_e: Number(utmE),
          utm_n: Number(utmN),
          erro_gps,
          satelites: Number(satellites),
          elevacao: Number(altitude),
        },
      },
      caracteristicas: {
        insercao: {
          afloramento_isolado: insercao.afloramentoIsolado,
          afloramento_rochoso_continuo: insercao.afloramentoContinuo,
          deposito_talus: insercao.depositoTalus,
          dolina: insercao.dolina,
          escarpa_rochosa_continua: insercao.escarpaContinua,
          escarpa_rochosa_descontinua: insercao.escarpaDescontinua,
          outro: insercao.outroTexto,
        },
        posicao_vertente: posicaoVertente,
        vegetacao: {
          campo_rupestre: vegetacao.campoRupestre,
          campo_sujo: vegetacao.campoSujo,
          cerrado: vegetacao.cerrado,
          floresta_ombrofila: vegetacao.florestaOmbrofila,
          floresta_estacional_semidecidual: vegetacao.florestaSemidecidual,
          mata_seca: vegetacao.mataSeca,
          outro: vegetacao.outroTexto,
        },
      },
    });
    resetStates();
  };

  return (
    <Modal statusBarTranslucent visible={isOpen}>
      <ScrollView>
        <View style={styles.container}>
          <Divider />
          <TextInter color={colors.white[100]} fontSize={19} weight="medium">
            Características da entrada
          </TextInter>
          <Divider />
          <TextInter color={colors.white[100]} weight="medium">
            Inserção
          </TextInter>
          <Divider height={12} />
          <Checkbox
            label="Afloramento rochoso contínuo"
            checked={insercao.afloramentoContinuo}
            onChange={() =>
              setInsercao((prev) => ({
                ...prev,
                afloramentoContinuo: !prev.afloramentoContinuo,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Afloramento isolado"
            checked={insercao.afloramentoIsolado}
            onChange={() =>
              setInsercao((prev) => ({
                ...prev,
                afloramentoIsolado: !prev.afloramentoIsolado,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Escarpa rochosa contínua"
            checked={insercao.escarpaContinua}
            onChange={() =>
              setInsercao((prev) => ({
                ...prev,
                escarpaContinua: !prev.escarpaContinua,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Escarpa rochosa descontínua"
            checked={insercao.escarpaDescontinua}
            onChange={() =>
              setInsercao((prev) => ({
                ...prev,
                escarpaDescontinua: !prev.escarpaDescontinua,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Dolina"
            checked={insercao.dolina}
            onChange={() =>
              setInsercao((prev) => ({ ...prev, dolina: !prev.dolina }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Depósito de talús"
            checked={insercao.depositoTalus}
            onChange={() =>
              setInsercao((prev) => ({
                ...prev,
                depositoTalus: !prev.depositoTalus,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Outro"
            checked={insercao.outro}
            onChange={() =>
              setInsercao((prev) => ({ ...prev, outro: !prev.outro }))
            }
          />
          <Divider height={12} />
          {insercao.outro && (
            <Input
              placeholder="Especifique aqui"
              label="Outro"
              value={insercao.outroTexto}
              onChangeText={(text) =>
                setInsercao((prev) => ({ ...prev, outroTexto: text }))
              }
            />
          )}
          <TextInter color={colors.white[100]} weight="medium">
            Posição na vertente
          </TextInter>
          <Divider height={12} />
          <Checkbox
            label="Topo"
            checked={posicaoVertente.topo}
            onChange={() =>
              setPosicaoVertente((prev) => ({ ...prev, topo: !prev.topo }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Alta"
            checked={posicaoVertente.alta}
            onChange={() =>
              setPosicaoVertente((prev) => ({ ...prev, alta: !prev.alta }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Média"
            checked={posicaoVertente.media}
            onChange={() =>
              setPosicaoVertente((prev) => ({ ...prev, media: !prev.media }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Baixa"
            checked={posicaoVertente.baixa}
            onChange={() =>
              setPosicaoVertente((prev) => ({ ...prev, baixa: !prev.baixa }))
            }
          />
          <Divider height={12} />
          <TextInter color={colors.white[100]} weight="medium">
            Vegetação Regional
          </TextInter>
          <Divider height={12} />
          <Checkbox
            label="Cerrado"
            checked={vegetacao.cerrado}
            onChange={() =>
              setVegetacao((prev) => ({ ...prev, cerrado: !prev.cerrado }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Campo rupestre"
            checked={vegetacao.campoRupestre}
            onChange={() =>
              setVegetacao((prev) => ({
                ...prev,
                campoRupestre: !prev.campoRupestre,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Floresta estacional semidecidual"
            checked={vegetacao.florestaSemidecidual}
            onChange={() =>
              setVegetacao((prev) => ({
                ...prev,
                florestaSemidecidual: !prev.florestaSemidecidual,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Floresta ombrófila"
            checked={vegetacao.florestaOmbrofila}
            onChange={() =>
              setVegetacao((prev) => ({
                ...prev,
                florestaOmbrofila: !prev.florestaOmbrofila,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Mata seca"
            checked={vegetacao.mataSeca}
            onChange={() =>
              setVegetacao((prev) => ({ ...prev, mataSeca: !prev.mataSeca }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Campo sujo"
            checked={vegetacao.campoSujo}
            onChange={() =>
              setVegetacao((prev) => ({ ...prev, campoSujo: !prev.campoSujo }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Outro"
            checked={vegetacao.outro}
            onChange={() =>
              setVegetacao((prev) => ({ ...prev, outro: !prev.outro }))
            }
          />
          <Divider height={16} />
          {vegetacao.outro && (
            <Input
              placeholder="Especifique aqui"
              label="Outro"
              value={vegetacao.outroTexto}
              onChangeText={(text) =>
                setVegetacao((prev) => ({ ...prev, outroTexto: text }))
              }
            />
          )}
          <Input
            placeholder="Digite o DATUM"
            label="DATUM"
            value={datum}
            onChangeText={setDatum}
          />
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
                    keyboardType="numeric"
                    onChangeText={setLongitude}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Digite a latitude"
                    label="Latitude"
                    value={latitude}
                    keyboardType="numeric"
                    onChangeText={setLatitude}

                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleLeftContainer}>
                  <Input
                    label="Precisão"
                    placeholder="Digite a precisão"
                    value={accuracy}
                    keyboardType="numeric"
                    onChangeText={(e) => setAccuracy(e)}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Digite a altitude"
                    label="Altitude"
                    value={altitude}
                    keyboardType="numeric"
                    onChangeText={(e) => setAltitude(e)}
                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Satélites"
                    label="Quant. de Satélites"
                    value={satellites}
                    keyboardType="numeric"
                    onChangeText={(e) => setSatellites(e)}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Digite a Zona UTM"
                    label="Zona UTM"
                    value={utmZone}
                    onChangeText={(e) => setUtmZone(e)}
                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Digite a UTM E"
                    label="UTM E"
                    value={utmE}
                    keyboardType="numeric"
                    onChangeText={(e) => setUtmE(e)}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Digite a UTM N"
                    label="UTM N"
                    value={utmN}
                    keyboardType="numeric"
                    onChangeText={(e) => setUtmN(e)}
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
              {isLoadingImage ? (
                <ActivityIndicator size="small" color={colors.accent[100]} />
              ) : selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImageStyle}
                  resizeMode="contain"
                />
              ) : (
                <>
                  <UploadIcon />
                  <TextInter
                    weight="regular"
                    color={colors.dark[60]}
                    style={{ marginTop: 5 }}
                  >
                    Selecionar Imagem
                  </TextInter>
                </>
              )}
            </View>
          </CustomSelect>
          <Divider />
          <View style={styles.buttonContainer}>
            <ReturnButton
              onPress={() => {
                resetStates();
                onClose();
              }}
              buttonTitle="Cancelar"
            />
            <NextButton
              disabled={!validateFields()}
              onPress={onSaveEntry}
              buttonTitle="Salvar"
            />
          </View>
          {device && ( // Conditionally render Camera Modal only if device exists
            <Modal
              visible={cameraIsOpen}
              statusBarTranslucent
              animationType="fade"
            >
              <View style={styles.cameraContainer}>
                <Camera
                  ref={camera}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={cameraIsOpen} // Control activity based on state
                  photo={true}
                  format={format}
                  onError={(error) =>
                    console.error("Camera Runtime Error:", error)
                  }
                />
                {/* Camera Controls Overlay */}
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setCameraIsOpen(false)}
                    disabled={isLoadingImage}
                  >
                    <Ionicons name="close" size={35} color={"#fff"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleCapture}
                    disabled={isLoadingImage}
                  >
                    {isLoadingImage ? (
                      <ActivityIndicator color="#fff" size="large" />
                    ) : (
                      <Ionicons name="camera" size={35} color={"#fff"} />
                    )}
                  </TouchableOpacity>
                  {/* Spacer to balance close button */}
                  <View style={{ width: 50 }} />
                </View>
              </View>
            </Modal>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "110%",
    width: "100%",
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
},
  selectedImageStyle: {
    width: "100%",
    height: "100%",
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(200, 200, 200, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
  },
  closeButton: {
    // position: 'absolute', // Use layout instead if possible
    // left: 20,
    padding: 15,
  },
});
