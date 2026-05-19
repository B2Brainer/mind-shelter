import { FormEvent, useState } from 'react'
import type { JournalEntry } from '../../../services/api'
import './EntryEditor.css'

type EntryEditorProps = {
  mode: 'create' | 'edit'
  initialEntry?: JournalEntry | null
  hasExistingGeneralEntry: boolean
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
  hasExistingGeneralEntry,
  isSaving,
  onSubmit,
  onCancelEdit,
}: EntryEditorProps) {
  const [title, setTitle] = useState(() => initialEntry?.title ?? '')
  const [content, setContent] = useState(() => initialEntry?.content ?? '')
  const [entryDate, setEntryDate] = useState(() => toInputDate(initialEntry?.entryDate))
  const [type, setType] = useState<'DAILY' | 'GENERAL'>(() => initialEntry?.type ?? 'DAILY')

  const generalOptionLocked = hasExistingGeneralEntry && initialEntry?.type !== 'GENERAL'
  const titleRemaining = 120 - title.length
  const contentWords = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length
  const isSubmitDisabled = isSaving || title.trim().length === 0 || content.trim().length === 0

  const typeGuidance =
    type === 'GENERAL'
      ? 'Use your single GENERAL entry as the place where longer conclusions and recurring ideas accumulate.'
      : 'Use daily notes for what stood out today, even if the thought is unfinished.'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({
      title,
      content,
      entryDate: new Date(entryDate).toISOString(),
      type,
    })
  }

  return (
    <form className="entry-editor" onSubmit={handleSubmit}>
      <div className="entry-editor-heading">
        <div>
          <span>{mode === 'create' ? 'New entry' : 'Editing entry'}</span>
          <h2>{mode === 'create' ? 'Write before the weather changes.' : 'Refine your note.'}</h2>
          <p className="entry-editor-copy">{typeGuidance}</p>
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
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder={type === 'GENERAL' ? 'A lasting question worth returning to' : 'What stayed with you today?'}
            required
          />
        </label>

        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as 'DAILY' | 'GENERAL')}>
            <option value="DAILY">Daily</option>
            <option value="GENERAL" disabled={generalOptionLocked}>
              General
            </option>
          </select>
          <span className="entry-editor-helper">
            {generalOptionLocked
              ? 'You already have a GENERAL reflection. Edit that one instead of creating another.'
              : 'Pick GENERAL only for the one long-term reflection that should stay with you.'}
          </span>
        </label>
      </div>

      <label>
        Entry date
        <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required />
      </label>

      <label>
        Content
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={9}
          placeholder={
            type === 'GENERAL'
              ? 'Gather conclusions, recurring tensions, and the larger thread you want to keep refining.'
              : 'What happened, what did you notice, and what question remains open?'
          }
          required
        />
      </label>

      <div className="entry-editor-footer">
        <div className="entry-editor-meta">
          <span>{titleRemaining} title characters left</span>
          <span>{contentWords} words</span>
        </div>

        {mode === 'create' ? (
          <span className="entry-editor-helper">New entries appear in your list immediately after saving.</span>
        ) : (
          <span className="entry-editor-helper">Update the note, then save to refresh the list.</span>
        )}
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitDisabled}>
        {isSaving ? 'Saving...' : mode === 'create' ? 'Save entry' : 'Update entry'}
      </button>
    </form>
  )
}
