import { ComponentProps, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { FloatingNoteTitle } from './FloatingNoteTitle'

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
        'w-[250px] flex-shrink-0 mt-10 h-[calc(100vh-10px)] overflow-y-auto',
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
      <div ref={ref} className="absolute inset-0 pt-10 overflow-y-auto">
        {children}
      </div>
      <FloatingNoteTitle className="absolute top-0 left-0 right-0 z-10 pt-2" />
    </div>
  )
)

Content.displayName = 'Content'
