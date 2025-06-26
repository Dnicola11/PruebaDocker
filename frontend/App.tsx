import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import PantallaLogin from './src/pantallas/PantallaLogin';
import PantallaRepuestos from './src/pantallas/PantallaRepuestos';
import PantallaRegistro from './src/pantallas/PantallaRegistro';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Inicio"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Inicio" 
          component={PantallaLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Repuestos" 
          component={PantallaRepuestos}
          options={{ 
            title: 'Gestión de Repuestos',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="Registro" 
          component={PantallaRegistro}
          options={{ 
            title: 'Registro de Usuario',
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
