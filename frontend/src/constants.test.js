import { describe, it, expect } from 'vitest'
import { STATUS_MAP, TAG_CLASS } from './constants'

describe('常量定义', () => {
  describe('STATUS_MAP', () => {
    it('包含所有四种状态', () => {
      expect(Object.keys(STATUS_MAP)).toContain('open')
      expect(Object.keys(STATUS_MAP)).toContain('progress')
      expect(Object.keys(STATUS_MAP)).toContain('done')
    })

    it('每种状态都有中文标签', () => {
      expect(STATUS_MAP.open).toBeTruthy()
      expect(STATUS_MAP.progress).toBeTruthy()
      expect(STATUS_MAP.done).toBeTruthy()
    })
  })

  describe('TAG_CLASS', () => {
    it('每个状态都有对应的 CSS 类名', () => {
      expect(typeof TAG_CLASS.open).toBe('string')
      expect(typeof TAG_CLASS.progress).toBe('string')
      expect(typeof TAG_CLASS.done).toBe('string')
    })
  })
})
