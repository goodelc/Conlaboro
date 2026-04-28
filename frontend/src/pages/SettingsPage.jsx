import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { updateProfile } from '../api'
import styles from './SettingsPage.module.css'

/* ── 复用 Toggle / RoleTag ── */
function ToggleSwitch({ defaultActive, onChange }) {
  const [active, setActive] = useState(defaultActive ?? true)
  return (
    <div className={`${styles.toggleSwitch} ${active ? styles.toggleSwitchActive : ''}`}
      onClick={() => {
        const next = !active
        setActive(next)
        onChange?.(next)
      }}
    ></div>
  )
}

function RoleTag({ children, defaultActive }) {
  const [active, setActive] = useState(!!defaultActive)
  return <span
    className={`${styles.roleTag} ${active ? styles.roleTagActive : ''}`}
    onClick={() => setActive(!active)}
  >{children}</span>
}

/* ── 编辑弹窗 ── */
function EditModal({ open, title, desc, children, onClose, onSave }) {
  if (!open) return null
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className={styles.editModalDesc}>{desc}</p>
        <div className={styles.editModalBody}>
          {children}
          <div className={styles.editModalActions}>
            <button className={`btn-secondary ${styles.editModalBtn}`} onClick={onClose}>取消</button>
            <button className={`btn-primary ${styles.editModalBtn}`} onClick={onSave}>保存</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { currentUser, isLoggedIn, showToast, login } = useApp()
  const { users } = useData()

  /* ── 弹窗状态 ── */
  const [editField, setEditField] = useState(null) // null | 'name' | 'bio' | 'skills'

  /* ── 表单 state ── */
  const [nameVal, setNameVal] = useState('')
  const [bioVal, setBioVal] = useState('')

  /** 当前用户完整数据 */
  const raw = users?.[currentUser?.name] || currentUser || {}
  const u = {
    name: raw.name || '',
    bio: raw.bio || '',
    skills: raw.skills || [],
    role: raw.role || '新社员',
    xp: raw.xp ?? 0,
    level: raw.level ?? 1,
    levelName: raw.levelName || '新社员',
    projects: raw.projects ?? 0,
    badges: raw.badges ?? 0,
    joined: raw.joined || '刚刚',
    earnedBadges: raw.earnedBadges || [],
    color: raw.color || '#D4213D',
  }

  if (!isLoggedIn) return null

  /* ── 打开编辑弹窗 ── */
  function openEdit(field) {
    setEditField(field)
    if (field === 'name') setNameVal(u.name)
    if (field === 'bio') setBioVal(u.bio)
  }

  /* ── 保存并调用后端 API 更新资料 ── */
  async function saveUser(partial) {
    try {
      await updateProfile(partial)
      // 同步更新本地状态
      const updated = { ...u, ...partial }
      login(updated)
      showToast('已保存 ✅', 'success')
      setEditField(null)
    } catch (err) {
      showToast(err.message || '保存失败', 'error')
    }
  }

  /* ── 可选技能池 ── */
  const ALL_SKILLS = [
    { name:'需求分析', pct:60 }, { name:'PRD撰写', pct:50 }, { name:'UI设计', pct:45 },
    { name:'竞品分析', pct:55 }, { name:'用户调研', pct:40 }, { name:'团队协作', pct:65 },
    { name:'React', pct:70 }, { name:'Vue', pct:60 }, { name:'Node.js', pct:55 },
    { name:'Python', pct:58 }, { name:'Go', pct:52 }, { name:'PostgreSQL', pct:48 },
    { name:'Figma', pct:72 }, { name:'数据分析', pct:45 }, { name:'项目管理', pct:50 },
    { name:'交互设计', pct:55 }, { name:'品牌设计', pct:42 }, { name:'产品设计', pct:48 },
    { name:'CSS动画', pct:62 }, { name:'TypeScript', pct:56 }, { name:'游戏设计', pct:50 },
  ]
  const [selectedSkills, setSelectedSkills] = useState(
    new Set(u.skills.map(s => s.name))
  )

  function toggleSkill(name) {
    setSelectedSkills(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="page active" id="page-settings">
      <div className={styles.settingsPage}>
        <div className={styles.settingsInner}>
          <div className={styles.settingsHeader}><h1>⚙️ 个人设置</h1><p>管理你的资料、偏好和通知</p></div>

          {/* ═══ 个人资料 ═══ */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionTitle}>👤 个人资料</div>

            <div className={styles.settingsRow}>
              <div className={styles.srLabel}><h4>昵称</h4><p>你在公社的显示名称</p></div>
              <div className={styles.srValue}>
                <span>{u.name}</span>
                <button className={styles.editBtn} onClick={() => openEdit('name')}>修改</button>
              </div>
            </div>

            <div className={styles.settingsRow}>
              <div className={styles.srLabel}><h4>个人简介</h4><p>让别人了解你</p></div>
              <div className={styles.srValue}>
                <span className={styles.bioText}>{u.bio || '(未填写)'}</span>
                <button className={styles.editBtn} onClick={() => openEdit('bio')}>修改</button>
              </div>
            </div>

            <div className={styles.settingsRow}>
              <div className={styles.srLabel}><h4>技能标签</h4><p>展示你的专业能力</p></div>
              <div className={styles.srValue}>
                <span>{u.skills.map(s => s.name).join('、') || '(未选择)'}</span>
                <button className={styles.editBtn} onClick={() => openEdit('skills')}>修改</button>
              </div>
            </div>
          </div>

          {/* ═══ 角色偏好 ═══ */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionTitle}>🎯 角色偏好</div>
            <div className={styles.settingsRow}>
              <div className={styles.srLabel}><h4>你想担任的角色</h4><p>项目推荐会优先匹配这些角色</p></div>
              <div className={styles.srValue}>
                <div className={styles.roleTags}>
                  <RoleTag defaultActive>🎯 产品经理</RoleTag>
                  <RoleTag defaultActive>🎨 设计师</RoleTag>
                  <RoleTag>💻 开发者</RoleTag>
                  <RoleTag>🧪 测试</RoleTag>
                  <RoleTag>📣 运营</RoleTag>
                </div>
              </div>
            </div>
            <div className={styles.settingsRow}>
              <div className={styles.srLabel}><h4>偏好项目类别</h4><p>你感兴趣的项目类型</p></div>
              <div className={styles.srValue}>
                <div className={styles.roleTags}>
                  <RoleTag defaultActive>📱 App</RoleTag>
                  <RoleTag defaultActive>🌐 Web</RoleTag>
                  <RoleTag>🎮 游戏</RoleTag>
                  <RoleTag defaultActive>🤖 AI</RoleTag>
                  <RoleTag>🔧 工具</RoleTag>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 通知设置 ═══ */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionTitle}>🔔 通知设置</div>
            {[
              ['申请状态更新', '你的项目申请被接受或拒绝时通知'],
              ['项目动态', '你参与的项目有新动态时通知'],
              ['新成员加入', '有人加入你发起的项目时通知'],
              ['项目推荐', '有匹配你技能的新项目时通知'],
              ['成就解锁', '获得新徽章或等级提升时通知'],
            ].map(([title, desc]) => (
              <div key={title} className={styles.settingsRow}>
                <div className={styles.srLabel}><h4>{title}</h4><p>{desc}</p></div>
                <div className={styles.srValue}><ToggleSwitch defaultActive={title !== '项目推荐'} /></div>
              </div>
            ))}
          </div>

          {/* ═══ 隐私设置 ═══ */}
          <div className={styles.settingsSection}>
            <div className={styles.settingsSectionTitle}>🔒 隐私设置</div>
            {[
              ['公开个人主页', '其他用户可以查看你的资料和贡献'],
              ['显示在线状态', '其他用户可以看到你是否在线'],
              ['显示贡献值', '在排行榜和个人主页上展示你的贡献值'],
            ].map(([title, desc]) => (
              <div key={title} className={styles.settingsRow}>
                <div className={styles.srLabel}><h4>{title}</h4><p>{desc}</p></div>
                <div className={styles.srValue}><ToggleSwitch defaultActive /></div>
              </div>
            ))}
          </div>

          <div className={styles.backButton}>
            <button className="btn-secondary" onClick={() => navigate('/dashboard')}>← 返回我的公社</button>
          </div>
        </div>
      </div>

      {/* ══════ 弹窗层 ══════ */}

      {/* —— 昵称 —— */}
      <EditModal
        open={editField === 'name'}
        title="修改昵称"
        desc="你在公社的显示名称"
        onClose={() => setEditField(null)}
        onSave={() => saveUser({ name: nameVal.trim() || u.name })}
      >
        <input
          className="form-input"
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          placeholder="输入新昵称"
          autoFocus
        />
      </EditModal>

      {/* —— 简介 —— */}
      <EditModal
        open={editField === 'bio'}
        title="修改个人简介"
        desc="让别人更了解你（最多200字）"
        onClose={() => setEditField(null)}
        onSave={() => saveUser({ bio: bioVal.trim() })}
      >
        <textarea
          className="form-input"
          value={bioVal}
          onChange={e => setBioVal(e.target.value.slice(0, 200))}
          placeholder="介绍一下自己..."
          rows={4}
          style={{ resize: 'vertical' }}
          autoFocus
        />
        <div className={`${styles.charCount} ${selectedSkills.size > 6 ? styles.charCountError : ''}`}>
          {bioVal.length}/200
        </div>
      </EditModal>

      {/* —— 技能 —— */}
      <EditModal
        open={editField === 'skills'}
        title="选择技能标签"
        desc="点击添加或移除技能，最多选6个"
        onClose={() => setEditField(null)}
        onSave={() => {
          const skillNames = Array.from(selectedSkills).slice(0, 6)
          saveUser({ skillNames })
        }}
      >
        <div className={styles.skillTags}>
          {ALL_SKILLS.map(s => (
            <span
              key={s.name}
              className={`${styles.roleTag} ${selectedSkills.has(s.name) ? styles.roleTagActive : ''}`}
              onClick={() => toggleSkill(s.name)}
            >{s.name}</span>
          ))}
        </div>
        <div style={{ fontSize: '0.78rem', color: selectedSkills.size > 6 ? 'var(--red)' : 'var(--warm-gray)', textAlign: 'right' }}>
          已选 {Math.min(selectedSkills.size, 6)} / 6{selectedSkills.size > 6 && ' ⚠️ 超出上限'}
        </div>
      </EditModal>
    </div>
  )
}
