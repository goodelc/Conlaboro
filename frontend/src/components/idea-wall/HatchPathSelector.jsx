import { memo } from 'react'
import styles from './HatchPathSelector.module.css'

export default memo(function HatchPathSelector({ ideaContent, onSelect, onClose }) {
  const handleSelect = (mode) => {
    onSelect({ mode, ideaContent })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>你想怎么开始？</h2>
          <p className={styles.subtitle}>两种方式都可以做出很棒的项目</p>
          <button className={styles.closeBtn} onClick={onClose} title="关闭">✕</button>
        </div>

        {/* Path Cards */}
        <div className={styles.paths}>
          {/* AI Path */}
          <button
            className={`${styles.pathCard} ${styles.aiCard}`}
            onClick={() => handleSelect('ai')}
            type="button"
          >
            <div className={styles.pathIcon}>🧠</div>
            <h3>AI 帮我规划</h3>
            <p className={styles.pathDesc}>
              AI 分析你的想法，自动推荐项目名称、
              角色配置、阶段目标
            </p>
            <ul className={styles.pathFeatures}>
              <li>⚡ 自动分析需求</li>
              <li>🎯 推荐团队角色</li>
              <li>📋 生成阶段规划</li>
            </ul>
            <span className={styles.pathCta}>开始分析 &rarr;</span>
          </button>

          {/* Manual Path */}
          <button
            className={`${styles.pathCard} ${styles.manualCard}`}
            onClick={() => handleSelect('manual')}
            type="button"
          >
            <div className={styles.pathIcon}>✏️</div>
            <h3>我自己来规划</h3>
            <p className={styles.pathDesc}>
              完全自主控制，自行填写所有信息
            </p>
            <ul className={styles.pathFeatures}>
              <li>📝 自由定义所有内容</li>
              <li>⚙️ 灵活配置角色人数</li>
              <li>📒 自定义里程碑</li>
            </ul>
            <span className={styles.pathCta}>开始创建 &rarr;</span>
          </button>
        </div>

        {/* Footer hint */}
        <p className={styles.hint}>
          💡 选择后可以随时修改，不用担心选错
        </p>
      </div>
    </div>
  )
})
