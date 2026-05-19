import type { JournalEntry } from '../../../services/api'
import './EntryList.css'

type EntryListProps = {
  entries: JournalEntry[]
  isLoading: boolean
  deletingEntryId: string | null
  emptyState: {
    title: string
    description: string
  }
  pendingDeleteEntryId: string | null
  onEdit: (entry: JournalEntry) => void
  onCancelDelete: () => void
  onConfirmDelete: (entry: JournalEntry) => void
  onRequestDelete: (entry: JournalEntry) => void
}

export function EntryList({
  entries,
  isLoading,
  deletingEntryId,
  emptyState,
  pendingDeleteEntryId,
  onEdit,
  onCancelDelete,
  onConfirmDelete,
  onRequestDelete,
}: EntryListProps) {
  if (isLoading) {
    return (
      <div className="entry-list entry-list-skeletons">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="entry-card entry-card-skeleton" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="entry-list-empty">
        <strong>{emptyState.title}</strong>
        <p>{emptyState.description}</p>
      </div>
    )
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <article key={entry.id} className={`entry-card ${entry.type === 'GENERAL' ? 'entry-card-general' : ''}`}>
          <div className="entry-card-top">
            <div>
              <span className="entry-badge">{entry.type === 'GENERAL' ? 'General reflection' : 'Daily note'}</span>
              <h3>{entry.title}</h3>
              <div className="entry-card-meta-row">
                <span>{formatEntryDate(entry.entryDate)}</span>
                <span>Updated {formatEntryDate(entry.updatedAt)}</span>
              </div>
            </div>
            <span className="entry-date">{countWords(entry.content)} words</span>
          </div>

          <p>{entry.content}</p>

          <div className="entry-card-actions">
            <button className="ghost-button" type="button" onClick={() => onEdit(entry)}>
              Edit
            </button>
            {pendingDeleteEntryId === entry.id ? (
              <>
                <button
                  className="danger-button"
                  type="button"
                  disabled={deletingEntryId === entry.id}
                  onClick={() => onConfirmDelete(entry)}
                >
                  {deletingEntryId === entry.id ? 'Deleting...' : 'Confirm delete'}
                </button>
                <button className="ghost-button" type="button" onClick={onCancelDelete}>
                  Keep
                </button>
              </>
            ) : (
              <button className="danger-button" type="button" onClick={() => onRequestDelete(entry)}>
                Delete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function countWords(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 0
  }

  return trimmed.split(/\s+/).length
}
