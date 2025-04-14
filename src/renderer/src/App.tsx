import {
  ActionButtonsRow,
  Content,
  DraggableTopBar,
  NotePreviewList,
  RootLayout,
  Sidebar,
  TextEditor
} from '@/components'
import { AuthPage } from '@/components/Auth/AuthPage'
import { useRef, useState, useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { authLoadingAtom, currentUserAtom } from '@renderer/store'

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const user = useAtomValue(currentUserAtom)
  const isAuthLoading = useAtomValue(authLoadingAtom)
  const setAuthLoading = useSetAtom(authLoadingAtom)
  const [elapsed, setElapsed] = useState(0)
  const [showUI, setShowUI] = useState(false)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    'loading'
  )
  const [enforceMinimumLoadingTime, setEnforceMinimumLoadingTime] = useState(true)

  const resetScroll = () => {
    contentContainerRef.current?.scrollTo(0, 0)
  }

  // Effect to update auth status when user info is available
  useEffect(() => {
    if (user) {
      // Don't immediately set authLoading to false - we'll do that after minimum time
      // setAuthLoading(false); - removed
      setAuthStatus(user.isLoggedIn ? 'authenticated' : 'unauthenticated')

      // Start the timer for minimum loading display
      const minTimer = setTimeout(() => {
        setEnforceMinimumLoadingTime(false)
        setAuthLoading(false) // Now we can finish loading
      }, 1000) // Show loading for at least 1 second

      return () => clearTimeout(minTimer)
    }
  }, [user, setAuthLoading])

  // Effect to handle completed authentication flow
  useEffect(() => {
    if (!isAuthLoading && !enforceMinimumLoadingTime) {
      // Only proceed when both conditions are met
      // Add a small delay before showing UI to allow everything to initialize
      const timer = setTimeout(() => {
        setShowUI(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isAuthLoading, enforceMinimumLoadingTime])

  // Timer to track how long we've been in loading state
  useEffect(() => {
    if (!isAuthLoading && !enforceMinimumLoadingTime) return

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isAuthLoading, enforceMinimumLoadingTime])

  // Effect to force exit loading state after delay
  useEffect(() => {
    if (!user?.isLoggedIn || (!isAuthLoading && !enforceMinimumLoadingTime)) return

    const forceTimeout = setTimeout(() => {
      console.log('Detected logged in user but still loading - forcing app to load')
      window.location.reload()
    }, 3000)

    return () => clearTimeout(forceTimeout)
  }, [user, isAuthLoading, enforceMinimumLoadingTime])

  // Always show loading screen until we have a definite auth status and UI is ready
  if (isAuthLoading || enforceMinimumLoadingTime || !showUI || authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <DraggableTopBar />
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-cyan-400">Proto-Note</h1>
          <div className="inline-block mt-8 border-4 rounded-full size-10 animate-spin border-cyan-400 border-t-transparent"></div>

          {elapsed >= 5 && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-sm text-white transition-colors rounded-md bg-cyan-500 hover:bg-cyan-600"
            >
              Reload?
            </button>
          )}
        </div>
      </div>
    )
  }

  // Only switch to the appropriate UI after loading is complete
  if (authStatus === 'unauthenticated') {
    return <AuthPage onAuthenticated={() => setAuthStatus('authenticated')} />
  }

  // User is authenticated - show main app
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