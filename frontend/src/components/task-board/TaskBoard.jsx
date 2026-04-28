import TaskCard from './TaskCard'
import AddCard from './AddCard'
import styles from './TaskBoard.module.css'

function TaskBoard({ milestones, projectId, onTaskCreated, onTaskClaimed, showToast, users }) {
  const ms = milestones

  // 防御性检查
  if (!ms || ms.length === 0) {
    return <p className={styles.emptyState}>该项目尚未创建里程碑。请先在下方添加里程碑。</p>
  }

  const allTasks = ms.flatMap(m => (m.tasks || []).map(t => ({ ...t, msStatus: m.status })))
  const openTasks = allTasks.filter(t => t.status === 'open' || t.status === undefined)
  const progressTasks = allTasks.filter(t => t.status === 'progress')
  const doneTasks = allTasks.filter(t => t.status === 'done')

  const columns = [
    { key: 'open', label: '待认领', tasks: openTasks },
    { key: 'progress', label: '进行中', tasks: progressTasks },
    { key: 'done', label: '已完成', tasks: doneTasks },
  ]

  return (
    <div className={styles.taskBoard}>
      <div className={styles.boardColumns}>
        {columns.map(col => (
          <div key={col.key} className={`${styles.taskColumn} ${styles[`${col.key}Col`]}`}>
            <div className={styles.columnHeader}>{col.label} <span className={styles.tchCount}>{col.tasks.length}</span></div>
            <div className={styles.columnBody}>
              {col.tasks.map(t => (
                <TaskCard 
                  key={t.id || t.name} 
                  t={t} 
                  users={users}
                  onTaskClaimed={onTaskClaimed}
                  showToast={showToast}
                />
              ))}
              {/* 只在"待认领"列显示添加按钮 */}
              {col.key === 'open' && (
                <AddCard 
                  projectId={projectId}
                  milestones={milestones}
                  onTaskCreated={onTaskCreated}
                  showToast={showToast}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskBoard