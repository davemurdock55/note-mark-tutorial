import { getRootDir } from './index'
import { readFile, writeFile, pathExists } from 'fs-extra'
import { fileEncoding, userCredentialsFile } from '@shared/constants'
import { UserCredentials, defaultUserState } from '@shared/auth'
import path from 'path'

const getUserCredentialsPath = () => {
  return path.join(getRootDir(), userCredentialsFile)
}

export const getCurrentUser = async (): Promise<UserCredentials> => {
  const credentialsPath = getUserCredentialsPath()

  try {
    if (await pathExists(credentialsPath)) {
      const userData = await readFile(credentialsPath, { encoding: fileEncoding })
      return JSON.parse(userData)
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
