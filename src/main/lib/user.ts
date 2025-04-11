import { getRootDir } from './index'
import { readFile, writeFile, pathExists } from 'fs-extra'
import { fileEncoding, userCredentialsFile } from '@shared/constants'
import { UserCredentials, defaultUserState } from '@shared/auth-types'
import path from 'path'
import axios from 'axios'
import { protoNoteAPI } from '@shared/constants'

const getUserCredentialsPath = () => {
  return path.join(getRootDir(), userCredentialsFile)
}

// Add authentication endpoints
const AUTH_ENDPOINT = `${protoNoteAPI}/auth`

export const login = async (username: string, password: string): Promise<UserCredentials> => {
  try {
    // In a real app, you'd make an API call here
    const loginResponse = await axios.post(`${AUTH_ENDPOINT}/login`, {
      username,
      password
    })

    const credentials: UserCredentials = {
      name: loginResponse.data.response?.name || 'User',
      username,
      token: loginResponse.data.response?.token || 'dummy-token',
      isLoggedIn: true
    }

    await saveUserCredentials(credentials)
    return credentials
  } catch (error) {
    // Extract the error message from the Axios error
    let errorMessage = 'Login failed'

    if (axios.isAxiosError(error) && error.response) {
      // Extract the message from the API response if available
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`
      }
      console.error('Login error response:', error.response.data)
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    // Create an error object that includes the error message
    const errorResult = {
      ...defaultUserState,
      errorMessage: errorMessage
    }

    console.error('Login failed:', errorMessage)
    return errorResult
  }
}

export const signup = async (
  name: string,
  username: string,
  password: string
): Promise<UserCredentials> => {
  try {
    // In a real app, you'd make an API call here
    const response = await axios.post(`${AUTH_ENDPOINT}/register`, {
      name,
      username,
      password
    })

    if (response.status === 200) {
      return login(username, password)
    }

    // If we get here but status is not 200, return default state with an error
    return {
      ...defaultUserState,
      errorMessage: `Unexpected response: ${response.status}`
    }
  } catch (error) {
    // Extract the error message from the Axios error
    let errorMessage = 'Signup failed'

    if (axios.isAxiosError(error) && error.response) {
      // Extract the message from the API response if available
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`
      }
      console.error('Signup error response:', error.response.data)
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    // Create an error object that includes the error message
    const errorResult = {
      ...defaultUserState,
      errorMessage: errorMessage
    }

    console.error('Signup failed:', errorMessage)
    return errorResult
  }
}

export const logout = async (): Promise<boolean> => {
  try {
    // Get current user credentials to access the token
    const currentUser = await getCurrentUser()

    // Only call the API if the user is logged in and has a token
    if (currentUser.isLoggedIn && currentUser.token) {
      try {
        // Make API call to logout with the token in the authorization header
        await axios.post(
          `${AUTH_ENDPOINT}/logout`,
          {
            username: currentUser.username,
            token: currentUser.token
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`
            }
          }
        )
      } catch (apiError) {
        // Log API error but continue to clear local credentials
        console.error('Logout API call failed:', apiError)
        // We still want to clear local credentials even if the API call fails
      }
    }

    // Always clear local credentials
    await clearUserCredentials()
    return true
  } catch (error) {
    console.error('Logout failed:', error)
    return false
  }
}

export const verifyToken = async (username: string, token: string): Promise<UserCredentials> => {
  try {
    // Call the verify endpoint
    const response = await axios.post(
      `${AUTH_ENDPOINT}/verify`,
      {
        username,
        token
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    console.log('verification response:', response.data)

    if (response.data.verified) {
      // Token is valid, return user credentials
      return {
        name: response.data.name || 'User', // Use name from response or default
        username,
        token,
        isLoggedIn: true
      }
    } else {
      console.log('Token verification failed:', response.data.message)
      return defaultUserState
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return defaultUserState
  }
}

export const getCurrentUser = async (): Promise<UserCredentials> => {
  const credentialsPath = getUserCredentialsPath()

  try {
    if (await pathExists(credentialsPath)) {
      const userData = await readFile(credentialsPath, { encoding: fileEncoding })
      const savedCredentials = JSON.parse(userData) as UserCredentials

      // If we have saved credentials with a token, verify it
      if (savedCredentials.token && savedCredentials.username) {
        console.log('Found saved credentials, verifying token...')
        const verifiedCredentials = await verifyToken(
          savedCredentials.username,
          savedCredentials.token
        )

        if (verifiedCredentials.isLoggedIn) {
          // Token is valid, preserve the name from saved credentials
          return {
            ...verifiedCredentials,
            name: savedCredentials.name || verifiedCredentials.name
          }
        }

        // If token verification failed, clear credentials and return default state
        console.log('Saved token is invalid, clearing credentials')
        await clearUserCredentials()
      }
    }
    return defaultUserState
  } catch (error) {
    console.error('Error reading user credentials:', error)
    return defaultUserState
  }
}

export const saveUserCredentials = async (credentials: UserCredentials): Promise<boolean> => {
  try {
    await writeFile(getUserCredentialsPath(), JSON.stringify(credentials, null, 2), {
      encoding: fileEncoding
    })
    return true
  } catch (error) {
    console.error('Error saving user credentials:', error)
    return false
  }
}

export const clearUserCredentials = async (): Promise<boolean> => {
  return await saveUserCredentials(defaultUserState)
}
