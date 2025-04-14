import { MDXEditorMethods } from '@mdxeditor/editor'
import { saveNoteAtom, selectedNoteAtom, editorContentAtom } from '@renderer/store'
import { autoSavingTime } from '@shared/constants'
import { NoteContent } from '@shared/models'
import { useAtomValue, useSetAtom } from 'jotai'
import { throttle, DebouncedFunc } from 'lodash' // Add DebouncedFunc type
import { useRef, useEffect, useCallback } from 'react'

export const useMarkdownEditor = () => {
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useSetAtom(saveNoteAtom)
  const editorRef = useRef<MDXEditorMethods>(null)
  const editorContent = useAtomValue(editorContentAtom)

  // Use proper typing instead of any
  const throttledSaveRef = useRef<DebouncedFunc<(content: NoteContent) => Promise<void>> | null>(
    null
  )

  // Throttling the save function to prevent excessive calls
  useEffect(() => {
    throttledSaveRef.current = throttle(
      async (content: NoteContent) => {
        if (!selectedNote) return

        // Capture the current title to prevent race conditions
        const noteTitle = selectedNote.title
        const noteCreatedAt = selectedNote.createdAtTime

        console.info('Auto saving: ', noteTitle, '...')
        await saveNote({ title: noteTitle, content, createdAtTime: noteCreatedAt })
      },
      autoSavingTime,
      {
        leading: false,
        trailing: true
      }
    )

    // Cleanup throttle when component unmounts or dependencies change
    return () => {
      if (throttledSaveRef.current) {
        throttledSaveRef.current.cancel()
      }
    }
  }, [selectedNote, saveNote])

  // Stable wrapper function
  const handleAutoSaving = useCallback((content: NoteContent) => {
    if (throttledSaveRef.current) {
      throttledSaveRef.current(content)
    }
  }, [])

  const handleTextEditorBlur = async () => {
    if (!selectedNote) return

    // Capture title before any potential state changes
    const noteTitle = selectedNote.title

    if (throttledSaveRef.current) {
      throttledSaveRef.current.cancel()
    }
    await saveNote({
      title: noteTitle,
      content: editorContent,
      createdAtTime: selectedNote.createdAtTime
    })
  }

  const handleBlur = async () => {
    if (!selectedNote) return

    // Capture title before any potential state changes
    const noteTitle = selectedNote.title

    if (throttledSaveRef.current) {
      throttledSaveRef.current.cancel()
    }
    const content = editorRef.current?.getMarkdown()

    if (content != null) {
      await saveNote({ title: noteTitle, content, createdAtTime: selectedNote.createdAtTime })
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
