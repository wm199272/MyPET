import { Alert, Platform, type AlertButton } from 'react-native';

if (Platform.OS === 'web') {
  Alert.alert = (title, message, buttons) => {
    const text = [title, message].filter(Boolean).join('\n');
    const list: AlertButton[] = buttons && buttons.length > 0 ? buttons : [{ text: '确定' }];
    if (list.length === 1) {
      window.alert(text);
      list[0]?.onPress?.();
      return;
    }
    const confirm = [...list].reverse().find((button) => button.style === 'destructive') ?? list[list.length - 1];
    if (window.confirm(text)) confirm?.onPress?.();
  };
}
