import { useState } from 'react'
import { selectedNoteAtom, saveNoteAtom, editorContentAtom } from '@renderer/store'
import { Save, LoaderCircle } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { useAtomValue, useSetAtom } from 'jotai'

export const SaveButton = () => {
  const [isSaving, setIsSaving] = useState(false)
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useSetAtom(saveNoteAtom)
  const editorContent = useAtomValue(editorContentAtom)

  const handleManualSave = async () => {
    if (!selectedNote) return

    // Capture the current note title to prevent blur issues
    const noteTitle = selectedNote.title

    setIsSaving(true)

    try {
      console.log('Saving note:', noteTitle, 'with content length:', editorContent.length)

      // Pass title explicitly along with content
      await saveNote({ title: noteTitle, content: editorContent })
      console.log('Note saved manually:', noteTitle)

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
      className={`hover:bg-slate-300/50 hover:text-gray-500 ${isSaving ? 'bg-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-400' : ''}`}
      onClick={handleManualSave}
      disabled={isSaving}
    >
      {!isSaving ? (
        <Save
          className={`size-5 ${isSaving ? 'text-cyan-400' : 'text-zinc-500 dark:text-zinc-300'}`}
        />
      ) : (
        <LoaderCircle className="size-5 text-cyan-400 animate-spin" />
      )}
    </ActionButton>
  )
}
