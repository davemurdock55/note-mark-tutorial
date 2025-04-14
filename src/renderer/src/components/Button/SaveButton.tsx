import { useState } from 'react'
import { selectedNoteAtom, saveNoteAtom, editorContentAtom } from '@renderer/store'
import { Save, LoaderCircle } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { NoteInfo } from '@shared/models'

export const SaveButton = () => {
  const [isSaving, setIsSaving] = useState(false)
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useSetAtom(saveNoteAtom)
  const editorContent = useAtomValue(editorContentAtom)

  const handleManualSave = async () => {
    if (!selectedNote) return

    // Capture the current note title to prevent blur issues
    const noteToSave: NoteInfo = selectedNote

    setIsSaving(true)

    try {
      console.log('Saving note:', noteToSave.title, 'with content length:', editorContent.length)

      // Pass title explicitly along with content
      await saveNote({
        title: noteToSave.title,
        content: editorContent,
        createdAtTime: noteToSave.createdAtTime || Date.now()
      })
      console.log('Note saved manually:', noteToSave.title)

      // Optional: Add a small delay for UI feedback if saving is too fast
      // This ensures users see the saving indicator even for quick saves
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ActionButton
      className={`${isSaving ? 'bg-slate-300/25 dark:hover:text-cyan-400' : ''}`}
      onClick={handleManualSave}
      disabled={isSaving}
    >
      {!isSaving ? (
        <Save className="size-5" />
      ) : (
        <LoaderCircle className="size-5 text-cyan-400 animate-spin" />
      )}
    </ActionButton>
  )
}
