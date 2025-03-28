import { MDXEditorMethods } from '@mdxeditor/editor'
import { saveNoteAtom, selectedNoteAtom, editorContentAtom } from '@renderer/store'
import { autoSavingTime } from '@shared/constants'
import { NoteContent } from '@shared/models'
import { useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash'
import { useRef } from 'react'

export const useMarkdownEditor = () => {
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useSetAtom(saveNoteAtom)
  const editorRef = useRef<MDXEditorMethods>(null)
  const editorContent = useAtomValue(editorContentAtom)

  const handleAutoSaving = throttle(
    async (content: NoteContent) => {
      if (!selectedNote) return

      // Capture the current title to prevent race conditions
      const noteTitle = selectedNote.title

      console.info('Auto saving: ', noteTitle, '...')
      await saveNote({ title: noteTitle, content })
    },
    autoSavingTime,
    {
      leading: false,
      trailing: true
    }
  )

  const handleTextEditorBlur = async () => {
    if (!selectedNote) return

    // Capture title before any potential state changes
    const noteTitle = selectedNote.title

    handleAutoSaving.cancel()
    await saveNote({ title: noteTitle, content: editorContent })
  }

  const handleBlur = async () => {
    if (!selectedNote) return

    // Capture title before any potential state changes
    const noteTitle = selectedNote.title

    handleAutoSaving.cancel()
    const content = editorRef.current?.getMarkdown()

    if (content != null) {
      await saveNote({ title: noteTitle, content })
    }
  }

  return {
    editorRef,
    selectedNote,
    handleAutoSaving,
    handleTextEditorBlur,
    handleBlur
  }
}
