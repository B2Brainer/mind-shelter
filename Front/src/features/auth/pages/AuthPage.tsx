import { useMutation } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import { authService, type AuthResponse } from '../../../services/api'
import './AuthPage.css'

type AuthPageProps = {
  onAuthenticated: (session: AuthResponse) => Promise<void> | void
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  return (
    <section className="auth-layout">
      <div className="auth-hero">
        <p className="eyebrow">Mind Shelter</p>
        <h1>A survival journal for reflective days.</h1>
        <p className="auth-copy">
          Keep brief daily notes, preserve one longer reflection, and return to your own trail of
          thought without noise.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-header">
          <span>{mode === 'login' ? 'Return to camp' : 'Create your shelter'}</span>
          <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
        </div>

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

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>

        {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

        <button className="auth-submit" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setErrorMessage(null)
            setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'))
          }}
        >
          {mode === 'login' ? 'Need an account? Create one.' : 'Already have an account? Sign in.'}
        </button>
      </form>
    </section>
  )
}
