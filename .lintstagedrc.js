module.exports = {
  // TypeScriptファイルに対して
  '*.{ts,tsx}': [
    // 型チェックを実行（全体チェック - Vercelエラー防止重視）
    () => 'npm run type-check',
    // ESLintで自動修正（ファイル指定）
    'eslint --fix',
  ],
  // 全てのファイルに対してPrettierフォーマット
  '*.{js,jsx,ts,tsx,json,css,md}': ['prettier --write'],
};
