import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function PantallaRegistro({ navigation }: any) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const manejarRegistro = async () => {
    if (contrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const credencialesUsuario = await createUserWithEmailAndPassword(auth, correo, contrasena);
      const usuario = credencialesUsuario.user;
      console.log('Usuario registrado:', usuario.email);
      Alert.alert('Éxito', 'Usuario registrado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Inicio')
        }
      ]);
    } catch (error: any) {
      let mensajeError = 'Error al registrar usuario';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensajeError = 'Este correo electrónico ya está registrado';
          break;
        case 'auth/invalid-email':
          mensajeError = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          mensajeError = 'La contraseña es muy débil';
          break;
        default:
          mensajeError = error.message;
      }
      
      Alert.alert('Error', mensajeError);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.titulo}>Crear Cuenta</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#666"
          value={confirmarContrasena}
          onChangeText={setConfirmarContrasena}
          secureTextEntry
        />
        <TouchableOpacity style={styles.boton} onPress={manejarRegistro}>
          <Text style={styles.textoBoton}>Registrarse</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.botonSecundario} 
          onPress={() => navigation.navigate('Inicio')}
        >
          <Text style={styles.textoBotonSecundario}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    marginBottom: 15,
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
});
