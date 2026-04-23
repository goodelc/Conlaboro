// 全局常量定义，避免各组件重复定义

/** 项目状态映射 */
export const STATUS_MAP = { open: '招募中', progress: '进行中', done: '已完成' }

/** 状态对应的 CSS tag class */
export const TAG_CLASS = { open: 'tag-open', progress: 'tag-progress', done: 'tag-done' }

/** 状态颜色（用于 inline style） */
export const STATUS_COLORS = {
  done:   { bg: 'rgba(34,139,34,0.1)',   text: 'var(--success)' },
  progress:{ bg: 'rgba(212,168,67,0.15)',  text: '#8B6914' },
  open:   { bg: 'rgba(212,33,61,0.1)',    text: 'var(--red)' },
}

/** 等级颜色 */
export const LEVEL_COLORS = {
  1: 'var(--warm-gray)', 2: '#4A90D9', 3: 'var(--success)',
  4: '#8B5CF6', 5: 'var(--gold)', 6: 'var(--red)',
}

/** 等级升级所需 XP 阈值 */
export const NEXT_LEVEL_XP = [0, 100, 500, 1500, 4000, 10000, 99999]

/** 项目卡片 emoji 图标映射（按 id） */
const PROJECT_EMOJIS = ['🍳','🧠','🔄','📋','👴','🎮']
export function getProjectEmoji(id) { return PROJECT_EMOJIS[id] || '📋' }
