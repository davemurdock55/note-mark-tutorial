import { appDirectoryName, fileEncoding, welcomeNoteFilename } from '@shared/constants'
import { NoteInfo } from '@shared/models'
import { CreateNote, DeleteNote, GetNotes, ReadNote, WriteNote } from '@shared/types'
import { dialog } from 'electron'
import fs, {
  ensureDir,
  pathExists,
  readdir,
  readFile,
  readJson,
  remove,
  stat,
  writeFile,
  writeJson
} from 'fs-extra'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
import welcomeNoteFile from '../../../resources/welcomeNote.md?asset'

export const getRootDir = () => {
  return `${homedir()}/${appDirectoryName}`
}

export const getNotes: GetNotes = async () => {
  const rootDir = getRootDir()

  await ensureDir(rootDir)

  // get all the file names in the root directory
  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  if (isEmpty(notes)) {
    console.info('No notes found. Creating a welcome note.')

    const content = await readFile(welcomeNoteFile, { encoding: fileEncoding })

    // create the welcome note
    await writeFile(`${rootDir}/${welcomeNoteFilename}`, content, { encoding: fileEncoding })

    // add that note to the "notes" array jotai state
    notes.push(welcomeNoteFilename)
  }

  return Promise.all(notes.map(getNoteInfoFromFileName))
}

export const getNoteInfoFromFileName = async (fileName: string): Promise<NoteInfo> => {
  const fileStats = await stat(`${getRootDir()}/${fileName}`)
  const title = fileName.replace(/\.md$/, '')

  // First try to get metadata
  const metadata = await getNoteMetadata(title)

  if (metadata && metadata.createdAtTime) {
    // Return with metadata creation time but current edit time
    return {
      title,
      lastEditTime: fileStats.mtimeMs,
      createdAtTime: metadata.createdAtTime
    }
  }

  // Fall back to file system if no metadata exists
  let createdAtTime = fileStats.birthtimeMs

  // If birthtime equals mtime or is in the future, it's likely not reliable
  if (createdAtTime === fileStats.mtimeMs || createdAtTime > Date.now()) {
    createdAtTime = fileStats.mtimeMs
  }

  return {
    title,
    lastEditTime: fileStats.mtimeMs,
    createdAtTime
  }
}

export const readNote: ReadNote = async (fileName) => {
  const rootDir = getRootDir()

  return await readFile(`${rootDir}/${fileName}.md`, { encoding: fileEncoding })
}

async function saveNoteMetadata(title: string, metadata: NoteInfo): Promise<void> {
  const rootDir = getRootDir()
  const metadataDir = path.join(rootDir, '.metadata')
  await ensureDir(metadataDir)

  const metadataPath = path.join(metadataDir, `${title}.json`)
  await writeJson(metadataPath, metadata)
}

async function getNoteMetadata(title: string): Promise<NoteInfo | null> {
  const rootDir = getRootDir()
  const metadataPath = path.join(rootDir, '.metadata', `${title}.json`)

  if (await pathExists(metadataPath)) {
    return readJson(metadataPath)
  }
  return null
}

export const writeNote: WriteNote = async (
  fileName,
  content,
  lastEditTime: number,
  createdAtTime: number
) => {
  const rootDir = getRootDir()
  const filePath = `${rootDir}/${fileName}.md`

  console.info(`Writing note ${fileName}`)
  await writeFile(filePath, content, { encoding: fileEncoding })

  // Save creation time if provided
  if (createdAtTime) {
    await saveNoteMetadata(fileName, {
      title: fileName,
      lastEditTime: lastEditTime,
      createdAtTime: createdAtTime
    })
  }

  // If preserveTimestamp is provided, update the file's modification time
  if (lastEditTime) {
    try {
      // Convert milliseconds to seconds for the API
      const timeInSeconds = lastEditTime / 1000
      await fs.utimes(filePath, timeInSeconds, timeInSeconds)
    } catch (error) {
      console.error(`Failed to preserve timestamp for ${fileName}:`, error)
    }
  }
}
export const createNote: CreateNote = async () => {
  const rootDir = getRootDir()
  await ensureDir(rootDir) // ensuring the root directory ('NoteMark') exists

  // using electron's dialog module to show a save dialog (which uses the native OS dialog)
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'New Note',
    defaultPath: `${rootDir}/Untitled.md`,
    buttonLabel: 'Create',
    properties: ['showOverwriteConfirmation'], // warn them if they are going to overwrite
    showsTagField: false,
    filters: [{ name: 'Markdown', extensions: ['md'] }] // only allowing them to save Markdown (.md) files
  })

  if (canceled || !filePath) {
    console.info('Note creation canceled')
    return false
  }

  const { name: filename, dir: parentDir } = path.parse(filePath)

  if (parentDir !== rootDir) {
    await dialog.showMessageBox({
      type: 'error',
      title: 'Note Creation failed',
      message: `All notes must be saved inside the ${rootDir} folder. \n\nNotes saved in other folders cannot be loaded.`
    })
    // return false since creating the note failed
    return false
  }

  console.info(`Creating note: ${filename}...`)
  await writeFile(filePath, '') // write the file to the dir with empty content

  // Initialize metadata for new note with current timestamp
  const now = Date.now()
  await saveNoteMetadata(filename, {
    title: filename,
    lastEditTime: now,
    createdAtTime: now
  })

  return filename
}

export const deleteNote: DeleteNote = async (filename) => {
  const rootDir = getRootDir()

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Delete note',
    message: `Are you sure you want to delete ${filename}?`,
    buttons: ['Delete', 'Cancel'], // 0 is the Delete button, 1 is the Cancel button
    defaultId: 1, // Cancel button will be the default selected button
    cancelId: 1 // Mapping the cancelId to the cancel button
  })

  if (response === 1) {
    console.info('Cancelled Deleting the Note')
    return false
  }

  // if the user didn't press the "Cancel" button, proceed with deleting the note
  console.info(`Deleting note: ${filename}...`)
  await remove(`${rootDir}/${filename}.md`)

  // Delete metadata file if it exists
  const metadataPath = path.join(rootDir, '.metadata', `${filename}.json`)
  if (await pathExists(metadataPath)) {
    await remove(metadataPath)
  }

  // the note should be successfully deleted now
  return true
}
