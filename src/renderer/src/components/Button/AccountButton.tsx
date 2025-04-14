import { useState } from 'react'
import { ActionButton } from './ActionButton'
import { AccountMenu } from '../AccountMenu'
import { CircleUserRound } from 'lucide-react'

export const AccountButton = () => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  return (
    <>
      <ActionButton
        // className="text-zinc-500 hover:bg-slate-300/50 hover:text-gray-500 dark:text-zinc-300 dark:hover:text-cyan-400 dark:active:bg-slate-400/50"
        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
      >
        <CircleUserRound className="size-5" />
      </ActionButton>

      {isAccountMenuOpen && <AccountMenu setIsAccountMenuOpen={setIsAccountMenuOpen} />}
    </>
  )
}
