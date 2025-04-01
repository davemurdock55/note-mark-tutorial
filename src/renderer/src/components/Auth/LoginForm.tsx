import { useState } from 'react'
import { loginAtom } from '@renderer/store'
import { useSetAtom } from 'jotai'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToSignup: () => void
}

export const LoginForm = ({ onSuccess, onSwitchToSignup }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const login = useSetAtom(loginAtom)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login({ username, password })

      if (result.success) {
        onSuccess()
      } else {
        // Use the specific error message from the server
        setError(result.message || 'Invalid username or password')
      }
    } catch (err) {
      // Fallback error handling
      if (err instanceof Error) {
        setError(`Login failed: ${err.message}`)
      } else {
        setError('Login failed. Please try again.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 mx-auto shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-cyan-400 dark:text-white">
        Log in to Proto-Note
      </h2>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-white bg-white/80 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-white bg-white/80 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white rounded-md bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-400"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-cyan-500 hover:underline focus:outline-none"
        >
          Sign up
        </button>
      </div>
    </div>
  )
}
