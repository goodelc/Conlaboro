import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getAllUsers, getAllProjects, getAllBadges, getLeaderboard } from '../api'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [badges, setBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setDataLoading(true)
      const [usersRes, projectsRes, badgesRes, lbRes] = await Promise.allSettled([
        getAllUsers(), getAllProjects(), getAllBadges(), getLeaderboard()
      ])
      if (usersRes.status === 'fulfilled') {
        console.log('Users data:', usersRes.value)
        setUsers(usersRes.value)
      }
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value)
      if (badgesRes.status === 'fulfilled') setBadges(badgesRes.value)
      if (lbRes.status === 'fulfilled') setLeaderboard(lbRes.value)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 转换 users 数组为 name-keyed 对象（兼容旧代码用 users[name] 访问）
  const userMap = useMemo(() => {
    const map = {}
    users.forEach(u => {
      const userData = {
        ...u,
        joined: u.joinedAt,
        badges: u.badgeCount,
        projects: u.projectCount,
        earnedBadges: u.earnedBadgeIds
      }
      map[u.name] = userData
    })
    return map
  }, [users])

  const value = { badges, projects, users: userMap, userList: users, leaderboard, dataLoading, refetch: fetchData }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
