import { ActionButton, ActionButtonProps } from '@/components'
import { deleteNoteAtom } from '@renderer/store'
import { useSetAtom } from 'jotai'
import { Trash2 } from 'lucide-react'

export const DeleteNoteButton = ({ ...props }: ActionButtonProps) => {
  const deleteNote = useSetAtom(deleteNoteAtom)

  const handleDelete = async () => {
    await deleteNote()
  }

  return (
    <ActionButton
      onClick={handleDelete}
      className="hover:bg-slate-300/50 hover:text-gray-500"
      {...props}
    >
      <Trash2 className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
    </ActionButton>
  )
}
