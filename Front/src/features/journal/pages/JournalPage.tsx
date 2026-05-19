import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
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
  onSessionExpired: (message: string) => void
}

type FeedbackState = {
  kind: 'success' | 'error'
  message: string
} | null

export function JournalPage({ accessToken, user, onLogout, onSessionExpired }: JournalPageProps) {
  const queryClient = useQueryClient()
  const [editorVersion, setEditorVersion] = useState(0)
  const [filterType, setFilterType] = useState<'' | 'DAILY' | 'GENERAL'>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<string | null>(null)

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase())

  const queryKey = useMemo(
    () => ['journal-entries', accessToken, filterType, page, pageSize],
    [accessToken, filterType, page, pageSize],
  )

  const entriesQuery = useQuery({
    queryKey,
    queryFn: () => journalService.list(accessToken, { type: filterType, page, pageSize }),
  })

  const generalEntryQuery = useQuery({
    queryKey: ['journal-general', accessToken],
    queryFn: () => journalService.list(accessToken, { type: 'GENERAL', page: 1, pageSize: 1 }),
  })

  const generalEntry = generalEntryQuery.data?.items[0] ?? null

  const invalidateEntries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['journal-entries', accessToken] }),
      queryClient.invalidateQueries({ queryKey: ['journal-general', accessToken] }),
    ])
  }

  const visibleEntries = useMemo(() => {
    const items = entriesQuery.data?.items ?? []
    const filteredByPinnedCard = filterType === '' ? items.filter((entry) => entry.type !== 'GENERAL') : items

    if (!deferredSearchTerm) {
      return filteredByPinnedCard
    }

    return filteredByPinnedCard.filter((entry) =>
      `${entry.title} ${entry.content}`.toLowerCase().includes(deferredSearchTerm),
    )
  }, [deferredSearchTerm, entriesQuery.data?.items, filterType])

  const totalPages = entriesQuery.data?.totalPages ?? 1
  const totalEntries = entriesQuery.data?.total ?? 0
  const visibleCount = visibleEntries.length
  const emptyState = resolveEmptyState({
    filterType,
    hasEntriesOnPage: (entriesQuery.data?.items.length ?? 0) > 0,
    hasGeneralEntry: Boolean(generalEntry),
    searchTerm: deferredSearchTerm,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Pick<JournalEntry, 'title' | 'content' | 'entryDate' | 'type'>) =>
      journalService.create(accessToken, payload),
    onSuccess: async () => {
      setFeedback({ kind: 'success', message: 'Entry saved.' })
      setEditingEntry(null)
      setPendingDeleteEntryId(null)
      setPage(1)
      setEditorVersion((currentVersion) => currentVersion + 1)
      await invalidateEntries()
    },
    onError: (error) => {
      handleMutationError(error, 'Could not save entry.', onSessionExpired, setFeedback)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<JournalEntry> }) =>
      journalService.update(accessToken, id, payload),
    onSuccess: async () => {
      setFeedback({ kind: 'success', message: 'Entry updated.' })
      setEditingEntry(null)
      setPendingDeleteEntryId(null)
      setEditorVersion((currentVersion) => currentVersion + 1)
      await invalidateEntries()
    },
    onError: (error) => {
      handleMutationError(error, 'Could not update entry.', onSessionExpired, setFeedback)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalService.remove(accessToken, id),
    onSuccess: async () => {
      setFeedback({ kind: 'success', message: 'Entry deleted.' })
      setEditingEntry(null)
      setPendingDeleteEntryId(null)
      setPage((currentPage) => {
        const isLastItemOnPage = (entriesQuery.data?.items.length ?? 0) === 1
        return isLastItemOnPage ? Math.max(currentPage - 1, 1) : currentPage
      })
      await invalidateEntries()
    },
    onError: (error) => {
      handleMutationError(error, 'Could not delete entry.', onSessionExpired, setFeedback)
    },
  })

  const currentRangeLabel = totalEntries === 0
    ? 'No entries stored yet.'
    : `Page ${page} of ${totalPages}`

  const visibleLabel = deferredSearchTerm
    ? `${visibleCount} visible matches on this page`
    : `${visibleCount} visible entries on this page`

  const deleteMutationEntryId = deleteMutation.isPending ? deleteMutation.variables ?? null : null

  useEffect(() => {
    if (isUnauthorizedError(entriesQuery.error) || isUnauthorizedError(generalEntryQuery.error)) {
      onSessionExpired('Your session expired. Sign in again to keep writing.')
    }
  }, [entriesQuery.error, generalEntryQuery.error, onSessionExpired])

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
          <button className="ghost-button" type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="journal-stat-grid">
        <article className="journal-stat-card">
          <span>Stored entries</span>
          <strong>{totalEntries}</strong>
          <small>{currentRangeLabel}</small>
        </article>
        <article className="journal-stat-card">
          <span>Visible right now</span>
          <strong>{visibleCount}</strong>
          <small>{visibleLabel}</small>
        </article>
        <article className="journal-stat-card journal-stat-card-warm">
          <span>Long reflection</span>
          <strong>{generalEntry ? 'Secured' : 'Still unwritten'}</strong>
          <small>
            {generalEntry
              ? 'You already have your one GENERAL note.'
              : 'You can still create one GENERAL note from the editor.'}
          </small>
        </article>
      </section>

      {feedback ? <p className={`journal-feedback journal-feedback-${feedback.kind}`}>{feedback.message}</p> : null}

      {filterType !== 'GENERAL' ? (
        <section className="journal-general-panel">
          <div className="journal-general-header">
            <div>
              <p className="eyebrow">Compass Note</p>
              <h2>Your long-term reflection</h2>
            </div>
            {generalEntry ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setFeedback(null)
                  setPendingDeleteEntryId(null)
                  setEditingEntry(generalEntry)
                }}
              >
                Edit reflection
              </button>
            ) : null}
          </div>

          {generalEntry ? (
            <article className="journal-general-card">
              <div className="journal-general-meta">
                <span>GENERAL entry</span>
                <span>{new Date(generalEntry.entryDate).toLocaleDateString()}</span>
              </div>
              <h3>{generalEntry.title}</h3>
              <p>{generalEntry.content}</p>
            </article>
          ) : generalEntryQuery.isLoading ? (
            <div className="journal-general-card journal-general-placeholder">Looking for your long-term reflection...</div>
          ) : (
            <div className="journal-general-card journal-general-empty">
              You do not have a GENERAL reflection yet. Pick the GENERAL type in the editor to create the
              one note that will hold your longer conclusions.
            </div>
          )}
        </section>
      ) : null}

      <div className="journal-grid">
        <EntryEditor
          key={editingEntry ? editingEntry.id : `create-entry-${editorVersion}`}
          mode={editingEntry ? 'edit' : 'create'}
          initialEntry={editingEntry}
          hasExistingGeneralEntry={Boolean(generalEntry)}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancelEdit={() => {
            setEditingEntry(null)
            setPendingDeleteEntryId(null)
          }}
          onSubmit={(payload) => {
            setFeedback(null)
            setPendingDeleteEntryId(null)
            if (editingEntry) {
              updateMutation.mutate({ id: editingEntry.id, payload })
              return
            }

            createMutation.mutate(payload)
          }}
        />

        <div className="journal-list-panel">
          <div className="journal-toolbar">
            <label className="filter-control">
              View
              <select
                value={filterType}
                onChange={(event) => {
                  setFilterType(event.target.value as '' | 'DAILY' | 'GENERAL')
                  setPage(1)
                  setPendingDeleteEntryId(null)
                }}
              >
                <option value="">All entries</option>
                <option value="DAILY">Daily only</option>
                <option value="GENERAL">General only</option>
              </select>
            </label>

            <label className="filter-control search-control">
              Search visible entries
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title or content on this page"
              />
            </label>

            <label className="filter-control compact-control">
              Page size
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setPage(1)
                }}
              >
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </label>
          </div>

          <div className="journal-list-header">
            <div>
              <h2>{filterType === 'GENERAL' ? 'Long reflections' : filterType === 'DAILY' ? 'Daily notes' : 'Recent notes'}</h2>
              <span>{currentRangeLabel}</span>
            </div>
            {entriesQuery.isFetching ? <span className="journal-refreshing">Refreshing...</span> : null}
          </div>

          {entriesQuery.isError ? (
            <div className="journal-error-panel">
              <strong>Could not load your entries.</strong>
              <p>Try again to reload the journal view.</p>
              <button className="ghost-button" type="button" onClick={() => entriesQuery.refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <EntryList
                entries={visibleEntries}
                isLoading={entriesQuery.isLoading}
                deletingEntryId={deleteMutationEntryId}
                emptyState={emptyState}
                pendingDeleteEntryId={pendingDeleteEntryId}
                onEdit={(entry) => {
                  setFeedback(null)
                  setPendingDeleteEntryId(null)
                  setEditingEntry(entry)
                }}
                onCancelDelete={() => setPendingDeleteEntryId(null)}
                onConfirmDelete={(entry) => {
                  setFeedback(null)
                  deleteMutation.mutate(entry.id)
                }}
                onRequestDelete={(entry) => {
                  setPendingDeleteEntryId(entry.id)
                }}
              />

              <div className="journal-pagination">
                <p>
                  {totalEntries === 0
                    ? 'No pages yet.'
                    : `Showing page ${page} of ${totalPages}. Use pagination when you want to browse older notes.`}
                </p>

                <div className="journal-pagination-controls">
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={page <= 1 || entriesQuery.isLoading}
                    onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={page >= totalPages || entriesQuery.isLoading}
                    onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function resolveEmptyState({
  filterType,
  hasEntriesOnPage,
  hasGeneralEntry,
  searchTerm,
}: {
  filterType: '' | 'DAILY' | 'GENERAL'
  hasEntriesOnPage: boolean
  hasGeneralEntry: boolean
  searchTerm: string
}) {
  if (searchTerm) {
    return {
      title: 'No visible matches on this page.',
      description: 'Try a different search term, remove the filter, or move to another page.',
    }
  }

  if (filterType === 'GENERAL') {
    return hasGeneralEntry
      ? {
          title: 'No GENERAL entry is visible here.',
          description: 'If you already created one, move pages or clear the current search.',
        }
      : {
          title: 'No GENERAL reflection yet.',
          description: 'Choose the GENERAL type in the editor to create your one long-term note.',
        }
  }

  if (filterType === 'DAILY') {
    return {
      title: 'No daily notes yet.',
      description: 'Start with a brief note about what stayed with you today.',
    }
  }

  if (!hasEntriesOnPage && hasGeneralEntry) {
    return {
      title: 'No daily notes on this page.',
      description: 'Your long reflection is shown above. Add a daily note to build the trail beneath it.',
    }
  }

  return {
    title: 'No entries yet.',
    description: 'Start with a daily note or write the one GENERAL reflection that will anchor your journal.',
  }
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

function isUnauthorizedError(error: unknown) {
  return error instanceof AxiosError && error.response?.status === 401
}

function handleMutationError(
  error: unknown,
  fallback: string,
  onSessionExpired: (message: string) => void,
  setFeedback: (feedback: FeedbackState) => void,
) {
  if (isUnauthorizedError(error)) {
    onSessionExpired('Your session expired while saving changes. Sign in again to continue.')
    return
  }

  setFeedback({ kind: 'error', message: resolveApiMessage(error, fallback) })
}
