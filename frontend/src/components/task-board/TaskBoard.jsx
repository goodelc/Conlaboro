import TaskCard from './TaskCard'
import AddCard from './AddCard'

function TaskBoard({ milestones, projectId, onTaskCreated, onTaskClaimed, showToast, users }) {
  const ms = milestones

  // 防御性检查
  if (!ms || ms.length === 0) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>该项目尚未创建里程碑。请先在下方添加里程碑。</p>
  }

  // 检查是否有任务
  const hasTasks = ms.some(m => m.tasks && Array.isArray(m.tasks) && m.tasks.length > 0 && typeof m.tasks[0] === 'object')
  if (!hasTasks) {
    return <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>该项目尚未创建详细任务。请在任务看板中添加任务。</p>
  }

  const allTasks = ms.flatMap(m => m.tasks.map(t => ({ ...t, msStatus: m.status })))
  const openTasks = allTasks.filter(t => t.status === 'open')
  const progressTasks = allTasks.filter(t => t.status === 'progress')
  const doneTasks = allTasks.filter(t => t.status === 'done')

  const columns = [
    { key: 'open', label: '待认领', tasks: openTasks },
    { key: 'progress', label: '进行中', tasks: progressTasks },
    { key: 'done', label: '已完成', tasks: doneTasks },
  ]

  return (
    <div className="task-board">
      <div className="task-board-columns">
        {columns.map(col => (
          <div key={col.key} className={`task-column ${col.key}-col`}>
            <div className="task-column-header">{col.label} <span className="tch-count">{col.tasks.length}</span></div>
            <div className="task-column-body">
              {col.tasks.map(t => (
                <TaskCard 
                  key={t.id || t.name} 
                  t={t} 
                  users={users}
                  onTaskClaimed={onTaskClaimed}
                  showToast={showToast}
                />
              ))}
              <AddCard 
                projectId={projectId}
                milestones={milestones}
                onTaskCreated={onTaskCreated}
                showToast={showToast}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskBoard