// In TextEditor.tsx - modified version
import { useMarkdownEditor } from '@renderer/hooks/useMarkdownEditor'
import { useEffect, useRef } from 'react'

export const TextEditor = () => {
  const { selectedNote, handleAutoSaving, handleBlur } = useMarkdownEditor()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus the textarea when the note changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [selectedNote?.title])

  // This effect adjusts the size of the textarea to match its content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Initial resize
    adjustHeight()

    // Setup event listeners
    textarea.addEventListener('input', adjustHeight)

    return () => {
      textarea.removeEventListener('input', adjustHeight)
    }
  }, [selectedNote?.title]) // Re-run when selected note changes

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store cursor position
    const selectionStart = e.target.selectionStart
    const selectionEnd = e.target.selectionEnd

    // Handle auto-saving
    handleAutoSaving(e.target.value)

    // Restore cursor position (after React updates)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd)
      }
    }, 0)
  }

  if (!selectedNote) return null

  return (
    <textarea
      ref={textareaRef}
      key={selectedNote.title}
      defaultValue={selectedNote.content}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-full min-h-full px-8 py-5 text-lg bg-transparent outline-none resize-none caret-cyan-400 selection:bg-cyan-300"
      placeholder="Start typing your note here..."
      style={{ overflow: 'hidden' }} // Hide scrollbars on the textarea
    />
  )
}
