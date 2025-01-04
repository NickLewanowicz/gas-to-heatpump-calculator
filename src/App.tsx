import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, FloatButton } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { AppProvider } from './context/AppContext'
import { Navigation } from './components/Navigation/Navigation'
import { Home } from './components/Home/Home'
import { AppLayout } from './components/Layout/AppLayout'
import { Breakeven } from './components/Breakeven/Breakeven'
import { MarginalHeating } from './components/MarginalHeating/MarginalHeating'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import 'antd/dist/reset.css'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <AppProvider>
      <Layout>
        <Navigation />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<AppLayout />} />
            <Route path="/breakeven" element={<Breakeven />} />
            <Route path="/marginal" element={<MarginalHeating />} />
          </Routes>
        </Layout>
        <FloatButton
          icon={<SettingOutlined />}
          type="primary"
          style={{ right: 24 }}
          onClick={() => setSettingsOpen(true)}
        />
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </Layout>
    </AppProvider>
  )
}
