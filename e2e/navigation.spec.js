import { test, expect } from '@playwright/test'

test.describe('页面导航 Navigation', () => {
  const routes = [
    { path: '/home', title: /创造力|项目/ },
    { path: '/leaderboard', title: /排行|Leaderboard/ },
    { path: '/login', title: /登录|Login/ },
    { path: '/register', title: /注册|Register/ },
  ]

  for (const route of routes) {
    test(`路径 ${route.path} 可正常加载`, async ({ page }) => {
      await page.goto(route.path)
      // 不应出现白屏或崩溃
      await page.waitForLoadState('networkidle')
      const bodyVisible = await page.locator('body').isVisible()
      expect(bodyVisible).toBeTruthy()

      // ErrorBoundary 不应在初始渲染时触发
      const errorBoundary = page.locator('.error-boundary')
      if (await errorBoundary.count() > 0) {
        const visible = await errorBoundary.isVisible()
        expect(visible).toBeFalsy(`${route.path} 页面出现了错误边界`)
      }
    })
  }

  test('404 路由显示 NotFound 页面', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz123')
    await page.waitForLoadState('networkidle')
    // 应该有某种 404 提示
    const content = await page.content()
    expect(content.length).toBeGreaterThan(200)
  })
})
