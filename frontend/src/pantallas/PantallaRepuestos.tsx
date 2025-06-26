import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth, isFirestoreError, enableFirestoreNetwork } from '../../firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Inicio: undefined;
  Repuestos: undefined;
};

type PantallaRepuestosProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Repuestos'>;
};

type Repuesto = {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
};

export default function PantallaRepuestos({ navigation }: any) {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [repuestoEditando, setRepuestoEditando] = useState<Repuesto | null>(null);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const obtenerRepuestos = async () => {
    try {
      setCargandoLista(true);
      const querySnapshot = await getDocs(collection(db, 'repuestos'));
      const repuestosData: Repuesto[] = [];
      querySnapshot.forEach((doc) => {
        repuestosData.push({ id: doc.id, ...doc.data() } as Repuesto);
      });
      setRepuestos(repuestosData);
    } catch (error: any) {
      console.error('Error al obtener repuestos:', error);
      if (isFirestoreError(error)) {
        Alert.alert(
          'Sin conexión',
          'No se puede conectar al servidor. Verifica tu conexión a internet.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudieron cargar los repuestos');
      }
    } finally {
      setCargandoLista(false);
    }
  };

  const manejarCerrarSesion = () => {
    auth.signOut()
      .then(() => navigation.replace('Inicio'))
      .catch(error => Alert.alert('Error', error.message));
  };

  useEffect(() => {
    const inicializarFirestore = async () => {
      try {
        await enableFirestoreNetwork();
        obtenerRepuestos();
      } catch (error) {
        console.error('Error al inicializar Firestore:', error);
        Alert.alert(
          'Error de Conexión',
          'No se pudo establecer conexión con el servidor. La aplicación funcionará en modo sin conexión.'
        );
      }
    };
    
    inicializarFirestore();
  }, []);

  useEffect(() => {
    // Configurar el header con el botón de salir
    navigation.setOptions({
      title: 'Gestión de Repuestos',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.botonHeaderSalir} 
          onPress={manejarCerrarSesion}
        >
          <Text style={styles.textoBotonHeaderSalir}>Salir</Text>
        </TouchableOpacity>
      ),
    });

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Solo redirigir si realmente no hay usuario autenticado
        setTimeout(() => {
          if (!auth.currentUser) {
            navigation.replace('Inicio');
          }
        }, 1000);
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const manejarAgregar = async () => {
    if (!nombre.trim() || !cantidad || !precio) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const nuevoRepuesto = {
      nombre: nombre.trim(),
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
    };

    setCargando(true);

    // Crear un ID temporal
    const tempId = Date.now().toString();
    const repuestoTemporal = { id: tempId, ...nuevoRepuesto };

    // Actualizar IU inmediatamente
    setRepuestos(prev => [...prev, repuestoTemporal]);
    limpiarFormulario();
    setModalVisible(false);

    try {
      // Intentar agregar a Firebase
      const docRef = await addDoc(collection(db, 'repuestos'), nuevoRepuesto);
      
      // Si se agregó exitosamente, actualizar el ID
      setRepuestos(prev => 
        prev.map(item => 
          item.id === tempId 
            ? { ...item, id: docRef.id }
            : item
        )
      );
    } catch (error: any) {
      console.error('Error al agregar repuesto:', error);
      
      Alert.alert(
        'Sincronización pendiente',
        'El repuesto se guardó localmente y se sincronizará cuando se restablezca la conexión.',
        [{ text: 'OK' }]
      );
    } finally {
      setCargando(false);
    }
  };

  const manejarEditar = async () => {
    if (!repuestoEditando || !nombre.trim() || !cantidad || !precio) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    const datosActualizados = {
      nombre: nombre.trim(),
      cantidad: parseInt(cantidad),
      precio: parseFloat(precio),
    };

    setCargando(true);

    try {
      // Intentar habilitar la red primero
      await enableFirestoreNetwork();

      // Intentar actualizar en Firebase
      await updateDoc(doc(db, 'repuestos', repuestoEditando.id), datosActualizados);

      // Si la actualización fue exitosa, actualizar UI y cerrar modal
      setRepuestos(prev => 
        prev.map(item => 
          item.id === repuestoEditando.id 
            ? { ...item, ...datosActualizados }
            : item
        )
      );

      limpiarFormulario();
      setModalVisible(false);
      Alert.alert('Éxito', 'Repuesto actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar repuesto:', error);
      if (isFirestoreError(error)) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el repuesto');
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminar = async (id: string, nombre: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar el repuesto "${nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(id);
            try {
              // Intentar habilitar la red primero
              await enableFirestoreNetwork();

              // Intentar eliminar en Firebase
              await deleteDoc(doc(db, 'repuestos', id));

              // Si la eliminación fue exitosa, actualizar UI
              setRepuestos(prev => prev.filter(item => item.id !== id));
              Alert.alert('Éxito', 'Repuesto eliminado correctamente');
            } catch (error: any) {
              console.error('Error al eliminar repuesto:', error);
              if (isFirestoreError(error)) {
                Alert.alert(
                  'Error de conexión',
                  'No se pudo conectar al servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Error', 'No se pudo eliminar el repuesto');
              }
            } finally {
              setEliminando(null);
            }
          },
        },
      ]
    );
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCantidad('');
    setPrecio('');
    setRepuestoEditando(null);
  };

  const abrirModalEditar = (repuesto: Repuesto) => {
    setRepuestoEditando(repuesto);
    setNombre(repuesto.nombre);
    setCantidad(repuesto.cantidad.toString());
    setPrecio(repuesto.precio.toString());
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalVisible(true)}>
          <Text style={styles.textoBotonAgregar}>Agregar Nuevo Repuesto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonActualizar} onPress={obtenerRepuestos}>
          <Text style={styles.textoBotonActualizar}>↻</Text>
        </TouchableOpacity>
      </View>

      {cargandoLista ? (
        <View style={styles.contenedorCarga}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.textoCarga}>Cargando repuestos...</Text>
        </View>
      ) : (
        <FlatList
          data={repuestos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRepuesto}>
              <View style={styles.infoRepuesto}>
                <Text style={styles.nombreRepuesto}>{item.nombre}</Text>
                <Text style={styles.detallesRepuesto}>
                  Cantidad: {item.cantidad} | Precio: ${item.precio}
                </Text>
              </View>
              <View style={styles.botonesAccion}>
                <TouchableOpacity
                  style={[styles.botonAccion, styles.botonEditar]}
                  onPress={() => abrirModalEditar(item)}
                >
                  <Text style={styles.textoBotonAccion}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botonAccion, styles.botonEliminar]}
                  onPress={() => manejarEliminar(item.id, item.nombre)}
                >
                  <Text style={styles.textoBotonAccion}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={cargandoLista}
          onRefresh={obtenerRepuestos}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          limpiarFormulario();
          setModalVisible(false);
        }}
      >
        <View style={styles.contenedorModal}>
          <View style={styles.contenidoModal}>
            <Text style={styles.tituloModal}>
              {repuestoEditando ? 'Editar Repuesto' : 'Agregar Nuevo Repuesto'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={precio}
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
            />
            <View style={styles.botonesModal}>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonCancelar]}
                onPress={() => {
                  limpiarFormulario();
                  setModalVisible(false);
                }}
                disabled={cargando}
              >
                <Text style={styles.textoBotonModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar, cargando && styles.botonDeshabilitado]}
                onPress={repuestoEditando ? manejarEditar : manejarAgregar}
                disabled={cargando}
              >
                {cargando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textoBotonModal}>
                    {repuestoEditando ? 'Guardar' : 'Agregar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  botonHeaderSalir: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 10,
  },
  textoBotonHeaderSalir: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 15,
  },
  botonAgregar: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  textoBotonAgregar: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  botonActualizar: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonActualizar: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemRepuesto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  infoRepuesto: {
    flex: 1,
  },
  nombreRepuesto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detallesRepuesto: {
    color: '#666',
  },
  botonesAccion: {
    flexDirection: 'row',
  },
  botonAccion: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  botonEditar: {
    backgroundColor: '#007aff',
  },
  botonEliminar: {
    backgroundColor: '#ff3b30',
  },
  textoBotonAccion: {
    color: '#fff',
    fontSize: 12,
  },
  contenedorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contenidoModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonModal: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  botonCancelar: {
    backgroundColor: '#666',
  },
  botonGuardar: {
    backgroundColor: '#000',
  },
  textoBotonModal: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
});
