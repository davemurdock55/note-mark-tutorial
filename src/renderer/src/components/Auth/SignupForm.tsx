import { useState } from 'react'
import { signupAtom } from '@renderer/store'
import { useSetAtom } from 'jotai'

interface SignupFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export const SignupForm = ({ onSuccess, onSwitchToLogin }: SignupFormProps) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const signup = useSetAtom(signupAtom)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({ name, username: email, password })

      if (result.success) {
        onSuccess()
      } else {
        // Use the specific error message from the server
        setError(
          result.message ||
            'Signup failed. Please try again later or contact davemurdock55@gmail.com.'
        )
      }
    } catch (err) {
      // Fallback error handling
      if (err instanceof Error) {
        setError(`Signup failed: ${err.message}`)
      } else {
        setError('Signup failed. Please try again.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 mx-auto shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl">
      <h2 className="mb-6 text-2xl font-bold text-center text-cyan-400 dark:text-white">
        Create your Proto-Note account
      </h2>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-white bg-white/80 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-white bg-white/80 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        <div className="mb-4">
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

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-white bg-white/80 dark:bg-gray-700/80 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 text-white rounded-md dark:text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-gray-400"
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-cyan-500 hover:underline focus:outline-none"
        >
          Log in
        </button>
      </div>
    </div>
  )
}
