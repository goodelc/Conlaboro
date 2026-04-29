import { lazy, Suspense } from 'react'
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

const HomePage = lazy(() => import('./pages/HomePage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const CreatePage = lazy(() => import('./pages/CreatePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const RecruitingProjectsPage = lazy(() => import('./pages/RecruitingProjectsPage'))
const IdeaWallPage = lazy(() => import('./pages/IdeaWallPage'))
const IdeaDetailPage = lazy(() => import('./pages/IdeaDetailPage'))
const HatchPage = lazy(() => import('./pages/HatchPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--warm-gray)' }}>加载中...</div>
}

export default function App() {
  return (
      <DataProvider>
        <AppProvider>
        <div className="app">
          <ErrorBoundary>
          <ScrollToTop />
          <Navbar />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
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
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/create" element={<RequireAuth><CreatePage /></RequireAuth>} />
                <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
                <Route path="/idea-wall" element={<IdeaWallPage />} />
                <Route path="/idea/:id" element={<IdeaDetailPage />} />
                <Route path="/hatch" element={<RequireAuth><HatchPage /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
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
