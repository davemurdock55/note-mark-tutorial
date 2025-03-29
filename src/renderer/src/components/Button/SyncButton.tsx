import { ActionButton } from './ActionButton'
import { syncNotesAtom } from '@renderer/store'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Cloud, LoaderCircle } from 'lucide-react'

export const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const syncNotes = useSetAtom(syncNotesAtom)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncNotes()
      console.log('Notes synced successfully')
    } catch (error) {
      console.error('Error syncing notes:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <ActionButton
      className={`hover:bg-slate-300/50 hover:text-gray-500 ${isSyncing ? 'bg-slate-200' : ''}`}
      onClick={handleSync}
      disabled={isSyncing}
    >
      {!isSyncing ? (
        <Cloud className="size-5 text-zinc-500 dark:text-zinc-300" />
      ) : (
        <LoaderCircle className="size-5 text-cyan-500 animate-spin" />
      )}
    </ActionButton>
  )
}
