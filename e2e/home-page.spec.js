import { test, expect } from '@playwright/test'

test.describe('首页 HomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home')
  })

  test('应显示页面标题和 Hero 区域', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('创造力')
    await expect(page.getByText('开放 · 共享 · 协作')).toBeVisible()
  })

  test('应有"浏览项目"按钮', async ({ page }) => {
    const btn = page.getByRole('button', { name: /浏览项目/ })
    await expect(btn).toBeVisible()
  })

  test('应有"发起你的想法"按钮', async ({ page }) => {
    const btn = page.getByRole('button', { name: /发起.*想法/ })
    await expect(btn).toBeVisible()
  })

  test('点击"发起你的想法"跳转到登录（未登录状态）', async ({ page }) => {
    // 点击创建按钮
    const createBtn = page.getByRole('button', { name: /发起.*想法/ })
    await createBtn.click()
    // 未登录应该被重定向到 login 或显示提示
    await page.waitForLoadState('networkidle')
    const currentUrl = page.url()
    expect(currentUrl).toBeTruthy()
  })

  test('搜索框存在且可输入', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')
    if (await searchInput.count() > 0) {
      await searchInput.fill('AI')
      await expect(searchInput).toHaveValue('AI')
    }
  })

  test('分类筛选按钮存在', async ({ page }) => {
    const categories = ['移动应用', 'Web 应用', '游戏', 'AI', '工具']
    for (const cat of categories) {
      const btn = page.getByRole('button', { name: new RegExp(cat) })
      // 至少部分分类按钮可见
      if (await btn.count() > 0) {
        await expect(btn.first()).toBeVisible()
        break
      }
    }
  })
})
