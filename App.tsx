import React from "react";
import { SplashScreen } from "./src/view/spashScreen";
import Routes from "./src/router";
import { useDispatch } from "react-redux";
import { LoadingModal } from "./src/components/modal/loadingModal";
import { ErrorModal } from "./src/components/modal/errorModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [splashScreen, setSplashScreen] = React.useState(true);

  

  React.useEffect(() => {
    setTimeout(async() => {
      setSplashScreen(false);
    }, 3000);
  }, []);

  return splashScreen ? (
    <SplashScreen />
  ) : (
    <>
      <GestureHandlerRootView>
        <Routes />
        <LoadingModal />
        <ErrorModal />
      </GestureHandlerRootView>
    </>
  );
}
