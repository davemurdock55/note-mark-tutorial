import { NoteContent, NoteInfo } from '@shared/models'
import { atom } from 'jotai'
import { unwrap } from 'jotai/utils'
import { UserCredentials, defaultUserState } from '@shared/auth-types'

// Atom for if the auth state is loading
export const authLoadingAtom = atom(true)

// Function to load the current user
const loadCurrentUser = async () => {
  try {
    const timeoutPromise = new Promise<UserCredentials>((resolve) => {
      setTimeout(() => {
        console.warn('Auth verification timed out, using default state')
        resolve(defaultUserState)
      }, 5000)
    })

    const user = await Promise.race([window.context.getCurrentUser(), timeoutPromise])
    console.log('User loaded:', user.isLoggedIn ? 'Logged in' : 'Not logged in')

    return user
  } catch (error) {
    console.error('Failed to load user:', error)
    return defaultUserState
  }
}

const currentUserAtomAsync = atom(loadCurrentUser())

// Unwrapping the async currentUser atom
export const currentUserAtom = unwrap(currentUserAtomAsync, (prev) => prev || defaultUserState)

// Atom to control the loading state based on user state
export const authCompletedAtom = atom((get) => {
  const user = get(currentUserAtom)
  // When user is loaded (whether logged in or not), authentication is complete
  return !!user
})

export const loginAtom = atom(
  null,
  async (get, set, params: { username: string; password: string }) => {
    try {
      const { username, password } = params
      const user = await window.context.login(username, password)

      // Check for error message
      if (user.errorMessage) {
        console.error('Login error:', user.errorMessage)
        return { success: false, message: user.errorMessage }
      }

      set(currentUserAtom, Promise.resolve(user))
      return { success: user.isLoggedIn, message: '' }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
)

export const signupAtom = atom(
  null,
  async (get, set, params: { name: string; username: string; password: string }) => {
    try {
      const { name, username, password } = params
      const user = await window.context.signup(name, username, password)

      // Check for error message
      if (user.errorMessage) {
        console.error('Signup error:', user.errorMessage)
        return { success: false, message: user.errorMessage }
      }

      set(currentUserAtom, Promise.resolve(user))
      return { success: user.isLoggedIn, message: '' }
    } catch (error) {
      console.error('Signup error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
)

export const logoutAtom = atom(null, async (get, set) => {
  try {
    const success = await window.context.logout()
    if (success) {
      set(currentUserAtom, Promise.resolve(defaultUserState))
    }
    return success
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
})

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
  const selectedNote: NoteInfo = notes[selectedNoteIndex]

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
      lastEditTime: Date.now(),
      createdAtTime: Date.now()
    }
)


export const saveNoteAtom = atom(
  null,
  async (get, set, params: { title: string; content: NoteContent; createdAtTime: number }) => {
    const { title, content, createdAtTime } = params
    const notes = get(notesAtom)

    if (!notes) return

    // save on disk
    await window.context.writeNote(title, content, Date.now(), createdAtTime)

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
    lastEditTime: Date.now(),
    createdAtTime: Date.now()
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

export const syncNotesAtom = atom(null, async (get, set) => {
  const notes = get(notesAtom)
  const currentSelectedIndex = get(selectedNoteIndexAtom)
  const selectedNote = get(selectedNoteAtom)

  if (!notes) return

  try {
    // Keep track of selected note title before sync
    const currentTitle = currentSelectedIndex !== null ? notes[currentSelectedIndex]?.title : null

    // Sync notes to cloud
    await window.context.syncNotesWithCloud()

    // Refresh the notes list
    const updatedNotes = await loadNotes()
    set(notesAtom, updatedNotes)

    // Force-refresh note content if we had a note selected
    if (currentTitle) {
      // First clear the selection
      set(selectedNoteIndexAtom, null)
      set(editorContentAtom, '') // Clear editor content

      // Find the note in the updated list
      const newIndex = updatedNotes.findIndex((note) => note.title === currentTitle)

      // If note still exists, reselect it (which will trigger a fresh load)
      if (newIndex !== -1) {
        // Use setTimeout to ensure this happens after React processes the previous state changes
        setTimeout(async () => {
          // Set new index to trigger content reload
          set(selectedNoteIndexAtom, newIndex)

          // Explicitly fetch fresh content from disk and update editor content
          const freshContent = await window.context.readNote(currentTitle)
          set(editorContentAtom, freshContent)
        }, 50) // Slightly longer delay to ensure file system operations complete
      }
    }

    return true
  } catch (error) {
    console.error('Sync failed:', error)
    return false
  }
})

export const editorContentAtom = atom<string>('')
