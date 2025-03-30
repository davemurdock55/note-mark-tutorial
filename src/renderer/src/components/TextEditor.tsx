import { useMarkdownEditor } from '@renderer/hooks/useMarkdownEditor'
import { useEffect, useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { editorContentAtom } from '@renderer/store'

export const TextEditor = () => {
  const { selectedNote, handleAutoSaving, handleTextEditorBlur } = useMarkdownEditor()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const setEditorContent = useSetAtom(editorContentAtom) // Get the setter for the editor content atom

  // Set initial content when note changes
  useEffect(() => {
    if (selectedNote) {
      setContent(selectedNote.content)
      setEditorContent(selectedNote.content) // Set the editor content atom
    }
  }, [selectedNote?.title, setEditorContent])

  // Focus the textarea when the note changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [selectedNote?.title])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      // Store the current scroll position of the parent container
      const container = textarea.parentElement
      const scrollTop = container?.scrollTop || 0

      // Adjust height
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`

      // Restore scroll position
      if (container) {
        container.scrollTop = scrollTop
      }
    }

    // Initial resize
    adjustHeight()

    // Setup event listeners
    textarea.addEventListener('input', adjustHeight)

    // Force height adjustment after content is set
    const timer = setTimeout(adjustHeight, 0)

    return () => {
      textarea.removeEventListener('input', adjustHeight)
      clearTimeout(timer)
    }
  }, [selectedNote?.title, content]) // Add content to dependencies

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Store cursor position
    const selectionStart = e.target.selectionStart
    const selectionEnd = e.target.selectionEnd

    // Store scroll position of the parent container
    const container = textareaRef.current?.parentElement
    const scrollTop = container?.scrollTop || 0

    // Get old and new content to detect new lines
    const oldContent = content
    const newContent = e.target.value

    // Check if a new line was added
    const newLineAdded = newContent.split('\n').length > oldContent.split('\n').length

    // Update content state
    setContent(newContent)
    setEditorContent(newContent) // Update the editor content atom

    // Handle auto-saving
    handleAutoSaving(newContent)

    // Restore cursor and scroll position (after React updates)
    setTimeout(() => {
      if (textareaRef.current && container) {
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd)

        // If a new line was added, ensure cursor is visible
        if (newLineAdded) {
          // Calculate cursor position in the textarea
          const textareaRect = textareaRef.current.getBoundingClientRect()
          const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight) || 24

          // Estimate cursor position
          const cursorY = Math.floor(selectionStart / (newContent.length / textareaRect.height))

          // If cursor is near the bottom of the visible area, scroll down a bit
          const scrollMargin = lineHeight * 2
          const cursorBottom = cursorY + scrollMargin
          const visibleBottom = scrollTop + container.clientHeight

          if (cursorBottom > visibleBottom) {
            container.scrollTop = scrollTop + lineHeight
          } else {
            container.scrollTop = scrollTop
          }
        } else {
          container.scrollTop = scrollTop
        }
      }
    }, 0)
  }

  if (!selectedNote) return null

  return (
    <textarea
      ref={textareaRef}
      key={selectedNote.title}
      value={content} // Use controlled component instead of defaultValue
      onChange={handleChange}
      onBlur={handleTextEditorBlur}
      className="w-full min-h-full px-8 py-5 text-lg bg-transparent outline-none resize-none caret-cyan-400 selection:bg-cyan-400 selection:text-white dark:selection:bg-cyan-400/90 dark:selection:text-gray-700"
      placeholder="Start typing your note here..."
      style={{ overflow: 'hidden' }} // Hide scrollbars on the textarea
    />
  )
}
