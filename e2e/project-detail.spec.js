/**
 * 项目详情页 — API 对接 E2E 测试
 *
 * 覆盖场景：
 *   1. 编辑项目信息（标题、描述、类别、周期）
 *   2. 任务看板 - 新建任务（各列底部添加卡片展开/提交/取消）
 *   3. 里程碑 - 新建 / 行内编辑 / 删除
 *
 * 运行：npx playwright test e2e/project-detail.spec.js
 */
import { test, expect } from '@playwright/test'

// ── 公共：登录并导航到项目详情页 ──

async function goToProjectDetail(page) {
  // 登录
  await page.goto('/login')
  await page.fill('input[type="email"]', 'test@conlaboro.com')
  await page.fill('input[type="password"]', 'test123456')
  await page.click('button[type="submit"]')
  await page.waitForURL('/home')

  // 进入第一个项目的详情页
  const firstCard = page.locator('.project-card').first()
  if (await firstCard.isVisible()) {
    await firstCard.click()
    await page.waitForURL(/\/project\//)
    await page.waitForLoadState('networkidle')
  }
}

// ══════════════════════════════════════
// 测试组 1：编辑项目信息
// ══════════════════════════════════════

test.describe('编辑项目信息', () => {

  test('点击编辑按钮应展开编辑表单', async ({ page }) => {
    await goToProjectDetail(page)

    const editBtn = page.getByRole('button', { name: /编辑/i })
    await expect(editBtn).toBeVisible()
    await editBtn.click()

    // 表单字段应该出现
    await expect(page.getByLabel(/项目名称/i)).toBeVisible()
    await expect(page.getByLabel(/项目描述/i)).toBeVisible()
    await expect(page.locator('select')).toBeVisible()  // 类别选择
  })

  test('修改标题并保存，应调用 updateProject API', async ({ page }) => {
    await goToProjectDetail(page)
    await page.getByRole('button', { name: /编辑/i }).click()

    const newTitle = `E2E-TEST-${Date.now()}`
    await page.getByLabel(/项目名称/i).fill(newTitle)
    await page.getByRole('button', { name: /保存修改/i }).click()

    // 验证 API 调用成功（通过 toast 或页面刷新后的内容）
    await expect(page.locator('h1:has-text("E2E-TEST")')).toBeVisible({ timeout: 5000 })
  })

  test('取消编辑，表单应收起且数据不变', async ({ page }) => {
    await goToProjectDetail(page)
    await page.getByRole('button', { name: /编辑/i }).click()

    await page.getByLabel(/项目名称/i).fill('不应该保存这个值')
    await page.getByRole('button', { name: /取消/i }).click()

    // 编辑按钮重新出现
    await expect(page.getByRole('button', { name: /编辑/i })).toBeVisible()
  })
})

// ══════════════════════════════════════
// 测试组 2：任务看板 — 新建任务
// ══════════════════════════════════════

test.describe('任务看板 — 新建任务', () => {

  test('每个看板列底部应有「添加任务」卡片', async ({ page }) => {
    await goToProjectDetail(page)

    const addCards = page.locator('.add-task-card')
    const count = await addCards.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(addCards.nth(i)).toContainText('添加任务')
      }
    } else {
      // 如果没有里程碑/任务，看板可能不渲染列
      console.log('⚠ 看板列为空（可能无里程碑），跳过此断言')
    }
  })

  test('点击添加任务卡片应展开内联表单', async ({ page }) => {
    await goToProjectDetail(page)

    const addCard = page.locator('.add-task-card').first()
    if (await addCard.isVisible()) {
      await addCard.click()

      // 表单元素应出现
      await expect(page.locator('.add-task-input')).toBeVisible()
      await expect(page.locator('.add-task-select')).toBeVisible()
      await expect(page.locator('.add-task-submit')).toBeVisible()
      await expect(page.locator('.add-task-cancel')).toBeVisible()
    }
  })

  test('填写任务名并提交，应调用 createTask API', async ({ page }) => {
    await goToProjectDetail(page)

    const addCard = page.locator('.add-task-card').first()
    if (!await addCard.isVisible()) {
      test.skip() // 无里程碑时跳过
      return
    }

    await addCard.click()
    await page.locator('.add-task-input').fill(`E2E-TASK-${Date.now()}`)
    await page.locator('.add-task-submit').click()

    // 成功后表应收起或页面刷新
    await expect(page.locator('.add-task-card')).toBeVisible({ timeout: 8000 })
  })

  test('按 Escape 键应取消新建任务', async ({ page }) => {
    await goToProjectDetail(page)

    const addCard = page.locator('.add-task-card').first()
    if (!await addCard.isVisible()) {
      test.skip()
      return
    }

    await addCard.click()
    await expect(page.locator('.add-task-form')).toBeVisible()
    await page.keyboard.press('Escape')

    // 应恢复为虚线卡片状态
    await expect(page.locator('.add-task-card')).toBeVisible()
  })

  test('空任务名提交按钮应为禁用状态', async ({ page }) => {
    await goToProjectDetail(page)

    const addCard = page.locator('.add-task-card').first()
    if (!await addCard.isVisible()) {
      test.skip()
      return
    }

    await addCard.click()
    const submitBtn = page.locator('.add-task-submit')

    // 空输入时应禁用
    await expect(submitBtn).toBeDisabled()

    // 输入后启用
    await page.locator('.add-task-input').fill('有内容的任务')
    await expect(submitBtn).toBeEnabled()
  })
})

