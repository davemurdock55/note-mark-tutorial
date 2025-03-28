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

    // Update content state
    const newContent = e.target.value
    setContent(newContent)
    setEditorContent(newContent) // Update the editor content atom

    // Handle auto-saving
    handleAutoSaving(newContent)

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
      value={content} // Use controlled component instead of defaultValue
      onChange={handleChange}
      onBlur={handleTextEditorBlur}
      className="w-full min-h-full px-8 py-5 text-lg bg-transparent outline-none resize-none caret-cyan-400 selection:bg-cyan-300"
      placeholder="Start typing your note here..."
      style={{ overflow: 'hidden' }} // Hide scrollbars on the textarea
    />
  )
}
