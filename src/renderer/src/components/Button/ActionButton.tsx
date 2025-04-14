import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export type ActionButtonProps = ComponentProps<'button'>

export const ActionButton = ({ className, children, ...props }: ActionButtonProps) => {
  return (
    <button
      className={twMerge(
        'px-2 py-1 rounded-md text-zinc-500 hover:text-slate-500/75 hover:bg-slate-300/25 active:bg-slate-400/25 dark:text-zinc-300 dark:hover:text-cyan-400 dark:active:bg-slate-400/50 border border-zinc-400/50 transition-colors duration-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
