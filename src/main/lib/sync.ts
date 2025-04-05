import { getRootDir, readNote, writeNote, deleteNote, getNoteInfoFromFileName } from './index'
import axios from 'axios'
import { readdir, readJson, writeJson, pathExists } from 'fs-extra'
import { fileEncoding, protoNoteAPI } from '@shared/constants'
import { FullNote } from '@shared/models'
import { getCurrentUser } from './user'
import { UserCredentials } from '@shared/auth-types'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { app } from 'electron'
import crypto from 'crypto'

const NOTES_ENDPOINT = `${protoNoteAPI}/notes`
const SYNC_INFO_FILE = 'sync_info.json'

interface SyncInfo {
  deviceId: string
  lastSyncedTime: number
}

// Get or create device ID and last synced time
async function getSyncInfo(): Promise<SyncInfo> {
  const syncInfoPath = path.join(getRootDir(), SYNC_INFO_FILE)

  if (await pathExists(syncInfoPath)) {
    try {
      return await readJson(syncInfoPath)
    } catch (error) {
      console.error('Error reading sync info, creating new:', error)
    }
  }

  // Create new sync info with a more persistent device ID
  const deviceId = getDeviceId()
  const newSyncInfo: SyncInfo = {
    deviceId,
    lastSyncedTime: 0
  }

  await writeJson(syncInfoPath, newSyncInfo)
  return newSyncInfo
}

// Function to get a more persistent device ID
function getDeviceId(): string {
  try {
    // Use Electron's app paths to create a unique identifier
    const appPath = app.getPath('exe')
    const userData = app.getPath('userData')

    // Hash the values to create a consistent device ID
    return crypto
      .createHash('sha256')
      .update(`${appPath}-${userData}`)
      .digest('hex')
      .substring(0, 32) // Truncate to make it more manageable
  } catch (error) {
    console.error('Failed to get Electron device ID, falling back to UUID:', error)
    return uuidv4()
  }
}

// Save the updated sync info
async function updateSyncInfo(lastSyncedTime: number): Promise<void> {
  const syncInfoPath = path.join(getRootDir(), SYNC_INFO_FILE)
  const syncInfo = await getSyncInfo()

  syncInfo.lastSyncedTime = lastSyncedTime
  await writeJson(syncInfoPath, syncInfo)
}

export const syncNotesWithCloud = async () => {
  const rootDir = getRootDir()
  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  // Create an array to hold all note data
  const notesPayload: FullNote[] = []

  // Prepare all notes data
  for (const fileName of notes) {
    const title = fileName.replace(/\.md$/, '')
    const content = await readNote(title)

    // Get the actual note info with the correct lastEditTime from the file system
    const noteInfo = await getNoteInfoFromFileName(fileName)

    notesPayload.push({
      title,
      content,
      lastEditTime: noteInfo.lastEditTime,
      createdAtTime: noteInfo.createdAtTime
    })
  }

  // Get current user
  const currentUser: UserCredentials = await getCurrentUser()

  // Get device ID and last synced time
  const syncInfo = await getSyncInfo()

  console.log(
    `Starting sync for device ${syncInfo.deviceId}, last synced: ${new Date(syncInfo.lastSyncedTime).toISOString()}`
  )
  console.log(`Sending ${notesPayload.length} notes to API`)

  // Send all notes in one request
  try {
    const response = await axios.post(
      `${NOTES_ENDPOINT}/sync`,
      {
        username: currentUser.username,
        deviceId: syncInfo.deviceId,
        notes: notesPayload
      },
      {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      }
    )

    console.log('Sync response: ', response.data)

    // Update the lastSyncedTime from the server response
    if (response.data && response.data.lastSyncedTime) {
      await updateSyncInfo(response.data.lastSyncedTime)
      console.log(
        `Updated lastSyncedTime to: ${new Date(response.data.lastSyncedTime).toISOString()}`
      )
    }

    // Process the response to reconcile with local files
    await reconcileWithCloudNotes(response.data.notes, notesPayload)

    return true
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error syncing notes with cloud:')
      console.error('Status:', error.response.status)
      console.error('Message:', error.response.data)
    } else {
      console.error('Error syncing notes with cloud:', error)
    }
    return false
  }
}

/**
 * Reconciles local notes with cloud notes
 * @param cloudNotes - Notes received from the cloud API
 * @param localNotes - Local notes that were sent to the API
 */
async function reconcileWithCloudNotes(cloudNotes: FullNote[], localNotes: FullNote[]) {
  console.log('Beginning reconciliation with cloud notes...')
  console.log(`Received ${cloudNotes.length} notes from server`)

  // Create maps for easier lookup
  const localNotesMap = new Map<string, FullNote>()
  localNotes.forEach((note) => localNotesMap.set(note.title, note))

  const cloudNotesMap = new Map<string, FullNote>()
  cloudNotes.forEach((note) => cloudNotesMap.set(note.title, note))

  // Track sync operations stats
  let notesUpdated = 0
  let notesDeleted = 0

  // 1. Update local notes with cloud notes
  for (const cloudNote of cloudNotes) {
    const localNote = localNotesMap.get(cloudNote.title)

    if (!localNote || cloudNote.lastEditTime > localNote.lastEditTime) {
      // Note is either new or newer on server
      console.log(`Updating local note: ${cloudNote.title} (${!localNote ? 'new' : 'modified'})`)
      await writeNote(
        cloudNote.title,
        cloudNote.content,
        cloudNote.lastEditTime,
        cloudNote.createdAtTime
      )
      notesUpdated++
    } else {
      console.log(`Skipping note ${cloudNote.title} - local version is up to date`)
    }
  }

  // 2. Delete local notes not in cloud (they were deleted elsewhere)
  // 2. Delete local notes not in cloud (they were deleted elsewhere)
  const deletePromises: Promise<void>[] = [] // Add type annotation here
  for (const [title, _] of localNotesMap.entries()) {
    if (!cloudNotesMap.has(title)) {
      console.log(`Deleting local note not found in cloud: ${title}`)
      deletePromises.push(
        deleteNote(title)
          .then(() => {
            notesDeleted++
          })
          .catch((error) => {
            console.error(`Failed to delete note ${title}:`, error)
          })
      )
    }
  }

  // Wait for all delete operations to complete
  if (deletePromises.length > 0) {
    await Promise.all(deletePromises)
  }

  console.log(
    `Reconciliation complete: ${notesUpdated} notes updated, ${notesDeleted} notes deleted`
  )
}
