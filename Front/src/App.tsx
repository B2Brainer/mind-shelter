import { startTransition, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthPage } from './features/auth/pages/AuthPage'
import { JournalPage } from './features/journal/pages/JournalPage'
import { type SessionUser } from './services/api'

type SessionState = {
  accessToken: string
  user: SessionUser
}

const SESSION_KEY = 'mind-shelter-session'

const loadSession = (): SessionState | null => {
  const raw = window.localStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as SessionState
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function App() {
  const [session, setSession] = useState<SessionState | null>(() => loadSession())
  const [authNotice, setAuthNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY)
      return
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [session])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to={session ? '/journal' : '/login'} replace />} />
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to="/journal" replace />
            ) : (
              <Shell>
                <AuthPage
                  notice={authNotice}
                  onAuthenticated={(nextSession) => {
                    startTransition(() => {
                      setAuthNotice(null)
                      setSession({ accessToken: nextSession.accessToken, user: nextSession.user })
                    })
                  }}
                />
              </Shell>
            )
          }
        />
        <Route
          path="/journal"
          element={
            session ? (
              <Shell>
                <JournalPage
                  accessToken={session.accessToken}
                  user={session.user}
                  onLogout={() => {
                    setAuthNotice(null)
                    setSession(null)
                  }}
                  onSessionExpired={(message) => {
                    startTransition(() => {
                      setAuthNotice(message)
                      setSession(null)
                    })
                  }}
                />
              </Shell>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <div className="aurora aurora-left" />
      <div className="aurora aurora-right" />
      <main className="app-frame">{children}</main>
    </div>
  )
}

export default App
