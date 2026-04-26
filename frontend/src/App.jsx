import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'
import NotificationPanel from './components/NotificationPanel'
import JoinModal from './components/JoinModal'
import BadgeModal from './components/BadgeModal'
import RequireAuth from './components/RequireAuth'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ShowcasePage from './pages/ShowcasePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreatePage from './pages/CreatePage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import RecruitingProjectsPage from './pages/RecruitingProjectsPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
      <DataProvider>
        <AppProvider>
        <div className="app">
          <ErrorBoundary>
          <ScrollToTop />
          <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/detail/:id" element={<DetailPage />} />
                <Route path="/recruiting" element={<RecruitingProjectsPage />} />
                <Route path="/profile/:name" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/showcase" element={<ShowcasePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/create" element={<RequireAuth><CreatePage /></RequireAuth>} />
                <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <ToastContainer />
            <NotificationPanel />
            <JoinModal />
            <BadgeModal />
          </ErrorBoundary>
          </div>
        </AppProvider>
      </DataProvider>
  )
}
