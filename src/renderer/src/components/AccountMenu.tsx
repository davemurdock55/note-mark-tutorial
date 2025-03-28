import { LogOut } from 'lucide-react'

interface AccountMenuProps {
  setIsAccountMenuOpen: (isOpen: boolean) => void
}

export const AccountMenu = ({ setIsAccountMenuOpen }: AccountMenuProps) => {
  const handleLogout = () => {
    console.log('Logout clicked')
    // Implement logout functionality here
    setIsAccountMenuOpen(false)
  }

  return (
    <div className="absolute right-0 z-20 mt-1 overflow-hidden border border-gray-100 shadow-md rounded-xl bg-white/50 backdrop-blur-xl">
      <div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 px-3 text-sm text-red-500 transition-colors duration-100 hover:bg-black/5"
        >
          <LogOut className="mr-2 size-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