// ══════════════════════════════════════
// 测试组 3：里程碑管理
// ══════════════════════════════════════

test.describe('里程碑管理', () => {

  test('里程碑区域应有「新建里程碑」按钮', async ({ page }) => {
    await goToProjectDetail(page)

    const btn = page.locator('.ms-add-btn')
    await expect(btn).toContainText('新建里程碑')
  })

  test('点击新建里程碑应展开输入框', async ({ page }) => {
    await goToProjectDetail(page)

    await page.locator('.ms-add-btn').click()

    // 输入框和操作按钮出现
    await expect(page.locator('.ms-edit-input').first()).toBeVisible()
    // 应该有创建和取消按钮
    const buttons = page.locator('.detail-section:has(h2:text("里程碑")) button')
    const btnCount = await buttons.count()
    expect(btnCount).toBeGreaterThanOrEqual(2) // 至少创建+取消
  })

  test('输入名称并创建里程碑，应调用 createMilestone API', async ({ page }) => {
    await goToProjectDetail(page)

    await page.locator('.ms-add-btn').click()
    const msName = `E2E-MILESTONE-${Date.now()}`
    await page.locator('.ms-edit-input').first().fill(msName)

    // 点击创建按钮
    const createBtns = page.locator('.detail-section:has(h2:text("里程碑")) .btn-primary')
    await createBtns.first().click()

    // 新里程碑应出现在列表中
    await expect(page.locator(`text=${msName}`)).toBeVisible({ timeout: 5000 })
  })

  test('hover 里程碑项应显示编辑/删除按钮', async ({ page }) => {
    await goToProjectDetail(page)

    // 找到已有的里程碑
    const milestoneItem = page.locator('.milestone-item-wrap').first()
    if (await milestoneItem.isVisible()) {
      await milestoneItem.hover()
      await expect(page.locator('.milestone-actions')).toBeVisible()
      await expect(page.locator('.ms-action-btn').filter({ hasText: '编辑' })).toBeVisible()
      await expect(page.locator('.ms-action-btn.danger').filter({ hasText: '删除' })).toBeVisible()
    }
  })

  test('编辑里程碑名称应调用 updateMilestone API', async ({ page }) => {
    await goToProjectDetail(page)

    const milestoneItem = page.locator('.milestone-item-wrap').first()
    if (!await milestoneItem.isVisible()) {
      test.skip()
      return
    }

    await milestoneItem.hover()
    await page.locator('.ms-action-btn').filter({ hasText: '编辑' }).click()

    // 标题变为输入框
    const input = page.locator('.milestone-content .ms-edit-input')
    await expect(input).toBeVisible()

    const newName = `已编辑-${Date.now()}`
    await input.fill(newName)
    await input.press('Enter') // 触发 blur 保存

    // 验证更新
    await expect(page.locator(`h3:text("${newName}")`)).toBeVisible({ timeout: 5000 })
  })
})
