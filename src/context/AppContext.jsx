import { createContext, useContext, useReducer, useCallback } from 'react'

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
  notifCount: 3,
  joinModalOpen: false,
  currentJoinProject: null,
  preselectedRole: '',
  badgeModalOpen: false,
  selectedBadge: null,
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
      return { ...state, joinModalOpen: true, currentJoinProject: action.projectId, preselectedRole: action.role || '' }
    case 'CLOSE_JOIN_MODAL':
      return { ...state, joinModalOpen: false }
    case 'OPEN_BADGE_MODAL':
      return { ...state, badgeModalOpen: true, selectedBadge: action.badge }
    case 'CLOSE_BADGE_MODAL':
      return { ...state, badgeModalOpen: false, selectedBadge: null }
    case 'CLEAR_NOTIF_COUNT':
      return { ...state, notifCount: 0 }
    case 'LOGIN':
      return { ...state, isLoggedIn: true, currentUser: action.user }
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, currentUser: null }
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

  const openJoinModal = useCallback((projectId, role) => {
    dispatch({ type: 'OPEN_JOIN_MODAL', projectId, role })
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

  const login = useCallback((user) => {
    dispatch({ type: 'LOGIN', user })
    localStorage.setItem('conlaboro_auth', JSON.stringify({ isLoggedIn: true, currentUser: user }))
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('conlaboro_auth')
  }, [])

  const value = { ...state, showToast, removeToast, toggleNotif, openJoinModal, closeJoinModal, openBadgeModal, closeBadgeModal, login, logout }

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
