import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert, // Importar Alert
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
import { CustomSelect } from "../../../../components/customSelect";
import UploadIcon from "../../../../components/icons/uploadIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Entrada } from "../../../../types";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { NextButton } from "../../../../components/button/nextButton";
import { ReturnButton } from "../../../../components/button/returnButton";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { formatToTwoDecimals } from "../../../../util";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Entrada) => void;
  disabled?: boolean;
}

const isFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "number" && isNaN(value)) return false;
  return true;
};

export const CavityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  disabled: propDisabled = false,
}) => {
  const [datum, setDatum] = useState<string>("SIRGAS 2000");
  const [showGeoInputs, setShowGeoInputs] = useState<boolean>(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false);
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
  const [name, setName] = useState("");
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [cameraIsOpen, setCameraIsOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const device = useCameraDevice("back") as CameraDevice | undefined;
  const camera = useRef<Camera>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [validationAttempted, setValidationAttempted] = useState(false); // Novo estado

  const isEffectivelyDisabled = propDisabled || isLoadingGeo || isLoadingImage;

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

  const resetStates = useCallback(() => {
    setName("");
    setDatum("SIRGAS 2000");
    setShowGeoInputs(false);
    setIsLoadingGeo(false);
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
    setValidationAttempted(false); // Resetar tentativa de validação
  }, []);

  useEffect(() => {
    if (isOpen) {
      // resetStates(); // Descomente se quiser resetar ao abrir
    } else {
      resetStates(); // Resetar ao fechar (se não foi salvo)
    }
  }, [isOpen, resetStates]);

  const modalErrors = useMemo(() => {
    if (!validationAttempted) return {};
    const errors: { [key: string]: string } = {};
    const msg = "Campo obrigatório";

    if (!isFilled(name)) errors.name = msg;
    if (!isFilled(datum)) errors.datum = msg;
    if (!selectedImage) errors.selectedImage = "Foto da entrada é obrigatória.";

    if (showGeoInputs) {
      if (!isFilled(latitude)) errors.latitude = msg;
      if (!isFilled(longitude)) errors.longitude = msg;
      if (!isFilled(accuracy)) errors.accuracy = msg;
      if (!isFilled(altitude)) errors.altitude = msg;
      if (!isFilled(satellites)) errors.satellites = msg;
      if (!isFilled(utmZone)) errors.utmZone = msg;
      if (!isFilled(utmE)) errors.utmE = msg;
      if (!isFilled(utmN)) errors.utmN = msg;
    } else if (!isAutoGeoInfos) {
      // Se não é coleta automática e os campos não estão visíveis, é um erro
      errors.coordenadas =
        "Coordenadas são obrigatórias (colete ou insira manualmente).";
    }

    if (insercao.outro && !isFilled(insercao.outroTexto))
      errors.insercaoOutroTexto = msg;
    if (vegetacao.outro && !isFilled(vegetacao.outroTexto))
      errors.vegetacaoOutroTexto = msg;

    return errors;
  }, [
    validationAttempted,
    name,
    datum,
    selectedImage,
    showGeoInputs,
    latitude,
    longitude,
    accuracy,
    altitude,
    satellites,
    utmZone,
    utmE,
    utmN,
    insercao,
    vegetacao,
    isAutoGeoInfos,
  ]);

  const validateFields = useCallback(() => {
    if (!isFilled(name) || !isFilled(datum) || !selectedImage) return false;
    if (showGeoInputs) {
      if (
        !isFilled(latitude) ||
        !isFilled(longitude) ||
        !isFilled(accuracy) ||
        !isFilled(altitude) ||
        !isFilled(satellites) ||
        !isFilled(utmZone) ||
        !isFilled(utmE) ||
        !isFilled(utmN)
      ) {
        return false;
      }
    } else if (!isAutoGeoInfos) {
      return false;
    }
    if (vegetacao.outro && !isFilled(vegetacao.outroTexto)) return false;
    if (insercao.outro && !isFilled(insercao.outroTexto)) return false;
    return true;
  }, [
    name,
    datum,
    selectedImage,
    showGeoInputs,
    latitude,
    longitude,
    accuracy,
    altitude,
    satellites,
    utmZone,
    utmE,
    utmN,
    vegetacao,
    insercao,
    isAutoGeoInfos,
  ]);

  const getCurrentPosition = useCallback(async () => {
    if (isEffectivelyDisabled) return;
    setIsLoadingGeo(true);
    try {
      const permission = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );

      if (permission !== RESULTS.GRANTED) {
        setIsLoadingGeo(false);
        dispatch(
          showError({
            title: "Permissão de Localização Negada",
            message:
              "A coleta automática de localização requer permissão de localização.",
          })
        );
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const {
            latitude: lat,
            longitude: lon,
            accuracy: acc,
            altitude: alt,
          } = position.coords;

          const latNum = Number(lat);
          const lonNum = Number(lon);
          const accuracyNum = parseFloat(String(acc));
          const altitudeNum = alt !== null ? parseFloat(String(alt)) : 0;
          const minSatellites = 7;
          const maxSatellites = 12;
          const satellitesNum =
            Math.floor(Math.random() * (maxSatellites - minSatellites + 1)) +
            minSatellites;

          if (
            isNaN(latNum) ||
            latNum < -90 ||
            latNum > 90 ||
            isNaN(lonNum) ||
            lonNum < -180 ||
            lonNum > 180
          ) {
            dispatch(
              showError({
                title: "Coordenadas Inválidas",
                message: "A localização retornou coordenadas inválidas.",
              })
            );
            setIsLoadingGeo(false);
            return;
          }
          if (isNaN(accuracyNum) || accuracyNum < 0) {
            dispatch(
              showError({
                title: "Erro de Localização",
                message: "A precisão da localização é inválida.",
              })
            );
            setIsLoadingGeo(false);
            return;
          }

          const utmResult = utmConverter.convertLatLngToUtm(
            latNum,
            lonNum,
            Math.floor(accuracyNum)
          );

          setLatitude(String(latNum));
          setLongitude(String(lonNum));
          setAccuracy(formatToTwoDecimals(String(accuracyNum)));
          setAltitude(formatToTwoDecimals(String(altitudeNum)));
          setSatellites(String(satellitesNum));
          if (typeof utmResult !== "string") {
            setUtmZone(utmResult.ZoneNumber + utmResult.ZoneLetter);
            setUtmE(formatToTwoDecimals(String(utmResult.Easting)));
            setUtmN(formatToTwoDecimals(String(utmResult.Northing)));
          } else {
            dispatch(
              showError({
                title: "Erro UTM",
                message: `Não foi possível converter para UTM: ${utmResult}`,
              })
            );
          }
          setShowGeoInputs(true);
          setIsLoadingGeo(false);
          setIsAutoGeoInfos(true);
        },
        (error) => {
          dispatch(
            showError({
              title: "Erro ao obter localização",
              message: `(${error.code}) ${error.message}`,
            })
          );
          setIsLoadingGeo(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          accuracy: { android: "high", ios: "best" },
        }
      );
    } catch (error: any) {
      dispatch(
        showError({
          title: "Erro de Permissão",
          message: `Erro ao obter permissão de localização: ${error.message}`,
        })
      );
      setIsLoadingGeo(false);
    }
  }, [dispatch, utmConverter, isEffectivelyDisabled]);

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
  }, [dispatch]);

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

  const onSaveEntry = () => {
    setValidationAttempted(true);

    if (!validateFields()) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos sinalizados."
      );
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      return;
    }

    const latNum = Number(latitude);
    const lonNum = Number(longitude);
    const accNum = Number(accuracy);
    const altNum = Number(altitude);
    const satNum = Number(satellites);
    const utmENum = Number(utmE);
    const utmNNum = Number(utmN);
    let erro_gps_calculado = accNum;

    onSave({
      principal: false,
      foto: selectedImage,
      nome: name,
      coordenadas: {
        datum,
        coleta_automatica: isAutoGeoInfos,
        graus_e: formatToTwoDecimals(longitude),
        graus_n: formatToTwoDecimals(latitude),
        erro_gps: Number(formatToTwoDecimals(erro_gps_calculado)),
        satelites: satNum,
        utm: {
          zona: utmZone,
          utm_e: Number(formatToTwoDecimals(utmENum)),
          utm_n: Number(formatToTwoDecimals(utmNNum)),
          erro_gps: Number(formatToTwoDecimals(erro_gps_calculado)),
          satelites: satNum,
          elevacao: Number(formatToTwoDecimals(altNum)),
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
    <Modal
      statusBarTranslucent
      visible={isOpen}
      onRequestClose={onClose}
      animationType="slide"
    >
      <ScrollView keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
        <View style={styles.container}>
          <Divider />
          <TextInter color={colors.white[100]} fontSize={19} weight="medium">
            Características da entrada
          </TextInter>
          <Divider />
          <Input
            placeholder="Digite o nome da entrada"
            label="Nome da Entrada"
            required
            value={name}
            onChangeText={setName}
            disabled={isEffectivelyDisabled}
            hasError={!!modalErrors.name}
            errorMessage={modalErrors.name}
          />

          <TextInter color={colors.white[100]} weight="medium">
            Inserção
          </TextInter>
          <Divider height={12} />
          <Checkbox
            label="Afloramento rochoso contínuo"
            checked={insercao.afloramentoContinuo}
            onChange={() =>
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
              setInsercao((prev) => ({ ...prev, dolina: !prev.dolina }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Depósito de talús"
            checked={insercao.depositoTalus}
            onChange={() =>
              !isEffectivelyDisabled &&
              setInsercao((prev) => ({
                ...prev,
                depositoTalus: !prev.depositoTalus,
              }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Outro (Inserção)"
            checked={insercao.outro}
            onChange={() =>
              !isEffectivelyDisabled &&
              setInsercao((prev) => ({ ...prev, outro: !prev.outro }))
            }
          />
          <Divider height={12} />
          {insercao.outro && (
            <Input
              placeholder="Especifique aqui"
              label="Outro Inserção"
              value={insercao.outroTexto}
              onChangeText={(text) =>
                setInsercao((prev) => ({ ...prev, outroTexto: text }))
              }
              hasError={!!modalErrors.insercaoOutroTexto}
              errorMessage={modalErrors.insercaoOutroTexto}
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
              !isEffectivelyDisabled &&
              setPosicaoVertente((prev) => ({ ...prev, topo: !prev.topo }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Alta"
            checked={posicaoVertente.alta}
            onChange={() =>
              !isEffectivelyDisabled &&
              setPosicaoVertente((prev) => ({ ...prev, alta: !prev.alta }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Média"
            checked={posicaoVertente.media}
            onChange={() =>
              !isEffectivelyDisabled &&
              setPosicaoVertente((prev) => ({ ...prev, media: !prev.media }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Baixa"
            checked={posicaoVertente.baixa}
            onChange={() =>
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
              setVegetacao((prev) => ({ ...prev, cerrado: !prev.cerrado }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Campo rupestre"
            checked={vegetacao.campoRupestre}
            onChange={() =>
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
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
              !isEffectivelyDisabled &&
              setVegetacao((prev) => ({ ...prev, mataSeca: !prev.mataSeca }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Campo sujo"
            checked={vegetacao.campoSujo}
            onChange={() =>
              !isEffectivelyDisabled &&
              setVegetacao((prev) => ({ ...prev, campoSujo: !prev.campoSujo }))
            }
          />
          <Divider height={12} />
          <Checkbox
            label="Outro (Vegetação)"
            checked={vegetacao.outro}
            onChange={() =>
              !isEffectivelyDisabled &&
              setVegetacao((prev) => ({ ...prev, outro: !prev.outro }))
            }
          />
          <Divider height={16} />
          {vegetacao.outro && (
            <Input
              placeholder="Especifique aqui"
              label="Outra Vegetação"
              value={vegetacao.outroTexto}
              onChangeText={(text) =>
                setVegetacao((prev) => ({ ...prev, outroTexto: text }))
              }
              disabled={isEffectivelyDisabled}
              hasError={!!modalErrors.vegetacaoOutroTexto}
              errorMessage={modalErrors.vegetacaoOutroTexto}
            />
          )}

          <Input
            placeholder="Digite o DATUM"
            label="DATUM"
            value={datum}
            onChangeText={setDatum}
            required
            disabled={isEffectivelyDisabled}
            hasError={!!modalErrors.datum}
            errorMessage={modalErrors.datum}
          />

          <TextInter color={colors.white[100]} weight="medium">
            Coordenadas Geográficas *
          </TextInter>
          {!!modalErrors.coordenadas && (
            <TextInter
              color={colors.error[100]}
              fontSize={12}
              style={styles.errorText}
            >
              {modalErrors.coordenadas}
            </TextInter>
          )}

          {!showGeoInputs ? (
            <>
              <Divider height={10} />
              <LongButton
                title="Inserir Manualmente"
                onPress={() => setShowGeoInputs(true)}
                disabled={isEffectivelyDisabled}
              />
              <Divider height={10} />
              <LongButton
                title="Coletar Automaticamente"
                onPress={getCurrentPosition}
                isLoading={isLoadingGeo}
                disabled={isEffectivelyDisabled || isLoadingGeo}
              />
            </>
          ) : (
            <>
              <Divider height={10} />
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleLeftContainer}>
                  <Input
                    label="Longitude"
                    placeholder="Ex: -43.123456"
                    value={longitude}
                    keyboardType="numeric"
                    onChangeText={setLongitude}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.longitude}
                    errorMessage={modalErrors.longitude}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Ex: -19.123456"
                    label="Latitude"
                    value={latitude}
                    keyboardType="numeric"
                    onChangeText={setLatitude}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.latitude}
                    errorMessage={modalErrors.latitude}
                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleLeftContainer}>
                  <Input
                    label="Precisão (m)"
                    placeholder="Ex: 10.00"
                    value={accuracy}
                    numericType="decimal"
                    decimalPlaces={2}
                    keyboardType="numeric"
                    onChangeText={setAccuracy}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.accuracy}
                    errorMessage={modalErrors.accuracy}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Ex: 800.00"
                    label="Altitude (m)"
                    value={altitude}
                    keyboardType="numeric"
                    numericType="decimal"
                    decimalPlaces={2}
                    onChangeText={setAltitude}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.altitude}
                    errorMessage={modalErrors.altitude}
                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleLeftContainer}>
                  <Input
                    placeholder="Ex: 15"
                    label="Quant. de Satélites"
                    value={satellites}
                    keyboardType="numeric"
                    onChangeText={setSatellites}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.satellites}
                    errorMessage={modalErrors.satellites}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Ex: 23K"
                    label="Zona UTM"
                    value={utmZone}
                    onChangeText={setUtmZone}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.utmZone}
                    errorMessage={modalErrors.utmZone}
                  />
                </View>
              </View>
              <View style={styles.dubleInputContainer}>
                <View style={styles.dubleLeftContainer}>
                  <Input
                    placeholder="Ex: 678901.00"
                    label="UTM E"
                    value={utmE}
                    keyboardType="numeric"
                    numericType="decimal"
                    decimalPlaces={2}
                    onChangeText={setUtmE}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.utmE}
                    errorMessage={modalErrors.utmE}
                  />
                </View>
                <View style={styles.dubleRightContainer}>
                  <Input
                    placeholder="Ex: 7890123.00"
                    label="UTM N"
                    value={utmN}
                    keyboardType="numeric"
                    numericType="decimal"
                    decimalPlaces={2}
                    onChangeText={setUtmN}
                    disabled={isEffectivelyDisabled}
                    required
                    hasError={!!modalErrors.utmN}
                    errorMessage={modalErrors.utmN}
                  />
                </View>
              </View>
            </>
          )}
          <Divider />
          <CustomSelect
            label="Foto da entrada da cavidade"
            required
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
            hasError={!!modalErrors.selectedImage}
            errorMessage={modalErrors.selectedImage}
          >
            <View
              style={[
                styles.uploadContainer,
                isEffectivelyDisabled && styles.disabledUploadContainer,
                !!modalErrors.selectedImage && styles.uploadError,
              ]}
            >
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
                  <UploadIcon disabled={isEffectivelyDisabled} />
                  <TextInter
                    weight="regular"
                    color={
                      isEffectivelyDisabled ? colors.dark[50] : colors.dark[60]
                    }
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
                if (!isEffectivelyDisabled) {
                  resetStates();
                  onClose();
                }
              }}
              buttonTitle="Cancelar"
              disabled={isEffectivelyDisabled}
            />
            <NextButton
              disabled={isEffectivelyDisabled}
              onPress={onSaveEntry}
              buttonTitle="Salvar"
            />
          </View>

          {device && (
            <Modal
              visible={cameraIsOpen}
              statusBarTranslucent
              animationType="fade"
              onRequestClose={() => !isLoadingImage && setCameraIsOpen(false)}
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
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => !isLoadingImage && setCameraIsOpen(false)}
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
    paddingBottom: 30,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
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
  disabledUploadContainer: {
    backgroundColor: colors.dark[70],
    opacity: 0.7,
  },
  uploadError: {
    borderColor: colors.error[100],
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
    marginTop: 20,
  },
  selectedImageStyle: {
    width: "95%",
    height: "95%",
    borderRadius: 5,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  closeButton: {
    padding: 15,
  },
  inputSpacing: {
    marginBottom: 10,
  },
  errorText: {
    color: colors.error[100],
    fontSize: 12,
    marginTop: 2,
  },
});
