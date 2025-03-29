import {
  CreateNote,
  DeleteNote,
  GetNotes,
  ReadNote,
  WriteNote,
  SyncNotesWithCloud
} from '@shared/types'

// defining the structure/types for the global window.context object
declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
      getNotes: GetNotes
      readNote: ReadNote
      writeNote: WriteNote
      createNote: CreateNote
      deleteNote: DeleteNote
      syncNotesWithCloud: SyncNotesWithCloud
    }
  }
}
