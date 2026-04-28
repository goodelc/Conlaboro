import { useState, useEffect } from 'react'
import styles from './ContributionHeatmap.module.css'

export default function ContributionHeatmap({ activities = [], showToast }) {
  const [timeRange, setTimeRange] = useState('6months')
  const [selectedUser, setSelectedUser] = useState('all')
  const [heatmapData, setHeatmapData] = useState({})
  const [tooltip, setTooltip] = useState({ visible: false, date: '', count: 0, x: 0, y: 0 })

  const timeRanges = [
    { value: '1month', label: '1个月' },
    { value: '3months', label: '3个月' },
    { value: '6months', label: '6个月' },
    { value: '1year', label: '1年' }
  ]

  useEffect(() => {
    if (!activities || activities.length === 0) {
      setHeatmapData({})
      return
    }
    const processedData = processActivities(activities, timeRange, selectedUser)
    setHeatmapData(processedData)
  }, [activities, timeRange, selectedUser])

  function processActivities(activities, range, user) {
    const now = new Date()
    const startDate = new Date(now)

    switch (range) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredActivities = activities.filter(activity => {
      const activityDate = parseActivityDate(activity.time)
      const isInRange = activityDate >= startDate
      const isSelectedUser = user === 'all' || activity.user === user
      return isInRange && isSelectedUser
    })

    const dataByDate = {}
    filteredActivities.forEach(activity => {
      const date = formatDate(parseActivityDate(activity.time))
      if (!dataByDate[date]) {
        dataByDate[date] = 0
      }
      dataByDate[date]++
    })

    return dataByDate
  }

  function parseActivityDate(timeString) {
    if (timeString.includes('T')) {
      return new Date(timeString)
    } else if (timeString.includes('月') || timeString.includes('日')) {
      const parts = timeString.match(/(\d+)月(\d+)日/)
      if (parts) {
        const month = parseInt(parts[1]) - 1
        const day = parseInt(parts[2])
        const year = new Date().getFullYear()
        return new Date(year, month, day)
      }
    } else if (timeString.includes('天前') || timeString.includes('小时前')) {
      const now = new Date()
      const parts = timeString.match(/(\d+)天前/)
      if (parts) {
        const days = parseInt(parts[1])
        const date = new Date(now)
        date.setDate(now.getDate() - days)
        return date
      }
    }
    return new Date()
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0]
  }

  function generateDateGrid() {
    const now = new Date()
    const startDate = new Date(now)

    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const grid = []
    const currentDate = new Date(startDate)

    const dayOfWeek = currentDate.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    currentDate.setDate(currentDate.getDate() - daysToMonday)

    for (let week = 0; week < 53; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(currentDate)
        date.setDate(currentDate.getDate() + day)
        const dateStr = formatDate(date)
        const count = heatmapData[dateStr] || 0
        weekData.push({ date: dateStr, count })
      }
      grid.push(weekData)
      currentDate.setDate(currentDate.getDate() + 7)
    }

    return grid
  }

  function getColorIntensity(count) {
    if (count === 0) return 'var(--background)'
    if (count === 1) return 'var(--green-light)'
    if (count === 2) return 'var(--green)'
    if (count === 3) return 'var(--green-dark)'
    return 'var(--green-darker)'
  }

  function handleCellHover(date, count, e) {
    const rect = e.target.getBoundingClientRect()
    setTooltip({
      visible: true,
      date,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top - 40
    })
  }

  function handleCellLeave() {
    setTooltip({ ...tooltip, visible: false })
  }

  const contributors = ['all', ...Array.from(new Set(activities.map(a => a.user)))]
  const dateGrid = generateDateGrid()

  return (
    <div className={styles.heatmap}>
      <div className={styles.header}>
        <h3>📊 贡献热点图</h3>
        <div className={styles.controls}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={styles.select}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className={styles.select}
          >
            {contributors.map(user => (
              <option key={user} value={user}>
                {user === 'all' ? '全部贡献者' : user}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {dateGrid.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.week}>
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={styles.cell}
                  style={{
                    backgroundColor: getColorIntensity(day.count),
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => handleCellHover(day.date, day.count, e)}
                  onMouseLeave={handleCellLeave}
                  title={`${day.date}: ${day.count} 次贡献`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <span>少</span>
          <div className={styles.legendColors}>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={styles.legendColor}
                style={{ backgroundColor: getColorIntensity(level) }}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div>{tooltip.date}</div>
          <div>{tooltip.count} 次贡献</div>
        </div>
      )}
    </div>
  )
}