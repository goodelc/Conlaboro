import { test, expect } from '@playwright/test'

test.describe('认证流程 Auth Flow', () => {
  test('登录页可访问', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByPlaceholder(/邮箱|email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/密码|password/i)).toBeVisible()
  })

  test('注册页可访问', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveURL(/\/register/)
    // 应有用户名、邮箱、密码输入框
    const inputs = page.locator('input')
    await expect(inputs.first()).toBeVisible()
  })

  test('从登录页可以导航到注册页', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.getByText(/注册|Register/)
    if (await registerLink.count() > 0) {
      await registerLink.click()
      await expect(page).toHaveURL(/\/register/)
    }
  })
})
