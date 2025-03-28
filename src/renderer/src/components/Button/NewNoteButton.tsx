import { ActionButton, ActionButtonProps } from '@/components'
import { createEmptyNoteAtom } from '@renderer/store'
import { useSetAtom } from 'jotai'
import { SquarePen } from 'lucide-react'

export const NewNoteButton = ({ ...props }: ActionButtonProps) => {
  const createEmptyNote = useSetAtom(createEmptyNoteAtom)

  const handleCreation = async () => {
    await createEmptyNote()
  }

  return (
    <ActionButton
      onClick={handleCreation}
      className="hover:bg-slate-300/50 hover:text-gray-500"
      {...props}
    >
      <SquarePen className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
    </ActionButton>
  )
}
