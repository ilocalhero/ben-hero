import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout'
import { HomePage, TemasPage, PerfilPage, NotFoundPage, TemaPage, LessonPage, ActivityPage, DailyMissionPage } from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="daily" element={<DailyMissionPage />} />
          <Route path="temas" element={<TemasPage />} />
          <Route path="temas/:temaId" element={<TemaPage />} />
          <Route path="temas/:temaId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="temas/:temaId/activities/:activityId" element={<ActivityPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
