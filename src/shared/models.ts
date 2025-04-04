// Used for note metadata (e.g. in the sidebar)
export type NoteInfo = {
  title: string
  lastEditTime: number
  createdAtTime: number
}

export type NoteContent = string

// used for a full note (e.g. when you open a note, save a note, etc.)
export type FullNote = NoteInfo & {
  content: NoteContent
}
