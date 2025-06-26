import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirestoreError, enableFirestoreNetwork } from '../../firebaseConfig';

export default function PantallaLogin({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarInicioSesion = async () => {
    if (!correo.trim() || !contrasena) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setCargando(true);
    try {
      // Intentar habilitar la red de Firestore
      await enableFirestoreNetwork();
      
      const credencialesUsuario = await signInWithEmailAndPassword(auth, correo, contrasena);
      const usuario = credencialesUsuario.user;
      console.log('Usuario conectado:', usuario.email);
      navigation.navigate('Repuestos');
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      
      if (isFirestoreError(error)) {
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.'
        );
      } else {
        // Traducir mensajes de error comunes
        let mensaje = 'Error al iniciar sesión. Por favor intente nuevamente.';
        if (error.code === 'auth/user-not-found') {
          mensaje = 'No existe una cuenta con este correo electrónico.';
        } else if (error.code === 'auth/wrong-password') {
          mensaje = 'Contraseña incorrecta.';
        } else if (error.code === 'auth/invalid-email') {
          mensaje = 'El formato del correo electrónico no es válido.';
        } else if (error.code === 'auth/too-many-requests') {
          mensaje = 'Demasiados intentos fallidos. Por favor, intente más tarde.';
        }
        Alert.alert('Error', mensaje);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.titulo}>Gestión de Repuestos</Text>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.boton, cargando && styles.botonDeshabilitado]} 
          onPress={manejarInicioSesion}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBoton}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.botonSecundario} 
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={styles.textoBotonSecundario}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  boton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonSecundario: {
    padding: 15,
    alignItems: 'center',
  },
  textoBotonSecundario: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
