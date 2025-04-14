import { LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { currentUserAtom, logoutAtom } from '@renderer/store'

interface AccountMenuProps {
  setIsAccountMenuOpen: (isOpen: boolean) => void
}

export const AccountMenu = ({ setIsAccountMenuOpen }: AccountMenuProps) => {
  const user = useAtomValue(currentUserAtom)
  const logout = useSetAtom(logoutAtom)

  const handleLogout = async () => {
    console.log('Logging out...')
    await logout()
    setIsAccountMenuOpen(false)
  }

  // Using an event listener to close the menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only close if not clicking within the menu itself
      const target = e.target as HTMLElement
      if (!target.closest('.account-menu-content')) {
        setIsAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsAccountMenuOpen])

  // Creating a portal to render the Account Menu at root level
  return createPortal(
    <div className="absolute z-50 w-56 overflow-hidden shadow-xl account-menu-content right-3 top-12 rounded-xl">
      {/* Two-layer blur technique - similar to what's used in TitleBar */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-700/50 backdrop-blur-md"></div>

      {/* Menu content with semi-transparent background */}
      <div className="relative backdrop-blur-md bg-white/30 dark:bg-gray-800/30 ring-1 ring-white/20 dark:ring-black/10">
        {/* Menu header */}
        <div className="border-b border-gray-200 dark:border-gray-700/50">
          <div className="p-4">
            <div className="font-medium text-gray-700 dark:text-gray-200">
              {user.name || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {user.username || 'Not logged in'}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-2">
          {/* <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/50">
            <User className="mr-2 size-4" />
            Profile
          </button>

          <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 transition-colors rounded-lg dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-700/50">
            <Settings className="mr-2 size-4" />
            Settings
          </button>

          <div className="h-px my-1 bg-gray-200 dark:bg-gray-700/30"></div> */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-500 transition-colors rounded-lg hover:bg-red-50/80 dark:hover:bg-red-600/25 hover:backdrop-blur-sm"
          >
            <LogOut className="mr-2 size-4" />
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
