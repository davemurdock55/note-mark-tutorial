import { useRef, useState, useEffect } from 'react'
import { ActionButton } from './ActionButton'
import { AccountMenu } from '../AccountMenu'
import { CircleUserRound } from 'lucide-react'

interface AccountButtonProps {
  menuRef: React.RefObject<HTMLDivElement>
}

export const AccountButton = ({ menuRef }: AccountButtonProps) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <ActionButton
        className="hover:bg-slate-300/50 hover:text-gray-500"
        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
      >
        <CircleUserRound className="size-5 text-zinc-500 dark:text-zinc-300" />
      </ActionButton>

      {isAccountMenuOpen && <AccountMenu setIsAccountMenuOpen={setIsAccountMenuOpen} />}
    </>
  )
}
