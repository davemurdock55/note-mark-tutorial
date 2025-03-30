import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { DraggableTopBar } from '../DraggableTopBar'

interface AuthPageProps {
  onAuthenticated: () => void
}

export const AuthPage = ({ onAuthenticated }: AuthPageProps) => {
  const [isLoginView, setIsLoginView] = useState(true)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DraggableTopBar />
      <div className="w-full max-w-md">
        {isLoginView ? (
          <LoginForm onSuccess={onAuthenticated} onSwitchToSignup={() => setIsLoginView(false)} />
        ) : (
          <SignupForm onSuccess={onAuthenticated} onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </div>
    </div>
  )
}
