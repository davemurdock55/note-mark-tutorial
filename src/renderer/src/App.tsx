import {
  ActionButtonsRow,
  Content,
  DraggableTopBar,
  TitleBar,
  NotePreviewList,
  RootLayout,
  Sidebar,
  TextEditor
} from '@/components'
import { useRef } from 'react'

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null)

  const resetScroll = () => {
    contentContainerRef.current?.scrollTo(0, 0)
  }

  return (
    <>
      <DraggableTopBar />
      <RootLayout>
        <Sidebar className="px-2">
          <ActionButtonsRow className="flex justify-between mt-1" />
          <NotePreviewList className="mt-3 space-y-1" onSelect={resetScroll} />
        </Sidebar>

        <Content
          ref={contentContainerRef}
          className="text-gray-700 border-l dark:text-white bg-white/50 dark:bg-gray-900/50 border-l-white/20"
        >
          <TextEditor />
        </Content>
      </RootLayout>
    </>
  )
}

export default App
