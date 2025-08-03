import { test, expect } from '@playwright/test';

test.describe('ログイン機能', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/');

    // ログインモーダルが表示されることを確認
    await expect(page.getByText('旅のスケジュール')).toBeVisible();
    await expect(page.getByText('Googleアカウントでログイン')).toBeVisible();
  });

  test('ゲストログインができる', async ({ page }) => {
    await page.goto('/');

    // ゲストログインボタンをクリック
    await page.getByText('ゲストとして閲覧').click();

    // ログイン後のページが表示されることを確認
    await expect(page.getByRole('heading', { name: '旅行一覧' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: '新しい旅行を作成' })
    ).toBeVisible();
  });
});
