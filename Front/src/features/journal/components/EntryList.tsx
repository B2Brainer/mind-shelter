import type { JournalEntry } from '../../../services/api'
import './EntryList.css'

type EntryListProps = {
  entries: JournalEntry[]
  isLoading: boolean
  onEdit: (entry: JournalEntry) => void
  onDelete: (entry: JournalEntry) => void
}

export function EntryList({ entries, isLoading, onEdit, onDelete }: EntryListProps) {
  if (isLoading) {
    return <div className="entry-list-empty">Loading journal entries...</div>
  }

  if (entries.length === 0) {
    return <div className="entry-list-empty">No entries yet. Start with a daily note or your long reflection.</div>
  }

  return (
    <div className="entry-list">
      {entries.map((entry) => (
        <article key={entry.id} className={`entry-card ${entry.type === 'GENERAL' ? 'entry-card-general' : ''}`}>
          <div className="entry-card-top">
            <div>
              <span className="entry-badge">{entry.type === 'GENERAL' ? 'General reflection' : 'Daily note'}</span>
              <h3>{entry.title}</h3>
            </div>
            <span className="entry-date">{new Date(entry.entryDate).toLocaleDateString()}</span>
          </div>

          <p>{entry.content}</p>

          <div className="entry-card-actions">
            <button className="ghost-button" type="button" onClick={() => onEdit(entry)}>
              Edit
            </button>
            <button className="danger-button" type="button" onClick={() => onDelete(entry)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
