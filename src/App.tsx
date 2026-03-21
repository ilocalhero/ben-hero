import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage, TemasPage, PerfilPage, NotFoundPage, TemaPage, LessonPage, ActivityPage, DailyMissionPage, LoginPage, OnboardingPage, AwardsPage } from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="daily" element={<DailyMissionPage />} />
            <Route path="temas" element={<TemasPage />} />
            <Route path="temas/:temaId" element={<TemaPage />} />
            <Route path="temas/:temaId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="temas/:temaId/activities/:activityId" element={<ActivityPage />} />
            <Route path="awards" element={<AwardsPage />} />
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
