import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import { authService, type AuthResponse } from '../../../services/api'
import './AuthPage.css'

type AuthPageProps = {
  notice?: string | null
  onAuthenticated: (session: AuthResponse) => Promise<void> | void
}

export function AuthPage({ notice, onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isFormReady = email.trim().length > 0 && password.length >= 8

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'register') {
        await authService.register(email, password)
      }

      return authService.login(email, password)
    },
    onSuccess: async (session) => {
      setErrorMessage(null)
      await onAuthenticated(session)
    },
    onError: (error) => {
      const fallback = mode === 'register' ? 'Could not create your account.' : 'Could not sign you in.'
      if (error instanceof AxiosError) {
        setErrorMessage(error.response?.data?.message ?? fallback)
        return
      }

      setErrorMessage(fallback)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate()
  }

  const headerTitle = mode === 'login' ? 'Return to camp' : 'Create your shelter'
  const helperCopy =
    mode === 'login'
      ? 'Step back into your notes and continue where the weather left you.'
      : 'Creating an account signs you in immediately so you can start writing.'

  return (
    <section className="auth-layout">
      <div className="auth-hero">
        <p className="eyebrow">Mind Shelter</p>
        <h1>A survival journal for reflective days.</h1>
        <p className="auth-copy">
          Keep brief daily notes, preserve one longer reflection, and return to your own trail of
          thought without noise.
        </p>

        <div className="auth-feature-grid">
          <article className="auth-feature-card">
            <strong>Daily notes</strong>
            <span>Capture what mattered today before it slips into tomorrow.</span>
          </article>
          <article className="auth-feature-card">
            <strong>One long reflection</strong>
            <span>Keep a single place for the bigger idea you are slowly refining.</span>
          </article>
          <article className="auth-feature-card">
            <strong>Private by default</strong>
            <span>Your journal actions stay behind authentication and belong only to you.</span>
          </article>
        </div>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mode-toggle">
          <button
            className={`auth-mode-button ${mode === 'login' ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setMode('login')
            }}
          >
            Sign in
          </button>
          <button
            className={`auth-mode-button ${mode === 'register' ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              setErrorMessage(null)
              setMode('register')
            }}
          >
            Create account
          </button>
        </div>

        <div className="auth-card-header">
          <span>{headerTitle}</span>
          <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        </div>

        <p className="auth-helper">{helperCopy}</p>
        {notice ? <p className="auth-notice">{notice}</p> : null}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="auth-password-field">
          Password
          <div className="auth-password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
            <button
              className="auth-inline-button"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <p className="auth-caption">Use at least 8 characters so the account is valid immediately.</p>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}
        {mutation.isPending ? <p className="auth-status">Preparing your shelter...</p> : null}

        <button className="auth-submit" type="submit" disabled={mutation.isPending || !isFormReady}>
          {mutation.isPending ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="auth-switch-copy">
          {mode === 'login'
            ? 'No account yet? Use the Create account tab above.'
            : 'Already have an account? Use the Sign in tab above.'}
        </p>
      </form>
    </section>
  )
}
