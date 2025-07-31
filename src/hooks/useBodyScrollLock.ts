import { useEffect } from 'react';

/**
 * モーダルが開いている間、bodyのスクロールを無効化するカスタムフック
 * @param isLocked スクロールをロックするかどうか
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // モーダルが開いたときにbodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じたときにスクロールを元に戻す
      document.body.style.overflow = 'unset';
    }

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);
};
