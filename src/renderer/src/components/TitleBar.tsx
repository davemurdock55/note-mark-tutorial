import { selectedNoteAtom } from '@renderer/store'
import { useAtomValue } from 'jotai'
import { ComponentProps, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { SaveButton } from './Button/SaveButton'
import { AccountButton } from './Button/AccountButton'
import { SyncButton } from './Button/SyncButton'

export const TitleBar = ({ className, ...props }: ComponentProps<'div'>) => {
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const selectedNote = useAtomValue(selectedNoteAtom)

  return (
    <header
      className={twMerge(
        'flex items-center py-2 bg-white/70 dark:bg-gray-700/50 backdrop-blur-md shadow-sm absolute top-0 left-0 right-2 z-10 px-5 h-12 app-drag-handle',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <SyncButton />
      </div>
      <span className="font-semibold text-cyan-400">
        {selectedNote ? selectedNote.title : 'Proto-Note'}
      </span>
      <div className="flex justify-end flex-1 gap-2">
        {selectedNote && <SaveButton />}
        <div className="relative">
          <AccountButton />
        </div>
      </div>
    </header>
  )
}
