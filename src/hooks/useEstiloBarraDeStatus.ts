import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

export function useEstiloBarraDeStatus(estilo: 'light' | 'dark'): void {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(estilo, true);
    }, [estilo]),
  );
}
