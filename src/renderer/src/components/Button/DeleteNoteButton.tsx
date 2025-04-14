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
    <ActionButton onClick={handleDelete} {...props}>
      <Trash2 className="size-4" />
    </ActionButton>
  )
}
