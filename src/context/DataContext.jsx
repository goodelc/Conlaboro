import { createContext, useContext, useMemo } from 'react'
import { badges, projects, users } from '../data'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const value = useMemo(() => ({ badges, projects, users }), [])
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
