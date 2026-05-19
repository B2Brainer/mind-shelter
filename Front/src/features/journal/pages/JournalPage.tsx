import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useMemo, useState } from 'react'
import { EntryEditor } from '../components/EntryEditor'
import { EntryList } from '../components/EntryList'
import {
  journalService,
  type JournalEntry,
  type SessionUser,
} from '../../../services/api'
import './JournalPage.css'

type JournalPageProps = {
  accessToken: string
  user: SessionUser
  onLogout: () => void
}

export function JournalPage({ accessToken, user, onLogout }: JournalPageProps) {
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState<'' | 'DAILY' | 'GENERAL'>('')
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const queryKey = useMemo(() => ['journal-entries', accessToken, filterType], [accessToken, filterType])

  const entriesQuery = useQuery({
    queryKey,
    queryFn: () => journalService.list(accessToken, { type: filterType, page: 1, pageSize: 20 }),
  })

  const invalidateEntries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['journal-entries', accessToken] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: Pick<JournalEntry, 'title' | 'content' | 'entryDate' | 'type'>) =>
      journalService.create(accessToken, payload),
    onSuccess: async () => {
      setFeedback('Entry saved.')
      setEditingEntry(null)
      await invalidateEntries()
    },
    onError: (error) => {
      setFeedback(resolveApiMessage(error, 'Could not save entry.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JournalEntry> }) =>
      journalService.update(accessToken, id, payload),
    onSuccess: async () => {
      setFeedback('Entry updated.')
      setEditingEntry(null)
      await invalidateEntries()
    },
    onError: (error) => {
      setFeedback(resolveApiMessage(error, 'Could not update entry.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalService.remove(accessToken, id),
    onSuccess: async () => {
      setFeedback('Entry deleted.')
      setEditingEntry(null)
      await invalidateEntries()
    },
    onError: (error) => {
      setFeedback(resolveApiMessage(error, 'Could not delete entry.'))
    },
  })

  return (
    <section className="journal-layout">
      <header className="journal-header">
        <div>
          <p className="eyebrow">Field Notes</p>
          <h1>Hold on to what the day teaches.</h1>
          <p className="journal-subtitle">
            Signed in as {user.email}. Keep one broad reflection and as many daily notes as you need.
          </p>
        </div>

        <div className="journal-header-actions">
          <label className="filter-control">
            Filter
            <select value={filterType} onChange={(event) => setFilterType(event.target.value as '' | 'DAILY' | 'GENERAL')}>
              <option value="">All entries</option>
              <option value="DAILY">Daily only</option>
              <option value="GENERAL">General only</option>
            </select>
          </label>
          <button className="ghost-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {feedback ? <p className="journal-feedback">{feedback}</p> : null}

      <div className="journal-grid">
        <EntryEditor
          key={editingEntry ? editingEntry.id : 'create-entry'}
          mode={editingEntry ? 'edit' : 'create'}
          initialEntry={editingEntry}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancelEdit={() => setEditingEntry(null)}
          onSubmit={(payload) => {
            setFeedback(null)
            if (editingEntry) {
              updateMutation.mutate({ id: editingEntry.id, payload })
              return
            }

            createMutation.mutate(payload)
          }}
        />

        <div className="journal-list-panel">
          <div className="journal-list-header">
            <h2>Your entries</h2>
            <span>
              {entriesQuery.data?.total ?? 0} total
            </span>
          </div>

          <EntryList
            entries={entriesQuery.data?.items ?? []}
            isLoading={entriesQuery.isLoading}
            onEdit={(entry) => {
              setFeedback(null)
              setEditingEntry(entry)
            }}
            onDelete={(entry) => {
              setFeedback(null)
              deleteMutation.mutate(entry.id)
            }}
          />
        </div>
      </div>
    </section>
  )
}

function resolveApiMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }

    if (typeof message === 'string') {
      return message
    }
  }

  return fallback
}
