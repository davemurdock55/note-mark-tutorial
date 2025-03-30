import { getRootDir, readNote, writeNote, deleteNote } from './index'
import axios from 'axios'
import { readdir } from 'fs-extra'
import { fileEncoding, protoNoteAPI } from '@shared/constants'
import { FullNote } from '@shared/models'
import { getCurrentUser } from './user'
import { UserCredentials } from '@shared/auth'

const SYNC_ENDPOINT = `${protoNoteAPI}/notes/sync`

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

    notesPayload.push({
      title,
      content,
      lastEditTime: new Date().getTime()
    })
  }
  // Get current user
  const currentUser: UserCredentials = await getCurrentUser() // implement this to get username

  // Log the entire payload
  console.log(`Sending all notes to API:`, JSON.stringify(notesPayload, null, 2))

  // Send all notes in one request
  try {
    // Send username, notes, and lastSyncedTime
    const response = await axios.post(SYNC_ENDPOINT, {
      username: currentUser.username,
      notes: notesPayload
    })
    console.log('Sync response:', response.data)

    // Process the response to reconcile with local files
    await reconcileWithCloudNotes(response.data, notesPayload)

    return true
  } catch (error) {
    console.error('Error syncing notes with cloud:', error)
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

  // Create maps for easier lookup
  const localNotesMap = new Map<string, FullNote>()
  localNotes.forEach((note) => localNotesMap.set(note.title, note))

  const cloudNotesMap = new Map<string, FullNote>()
  cloudNotes.forEach((note) => cloudNotesMap.set(note.title, note))

  // 1. Update/create notes from cloud
  for (const cloudNote of cloudNotes) {
    const localNote = localNotesMap.get(cloudNote.title)

    if (!localNote || cloudNote.lastEditTime > localNote.lastEditTime) {
      console.log(`Updating/creating note from cloud: ${cloudNote.title}`)
      await writeNote(cloudNote.title, cloudNote.content)
    }
  }

  // 2. Delete local notes not in cloud
  for (const [title, _] of localNotesMap.entries()) {
    if (!cloudNotesMap.has(title)) {
      console.log(`Deleting local note not found in cloud: ${title}`)
      await deleteNote(title)
    }
  }

  console.log('Reconciliation complete')
}
