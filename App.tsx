import React, { useEffect } from "react";
import { SplashScreen } from "./src/view/spashScreen";
import Routes from "./src/router";
import { useDispatch } from "react-redux";
import { LoadingModal } from "./src/components/modal/loadingModal";
import { ErrorModal } from "./src/components/modal/errorModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { fetchAllUsers } from "./src/db/controller";
import { setUserName } from "./src/redux/userSlice";

export default function App() {
  const [splashScreen, setSplashScreen] = React.useState(true);
  const dispatch = useDispatch();

  useEffect(()=>{
    (async()=>{
      const user = await fetchAllUsers();
      console.log({user})
      if (user.length > 0) {
        dispatch(setUserName(user[0].user_name));
      }
    })();
  },[])

  

  React.useEffect(() => {
    setTimeout(async() => {
      setSplashScreen(false);
      (async()=>{
        const user = await fetchAllUsers();
        console.log({user})
        if (user.length > 0) {
          dispatch(setUserName(user[0].user_name));
        }
      })();
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
