import { KeyboardEvent } from 'react';
import { isComposingEvent } from '@/types/keyboard';

/**
 * キーボードイベントを型安全に処理するカスタムフック
 */
export const useKeyboardEvent = () => {
  /**
   * Enterキーイベントを処理する関数
   * IME入力中は無視される
   */
  const handleEnterKey = (
    event: KeyboardEvent,
    callback: () => void,
    options?: {
      preventDefault?: boolean;
      requireValue?: boolean;
      target?: HTMLInputElement | HTMLTextAreaElement;
    }
  ) => {
    // IME入力中は処理しない
    if (isComposingEvent(event)) {
      return;
    }

    // Enterキーでない場合は処理しない
    if (event.key !== 'Enter') {
      return;
    }

    // 値が必要な場合のチェック
    if (options?.requireValue && options.target) {
      if (!options.target.value.trim()) {
        return;
      }
    }

    // デフォルトでpreventDefaultを実行
    if (options?.preventDefault !== false) {
      event.preventDefault();
    }

    callback();
  };

  /**
   * Escapeキーイベントを処理する関数
   */
  const handleEscapeKey = (
    event: KeyboardEvent,
    callback: () => void,
    options?: { preventDefault?: boolean }
  ) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (options?.preventDefault !== false) {
      event.preventDefault();
    }

    callback();
  };

  return {
    handleEnterKey,
    handleEscapeKey,
    isComposingEvent,
  };
};
