/**
 * UIラベルの定数定義
 * 一貫性のある表現を保つための共通定数
 */

export const LABELS = {
  // 基本アクション
  CREATE: '作成',
  ADD: '追加',
  SAVE: '保存',
  CANCEL: 'キャンセル',
  DELETE: '削除',
  EDIT: '編集',
  CLOSE: '閉じる',
  BACK: '戻る',
  CONFIRM: '確認',
  COPY: 'コピー',
  SHARE: '共有',

  // ステータス
  LOADING: '読み込み中...',
  SAVING: '保存中...',
  DELETING: '削除中...',
  PROCESSING: '処理中...',
  COMPLETE: '完了',
  ERROR: 'エラーが発生しました',
  SUCCESS: '成功しました',
  EMPTY: 'データがありません',

  // 認証
  LOGIN: 'ログイン',
  LOGOUT: 'ログアウト',

  // よく使う項目名
  TRIP: '旅行',
  SCHEDULE: 'スケジュール',
  CHECKLIST: 'チェックリスト',
  ITEM: '項目',
  FILE: 'ファイル',
  MEMBER: 'メンバー',
  ACCOUNT: 'アカウント',
  MEMO: 'メモ',
  SETTINGS: '設定',

  // よく使うフレーズ
  NEW_TRIP: '新しい旅行',
  CREATE_TRIP: '新しい旅行を作成',
  ADD_SCHEDULE: 'スケジュールを追加',
  ADD_ITEM: '項目を追加',
  ADD_FILE: 'ファイル追加',
  TRIP_TITLE: '旅行名',
  DISPLAY_NAME: '表示名',
  ACCOUNT_SETTINGS: 'アカウント設定',

  // プレースホルダー
  ENTER_TITLE: 'タイトルを入力',
  ENTER_NAME: '名前を入力',
  ADD_ITEM_PLACEHOLDER: '新しい項目を追加...',

  // エラーメッセージ
  REQUIRED: '必須項目です',
  SAVE_FAILED: '保存に失敗しました',
  DELETE_FAILED: '削除に失敗しました',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
} as const;

// 動的メッセージ生成関数
export const getMessage = {
  // 削除確認メッセージ
  confirmDelete: (item: string) => `この${item}を削除してもよろしいですか？`,

  // 成功メッセージ
  createSuccess: (item: string) => `${item}を作成しました`,
  addSuccess: (item: string) => `${item}を追加しました`,
  updateSuccess: (item: string) => `${item}を更新しました`,
  deleteSuccess: (item: string) => `${item}を削除しました`,

  // 失敗メッセージ
  saveFailed: (item: string) => `${item}の保存に失敗しました`,
  deleteFailed: (item: string) => `${item}の削除に失敗しました`,

  // その他
  loading: (item: string) => `${item}を読み込み中...`,
  notFound: (item: string) => `${item}が見つかりません`,
  required: (field: string) => `${field}を入力してください`,
} as const;

// 使用例:
// getMessage.confirmDelete(LABELS.TRIP) → "この旅行を削除してもよろしいですか？"
// getMessage.createSuccess(LABELS.SCHEDULE) → "スケジュールを作成しました"
// getMessage.required(LABELS.TRIP_TITLE) → "旅行名を入力してください"

// 型安全性のための型定義
export type LabelKeys = typeof LABELS;
export type MessageFunctions = typeof getMessage;
