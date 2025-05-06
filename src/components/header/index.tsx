import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ArrowCircleLeftIcon from "../icons/arrowCircleLeft";
import { FC, ReactElement, useState } from "react";
import LinesMenu from "../icons/linesMenu";
import TextInter from "../textInter";
import { colors } from "../../assets/colors";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useInternetConnection } from "../../hook/useInternetConnection";
import { UploadCavitiesModal } from "./modal/uploadModalCavities";

interface HeaderProps {
  title?: string;
  navigation?: DrawerNavigationProp<any, any>;
  disableTitle?: boolean;
  disableReturn?: boolean;
  onCustomReturn?: () => void;
  disableRightMenu?: boolean;
  helloLeftComponent?: ReactElement;
  uploadButton?: boolean;
  onUploadSuccess?: () => void;
}

export const Header: FC<HeaderProps> = ({
  title,
  disableTitle,
  disableReturn,
  disableRightMenu,
  onCustomReturn,
  navigation,
  helloLeftComponent,
  uploadButton,
  onUploadSuccess
}) => {
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const isConnected = useInternetConnection();

  const handleOpenUploadModal = () => {
    if (isConnected) {
      setIsUploadModalVisible(true);
    } else {
      console.log("Cannot open upload modal: No internet connection.");
    }
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalVisible(false);
  };

  const handleUploadSuccessAndClose = () => {
    if (onUploadSuccess) {
        onUploadSuccess(); // Call the callback passed from the screen
    }
    handleCloseUploadModal(); // Close the modal after success is handled
}


  return (
    <View style={styles.container}>
      {!disableReturn ? (
        <TouchableOpacity
          onPress={() => {
            if (onCustomReturn) {
              onCustomReturn();
            } else if (navigation) {
              navigation.goBack();
            }
          }}
        >
          <ArrowCircleLeftIcon size={49} />
        </TouchableOpacity>
      ) : helloLeftComponent ? (
        helloLeftComponent
      ) : (
        <View style={{ width: 49, height: 49 }}></View>
      )}
      {!disableTitle ? (
        <TextInter
          numberOfLines={2}
          color={colors.white[100]}
          fontSize={title === "Login" ? 26 : 21}
          weight="medium"
          style={{
            maxWidth: "60%",
            textAlign: "center",
          }}
        >
          {title}
        </TextInter>
      ) : (
        <View />
      )}
      {!disableRightMenu && navigation && !uploadButton ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <LinesMenu size={19} />
        </TouchableOpacity>
      ) : !disableRightMenu && uploadButton ? (
        <TouchableOpacity
          disabled={!isConnected}
          onPress={handleOpenUploadModal}
        >
          <Ionicons
            name="cloud-upload-sharp"
            size={30}
            color={isConnected ? colors.accent[100] : colors.dark[60]}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 19, height: 19 }}></View>
      )}
      <UploadCavitiesModal
        visible={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
        onUploadSuccess={handleUploadSuccessAndClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    marginTop: Platform.OS === "ios" ? 0 : 50,
    minHeight: 50,
  },
});
