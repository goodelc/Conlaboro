import { createContext, useContext, useReducer, useCallback } from 'react'
import { loginApi, registerApi, getUnreadCount } from '../api'

const AppContext = createContext(null)

function loadAuth() {
  try {
    const saved = localStorage.getItem('conlaboro_auth')
    return saved ? JSON.parse(saved) : { isLoggedIn: false, currentUser: null }
  } catch { return { isLoggedIn: false, currentUser: null } }
}

const initialState = {
  toasts: [],
  notifOpen: false,
  notifCount: 0,
  joinModalOpen: false,
  currentJoinProject: null,
  currentJoinProjectInfo: null,
  preselectedRole: '',
  badgeModalOpen: false,
  selectedBadge: null,
  loading: false,
  ...loadAuth(),
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), msg: action.msg, type: action.toastType || '' }] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }
    case 'TOGGLE_NOTIF':
      return { ...state, notifOpen: !state.notifOpen, notifCount: state.notifOpen ? 0 : state.notifCount }
    case 'OPEN_JOIN_MODAL':
      return { ...state, joinModalOpen: true, currentJoinProject: action.projectId, preselectedRole: action.role || '', currentJoinProjectInfo: action.projectInfo || null }
    case 'CLOSE_JOIN_MODAL':
      return { ...state, joinModalOpen: false, currentJoinProjectInfo: null }
    case 'OPEN_BADGE_MODAL':
      return { ...state, badgeModalOpen: true, selectedBadge: action.badge }
    case 'CLOSE_BADGE_MODAL':
      return { ...state, badgeModalOpen: false, selectedBadge: null }
    case 'CLEAR_NOTIF_COUNT':
      return { ...state, notifCount: 0 }
    case 'SET_NOTIF_COUNT':
      return { ...state, notifCount: action.count }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'LOGIN': {
      const user = action.user
      const authUser = {
        id: user.userId,
        name: user.name,
        email: user.email,
        token: user.token,
        color: user.color || '#6366f1',
        role: user.role || 'member',
        level: user.level || 1,
        levelName: user.levelName || 'Newcomer',
        xp: user.xp || 0,
        projects: user.projectCount || 0,
        badges: user.badgeCount || 0,
      }
      localStorage.setItem('conlaboro_auth', JSON.stringify({ isLoggedIn: true, currentUser: authUser }))
      return { ...state, isLoggedIn: true, currentUser: authUser, loading: false }
    }
    case 'LOGOUT':
      localStorage.removeItem('conlaboro_auth')
      return { ...state, isLoggedIn: false, currentUser: null, loading: false }
    case 'UPDATE_USER': {
      const updated = { ...state.currentUser, ...action.user }
      localStorage.setItem('conlaboro_auth', JSON.stringify({ isLoggedIn: state.isLoggedIn, currentUser: updated }))
      return { ...state, currentUser: updated }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const showToast = useCallback((msg, type = '') => {
    dispatch({ type: 'ADD_TOAST', msg, toastType: type })
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', id })
  }, [])

  const toggleNotif = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIF' })
  }, [])

  const openJoinModal = useCallback((projectId, role, projectInfo) => {
    dispatch({ type: 'OPEN_JOIN_MODAL', projectId, role, projectInfo })
  }, [])

  const closeJoinModal = useCallback(() => {
    dispatch({ type: 'CLOSE_JOIN_MODAL' })
  }, [])

  const openBadgeModal = useCallback((badge) => {
    dispatch({ type: 'OPEN_BADGE_MODAL', badge })
  }, [])

  const closeBadgeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_BADGE_MODAL' })
  }, [])

  // API 登录
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const res = await loginApi({ email, password })
      dispatch({ type: 'LOGIN', user: res })
      return res
    } catch (err) {
      dispatch({ type: 'SET_LOADING', loading: false })
      throw err
    }
  }, [])

  // API 注册
  const register = useCallback(async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', loading: true })
    try {
      const res = await registerApi({ name, email, password })
      dispatch({ type: 'LOGIN', user: res })
      return res
    } catch (err) {
      dispatch({ type: 'SET_LOADING', loading: false })
      throw err
    }
  }, [])

  // 登出
  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  // 更新本地用户状态（不调用登录API）
  const updateCurrentUser = useCallback((partial) => {
    dispatch({ type: 'UPDATE_USER', user: partial })
  }, [])

  // 拉取未读通知数
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount()
      dispatch({ type: 'SET_NOTIF_COUNT', count })
    } catch {
      dispatch({ type: 'CLEAR_NOTIF_COUNT' })
    }
  }, [])

  const value = { ...state, showToast, removeToast, toggleNotif, openJoinModal, closeJoinModal, openBadgeModal, closeBadgeModal, login, register, logout, updateCurrentUser, fetchUnreadCount }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
