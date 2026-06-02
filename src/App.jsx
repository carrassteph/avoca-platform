import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import AgentsList from './pages/agents/AgentsList'
import AgentWizard from './pages/agents/AgentWizard'
import AgentTest from './pages/agents/AgentTest'
import TemplatesList from './pages/templates/TemplatesList'
import TemplateEditor from './pages/templates/TemplateEditor'
import Monitoring from './pages/monitoring/Monitoring'
import BrandDetail from './pages/monitoring/BrandDetail'
import BrandsList from './pages/brands/BrandsList'
import BrandEditor from './pages/brands/BrandEditor'

function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-0)' }}>
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/agents" replace />} />
          <Route path="/agents" element={<AgentsList />} />
          <Route path="/agents/new" element={<AgentWizard />} />
          <Route path="/agents/:id" element={<AgentWizard />} />
          <Route path="/agents/:id/test" element={<AgentTest />} />
          <Route path="/templates" element={<TemplatesList />} />
          <Route path="/templates/new" element={<TemplateEditor />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/monitoring/:brandId" element={<BrandDetail />} />
          <Route path="/brands" element={<BrandsList />} />
          <Route path="/brands/new" element={<BrandEditor />} />
          <Route path="/brands/:id" element={<BrandEditor />} />
          <Route path="*" element={<Navigate to="/agents" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
