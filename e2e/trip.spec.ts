import { test, expect } from '@playwright/test';

test.describe('旅行管理機能', () => {
  test.beforeEach(async ({ page }) => {
    // ゲストログインする
    await page.goto('/');
    await page.getByText('ゲストとして閲覧').click();
    // 旅行一覧ページが表示されるまで待つ
    await page.waitForSelector('h1:has-text("旅行一覧")');
  });

  test('新しい旅行を作成できる', async ({ page }) => {
    // 新しい旅行を作成ボタンをクリック
    await page.getByRole('button', { name: '新しい旅行を作成' }).click();

    // 旅行作成モーダルが表示される
    await expect(
      page.getByRole('heading', { name: '新しい旅行を作成' })
    ).toBeVisible();

    // フォームに入力
    await page.getByLabel('旅行名').fill('テスト旅行');
    await page.getByLabel('初日').fill('2024-12-20');
    await page.getByLabel('最終日').fill('2024-12-25');

    // 作成ボタンをクリック
    await page.getByRole('button', { name: '作成する' }).click();

    // 旅行詳細ページに遷移
    await expect(page).toHaveURL(/\/trip\/.+/);
    await expect(page.getByText('テスト旅行')).toBeVisible();
  });

  test('旅行一覧から旅行を選択できる', async ({ page }) => {
    // まず旅行を作成
    await page.getByRole('button', { name: '新しい旅行を作成' }).click();
    await page.getByLabel('旅行名').fill('選択テスト旅行');
    await page.getByLabel('初日').fill('2024-12-01');
    await page.getByLabel('最終日').fill('2024-12-05');
    await page.getByRole('button', { name: '作成する' }).click();

    // ホームに戻る
    await page.goto('/');

    // 作成した旅行をクリック
    await page.getByText('選択テスト旅行').click();

    // 旅行詳細ページに遷移
    await expect(page).toHaveURL(/\/trip\/.+/);
    await expect(page.getByText('選択テスト旅行')).toBeVisible();
  });
});
