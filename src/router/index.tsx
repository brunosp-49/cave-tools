import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import DrawerNavigator from "./drawer";

function Routes() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}

export default Routes;
