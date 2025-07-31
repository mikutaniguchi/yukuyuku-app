import { KeyboardEvent } from 'react';

/**
 * IME入力中かどうかを型安全にチェックするヘルパー関数
 * React 19でisComposingプロパティが直接アクセスできなくなったため
 */
export const isComposingEvent = (event: KeyboardEvent): boolean => {
  return (event.nativeEvent as globalThis.KeyboardEvent).isComposing ?? false;
};

/**
 * 拡張されたキーボードイベントの型定義
 */
export interface ComposingKeyboardEvent
  extends KeyboardEvent<HTMLInputElement> {
  nativeEvent: globalThis.KeyboardEvent & { isComposing?: boolean };
}
