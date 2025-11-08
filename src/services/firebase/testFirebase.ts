import firestore from '@react-native-firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testando conexão com Firebase...');
    
    await firestore()
      .collection('test')
      .add({
        message: 'Firebase conectado com sucesso!',
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    
    console.log('Firebase conectado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Firebase:', error);
    return false;
  }
};