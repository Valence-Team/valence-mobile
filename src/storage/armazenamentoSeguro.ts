import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const usarArmazenamentoSeguro = Platform.OS === 'ios' || Platform.OS === 'android';

export async function salvarSegredo(chave: string, valor: string): Promise<void> {
  if (usarArmazenamentoSeguro) {
    await SecureStore.setItemAsync(chave, valor);
    return;
  }
  await AsyncStorage.setItem(chave, valor);
}

export async function lerSegredo(chave: string): Promise<string | null> {
  if (usarArmazenamentoSeguro) {
    return SecureStore.getItemAsync(chave);
  }
  return AsyncStorage.getItem(chave);
}

export async function apagarSegredo(chave: string): Promise<void> {
  if (usarArmazenamentoSeguro) {
    await SecureStore.deleteItemAsync(chave);
    return;
  }
  await AsyncStorage.removeItem(chave);
}
