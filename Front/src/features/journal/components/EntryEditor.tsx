import { FormEvent, useState } from 'react'
import type { JournalEntry } from '../../../services/api'
import './EntryEditor.css'

type EntryEditorProps = {
  mode: 'create' | 'edit'
  initialEntry?: JournalEntry | null
  isSaving: boolean
  onSubmit: (payload: {
    title: string
    content: string
    entryDate: string
    type: 'DAILY' | 'GENERAL'
  }) => void
  onCancelEdit?: () => void
}

const toInputDate = (value?: string) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10)
  }

  return value.slice(0, 10)
}

export function EntryEditor({
  mode,
  initialEntry,
  isSaving,
  onSubmit,
  onCancelEdit,
}: EntryEditorProps) {
  const [title, setTitle] = useState(() => initialEntry?.title ?? '')
  const [content, setContent] = useState(() => initialEntry?.content ?? '')
  const [entryDate, setEntryDate] = useState(() => toInputDate(initialEntry?.entryDate))
  const [type, setType] = useState<'DAILY' | 'GENERAL'>(() => initialEntry?.type ?? 'DAILY')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      title,
      content,
      entryDate: new Date(entryDate).toISOString(),
      type,
    })

    if (mode === 'create') {
      setTitle('')
      setContent('')
      setEntryDate(toInputDate())
      setType('DAILY')
    }
  }

  return (
    <form className="entry-editor" onSubmit={handleSubmit}>
      <div className="entry-editor-heading">
        <div>
          <span>{mode === 'create' ? 'New entry' : 'Editing entry'}</span>
          <h2>{mode === 'create' ? 'Write before the weather changes.' : 'Refine your note.'}</h2>
        </div>
        {mode === 'edit' && onCancelEdit ? (
          <button type="button" className="ghost-button" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>

      <div className="entry-editor-grid">
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
        </label>

        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as 'DAILY' | 'GENERAL')}>
            <option value="DAILY">Daily</option>
            <option value="GENERAL">General</option>
          </select>
        </label>
      </div>

      <label>
        Entry date
        <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required />
      </label>

      <label>
        Content
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} required />
      </label>

      <button className="primary-button" type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : mode === 'create' ? 'Save entry' : 'Update entry'}
      </button>
    </form>
  )
}
