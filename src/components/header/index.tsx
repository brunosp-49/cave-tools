import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ArrowCircleLeftIcon from "../icons/arrowCircleLeft";
import { FC, ReactElement } from "react";
import LinesMenu from "../icons/linesMenu";
import TextInter from "../textInter";
import { colors } from "../../assets/colors";
import { DrawerNavigationProp } from "@react-navigation/drawer";

interface HeaderProps {
  title?: string;
  navigation?: DrawerNavigationProp<any, any>;
  disableTitle?: boolean;
  disableReturn?: boolean;
  onCustomReturn?: () => void;
  disableRightMenu?: boolean;
  helloLeftComponent?: ReactElement;
}

export const Header: FC<HeaderProps> = ({
  title,
  disableTitle,
  disableReturn,
  disableRightMenu,
  onCustomReturn,
  navigation,
  helloLeftComponent,
}) => {

  return (
    <View style={styles.container}>
      {!disableReturn ? (
        <TouchableOpacity
          onPress={() => {
            if (onCustomReturn) {
              onCustomReturn();
            } else if (navigation) {
              console.log('here')
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
      {!disableRightMenu && navigation ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <LinesMenu size={19} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 19, height: 19 }}></View>
      )}
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
