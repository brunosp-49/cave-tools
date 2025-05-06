// hooks/useKeyboard.js
import { useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from '../redux/store';

export default function useKeyboard() {
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardOpen;
}

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;