// navigation/AuthNavigator.tsx (Novo arquivo ou no mesmo lugar do Drawer)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Login } from '../view/login'; // Importe suas telas
import { Register } from '../view/register';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false,  }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      {/* Adicione outras telas de autenticação aqui, se houver (ex: Esqueceu Senha) */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;