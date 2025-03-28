import { selectedNoteAtom } from '@renderer/store'
import { useAtomValue } from 'jotai'
import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export const FloatingNoteTitle = ({ className, ...props }: ComponentProps<'div'>) => {
  const selectedNote = useAtomValue(selectedNoteAtom)

  if (!selectedNote) return <div className="min-h-8"></div>

  return (
    <div
      className={twMerge(
        'flex items-center py-2 bg-white/90 backdrop-blur-sm shadow-sm absolute top-0 left-0 right-2 z-10 px-5',
        className
      )}
      {...props}
    >
      <div className="flex-1"></div>
      <span className="font-medium text-cyan-400">{selectedNote.title}</span>
      <div className="flex justify-end flex-1">
        <span>right</span>
      </div>
    </div>
  )
}
