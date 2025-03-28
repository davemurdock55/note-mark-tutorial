import { NoteContent, NoteInfo } from '@shared/models'
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'

// using the window.context (which calls the backend getNotes function)
const loadNotes = async () => {
  // using the window context from the preload script
  const notes = await window.context.getNotes()

  // sort them by most recently edited
  return notes.sort((a, b) => b.lastEditTime - a.lastEditTime)
}

// an async atom that has the result of the async loadNotes as its initial value
const notesAtomAsync = atom<NoteInfo[] | Promise<NoteInfo[]>>(loadNotes())

// un-wrapping the async-ness of the notesAtomAsync atom
// unwrap takes an async atom, and if its promise is resolved, it returns its initial value
// if the promise is pending, it just takes the previous value and returns it
export const notesAtom = unwrap(notesAtomAsync, (prev) => prev)

export const selectedNoteIndexAtom = atom<number | null>(null)

// the async atom that gets the selected note from the notes array
const selectedNoteAtomAsync = atom(async (get) => {
  // get the notes array from the atom state
  const notes = get(notesAtom)
  // get the selected note index from the atom state
  const selectedNoteIndex = get(selectedNoteIndexAtom)

  // making sure it's not null or undefined
  if (selectedNoteIndex == null || !notes) return null

  // get the note at that selected note index
  const selectedNote = notes[selectedNoteIndex]

  // get the content from the 'backend' using the title of the note
  const noteContent = await window.context.readNote(selectedNote.title)

  return {
    ...selectedNote,
    content: noteContent
  }
})

export const selectedNoteAtom = unwrap(
  selectedNoteAtomAsync,
  (prev) =>
    // the value will be null/undefined while the async function 'reads' the note, so we should just return an empty note object instead
    prev ?? {
      title: '',
      content: '',
      lastEditTime: Date.now()
    }
)

// For src/renderer/src/store/index.ts
export const saveNoteAtom = atom(
  null,
  async (get, set, params: { title: string; content: NoteContent }) => {
    const { title, content } = params
    const notes = get(notesAtom)

    if (!notes) return

    // save on disk
    await window.context.writeNote(title, content)

    // update the saved note's last edit time
    set(
      notesAtom,
      notes.map((note) => {
        if (note.title === title) {
          return {
            ...note,
            lastEditTime: Date.now()
          }
        }
        return note
      })
    )
  }
)

export const createEmptyNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom)

  if (!notes) return

  const title = await window.context.createNote()

  if (!title) return

  const newNote: NoteInfo = {
    title,
    lastEditTime: Date.now()
  }

  set(notesAtom, [newNote, ...notes.filter((note) => note.title !== newNote.title)])

  set(selectedNoteIndexAtom, 0)
})

export const deleteNoteAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom)
  const selectedNote = get(selectedNoteAtom) // delete the selected note

  if (!selectedNote || !notes) return

  // going to the window.context inside of preload, which will call the 'backend' (main script)'s deleteNote function
  const isDeleted = await window.context.deleteNote(selectedNote.title)

  // if the deletion was cancelled or something went wrong, return (if not, continue)
  if (!isDeleted) return

  // filter out the deleted note from the jotai state
  set(
    notesAtom,
    notes.filter((note) => note.title !== selectedNote.title)
  )

  // make it so no note is selected (after deleting a note)
  // (because we're always deleting the currently selected note)
  set(selectedNoteIndexAtom, null)
})

export const editorContentAtom = atom<string>('')
