import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectCard from './ProjectCard'

// Mock react-router-dom 的 useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('ProjectCard', () => {
  const baseProject = {
    id: 1,
    title: 'RecipeHub',
    description: 'AI驱动的智能食谱推荐',
    status: 'done',
    category: 'ai',
  }

  function renderCard(props) {
    return render(
      <MemoryRouter>
        <ProjectCard p={props} />
      </MemoryRouter>
    )
  }

  it('应正确渲染项目标题和状态标签', () => {
    renderCard({ project: baseProject, roles: [] })
    expect(screen.getByText('RecipeHub')).toBeInTheDocument()
    expect(screen.getByText('已完成')).toBeInTheDocument()
  })

  it('兼容旧格式数据（直接传 project 对象）', () => {
    renderCard(baseProject)
    expect(screen.getByText('RecipeHub')).toBeInTheDocument()
    expect(screen.getByText('已完成')).toBeInTheDocument()
  })

  it('roles 为 undefined 时不应崩溃', () => {
    expect(() => renderCard(baseProject)).not.toThrow()
  })

  it('有 roles 时显示角色徽章', () => {
    renderCard({
      project: baseProject,
      roles: [
        { name: 'Frontend Dev', emoji: '🎨', needed: 3, filled: 3 },
        { name: 'Backend Dev', emoji: '⚙️', needed: 2, filled: 1 },
      ],
    })
    expect(screen.getByText('Frontend Dev')).toBeInTheDocument()
    expect(screen.getByText('Backend Dev')).toBeInTheDocument()
  })

  it('open 状态显示"查看详情"', () => {
    renderCard({
      project: { ...baseProject, status: 'open' },
      roles: [{ name: 'Designer', needed: 1, filled: 0 }],
    })
    expect(screen.getByText(/查看详情/)).toBeInTheDocument()
  })

  it('done 状态显示"查看成果"', () => {
    renderCard({ project: baseProject, roles: [] })
    expect(screen.getByText('查看成果 →')).toBeInTheDocument()
  })

  it('使用 description 字段作为描述文本', () => {
    renderCard({ project: { ...baseProject, description: '测试描述' }, roles: [] })
    expect(screen.getByText('测试描述')).toBeInTheDocument()
  })
})
