import { useState, useEffect } from 'react'

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
    <div className="contribution-heatmap">
      <div className="heatmap-header">
        <h3>📊 贡献热点图</h3>
        <div className="heatmap-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="heatmap-select"
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
            className="heatmap-select"
          >
            {contributors.map(user => (
              <option key={user} value={user}>
                {user === 'all' ? '全部贡献者' : user}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-grid">
          {dateGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="heatmap-week">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="heatmap-cell"
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
        <div className="heatmap-legend">
          <span>少</span>
          <div className="legend-colors">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="legend-color"
                style={{ backgroundColor: getColorIntensity(level) }}
              />
            ))}
          </div>
          <span>多</span>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="heatmap-tooltip"
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

      <style>{`
        .contribution-heatmap {
          margin: 2rem 0;
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .heatmap-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .heatmap-controls {
          display: flex;
          gap: 1rem;
        }

        .heatmap-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .heatmap-container {
          position: relative;
        }

        .heatmap-grid {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        .heatmap-week {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .heatmap-cell:hover {
          transform: scale(1.2);
          z-index: 10;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--warm-gray);
        }

        .legend-colors {
          display: flex;
          gap: 4px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          border: 1px solid var(--border);
        }

        .heatmap-tooltip {
          position: fixed;
          background: var(--ink);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          z-index: 1000;
          pointer-events: none;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .heatmap-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .heatmap-controls {
            width: 100%;
            justify-content: space-between;
          }

          .heatmap-select {
            flex: 1;
          }

          .heatmap-grid {
            overflow-x: auto;
            padding-bottom: 1rem;
          }

          .heatmap-cell {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </div>
  )
}