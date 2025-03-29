import { selectedNoteAtom } from '@renderer/store'
import { useAtomValue } from 'jotai'
import { ComponentProps, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { SaveButton } from './Button/SaveButton'
import { AccountButton } from './Button/AccountButton'
import { SyncButton } from './Button/SyncButton'

export const FloatingNoteTitle = ({ className, ...props }: ComponentProps<'div'>) => {
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const selectedNote = useAtomValue(selectedNoteAtom)

  return (
    <header
      className={twMerge(
        'flex items-center py-2 bg-white/90 backdrop-blur-sm shadow-sm absolute top-0 left-0 right-2 z-10 px-5 h-12 app-drag-handle',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <SyncButton />
      </div>

      <span className="font-medium text-cyan-400">
        {selectedNote ? selectedNote.title : 'No Note Selected'}
      </span>
      <div className="flex justify-end flex-1 gap-2">
        {selectedNote && <SaveButton />}
        <div className="relative" ref={accountMenuRef}>
          <AccountButton menuRef={accountMenuRef} />
        </div>
      </div>
    </header>
  )
}
