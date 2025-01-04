import React from "react";
import { SplashScreen } from "./src/view/spashScreen";
import Routes from "./src/router";
import { useDispatch, useSelector } from "react-redux";
import { LoadingModal } from "./src/components/modal/loadingModal";
import { ErrorModal } from "./src/components/modal/errorModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [splashScreen, setSplashScreen] = React.useState(true);
  const { isLoading, errorMessage, errorTitle, hasError } = useSelector(
    (state: {
      loading: {
        isLoading: boolean;
        hasError: boolean;
        errorTitle: string;
        errorMessage: string;
      };
    }) => state.loading
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    setTimeout(() => {
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
