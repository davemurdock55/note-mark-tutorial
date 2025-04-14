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
      className={`${isSyncing ? 'bg-slate-300/25 dark:hover:text-cyan-400' : ''}`}
      onClick={handleSync}
      disabled={isSyncing}
    >
      {!isSyncing ? (
        <Cloud className="size-5" />
      ) : (
        <LoaderCircle className="size-5 text-cyan-500 animate-spin" />
      )}
    </ActionButton>
  )
}
