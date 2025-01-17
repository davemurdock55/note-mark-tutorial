import { MDXEditorMethods } from '@mdxeditor/editor'
import { saveNoteAtom, selectedNoteAtom } from '@renderer/store'
import { autoSavingTime } from '@shared/constants'
import { NoteContent } from '@shared/models'
import { useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash'
import { useRef } from 'react'

export const useMarkdownEditor = () => {
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useSetAtom(saveNoteAtom) // essentially an atom function to save the note
  const editorRef = useRef<MDXEditorMethods>(null) // current markdown stored as a string

  // throttling this so it doesn't happen with every keyboard stroke (from the onChange this is in)
  const handleAutoSaving = throttle(
    async (content: NoteContent) => {
      if (!selectedNote) return // if the selected note is null/undefined, just return

      console.info('Auto saving: ', selectedNote.title, '...')

      await saveNote(content)
    },
    autoSavingTime, // the amount of time to wait before auto-saving again (3s right now)
    {
      leading: false,
      trailing: true
    }
  )

  // fixing auto-saving issue with changing selected notes too fast
  const handleBlur = async () => {
    if (!selectedNote) return

    // cancel the auto-saving function
    handleAutoSaving.cancel()

    // getting the content of the note the user was editing before
    const content = editorRef.current?.getMarkdown()

    // as long as that content isn't null...
    if (content != null) {
      // ...we're going to run the saveNote function (which should auto-save)
      await saveNote(content)
    }
  }

  return {
    editorRef,
    selectedNote,
    handleAutoSaving,
    handleBlur
  }
}
