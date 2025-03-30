import { ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { TitleBar } from './TitleBar'

// the overall layout of the app (sidebar on left and content on right)
export const RootLayout = ({ className, children, ...props }: ComponentProps<'main'>) => {
  return (
    <main
      className={twMerge('flex flex-row h-screen min-w-[500px] overflow-hidden', className)}
      {...props}
    >
      {children}
    </main>
  )
}

// the left sidebar listing the files/notes
export const Sidebar = ({ className, children, ...props }: ComponentProps<'aside'>) => {
  return (
    <aside
      className={twMerge(
        'w-[250px] flex-shrink-0 pt-10 h-100vh overflow-y-auto dark:bg-gray-700/50',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export const Content = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => (
    <div className={twMerge('flex-1 h-full relative overflow-hidden', className)} {...props}>
      {/* Backdrop blur layer */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-white/80 dark:bg-gray-700/30 backdrop-blur-md z-[5]"></div>
      <TitleBar className="absolute top-0 left-0 right-0 z-10 pt-2 bg-transparent" />

      <div ref={ref} className="absolute inset-0 pt-10 overflow-y-auto">
        {children}
      </div>
    </div>
  )
)

Content.displayName = 'Content'
