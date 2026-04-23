import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.mock 会提升到文件顶部，mock 变量必须用 vi.hoisted
const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
}))

// 模拟 request 模块
vi.mock('../../api/request', () => ({
  default: {
    get: mockGet,
    put: mockPut,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../notification'

describe('通知 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getNotifications 调用 GET /notifications', async () => {
    mockGet.mockResolvedValue([{ id: 1, title: '测试' }])
    await getNotifications()
    expect(mockGet).toHaveBeenCalledWith('/notifications')
  })

  it('getUnreadCount 返回未读数', async () => {
    mockGet.mockResolvedValue(5)
    const count = await getUnreadCount()
    expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count')
    expect(count).toBe(5)
  })

  it('markAsRead 调用 PUT /notifications/{id}/read', async () => {
    mockPut.mockResolvedValue(null)
    await markAsRead(42)
    expect(mockPut).toHaveBeenCalledWith('/notifications/42/read')
  })

  it('markAllAsRead 调用 PUT /notifications/read-all', async () => {
    mockPut.mockResolvedValue(null)
    await markAllAsRead()
    expect(mockPut).toHaveBeenCalledWith('/notifications/read-all')
  })
})

// 用户 API 测试
import { getAllUsers, getUserProfile } from '../user'

describe('用户 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllUsers 调用 GET /users', async () => {
    mockGet.mockResolvedValue([{ id: 1, name: 'Alex' }])
    const users = await getAllUsers()
    expect(mockGet).toHaveBeenCalledWith('/users')
    expect(users).toEqual([{ id: 1, name: 'Alex' }])
  })

  it('getUserProfile 调用 GET /users/{id}', async () => {
    mockGet.mockResolvedValue({ id: 1, name: 'Alex' })
    const user = await getUserProfile(1)
    expect(mockGet).toHaveBeenCalledWith('/users/1')
    expect(user.name).toBe('Alex')
  })
})

// 项目 API 测试
import { getAllProjects, getProjectDetail } from '../project'

describe('项目 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAllProjects 返回项目列表', async () => {
    const mockData = [
      { project: { id: 1, title: 'Test' }, roles: [] },
      { project: { id: 2, title: 'Demo' }, roles: [{ name: 'Dev' }] },
    ]
    mockGet.mockResolvedValue(mockData)
    const projects = await getAllProjects()
    expect(mockGet).toHaveBeenCalledWith('/projects')
    expect(projects.length).toBe(2)
    expect(projects[0].project.title).toBe('Test')
  })

  it('getProjectDetail 调用 GET /projects/{id}', async () => {
    mockGet.mockResolvedValue({ project: {}, roles: [], milestones: [] })
    const detail = await getProjectDetail(3)
    expect(mockGet).toHaveBeenCalledWith('/projects/3')
  })
})
