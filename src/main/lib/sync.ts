import { getRootDir, readNote } from './index'
import axios from 'axios'
import { readdir } from 'fs-extra'
import { fileEncoding } from '@shared/constants'

const API_ENDPOINT = 'https://your-api-gateway-url.amazonaws.com/prod'

export const syncNotesWithCloud = async () => {
  const rootDir = getRootDir()
  const notesFileNames = await readdir(rootDir, {
    encoding: fileEncoding,
    withFileTypes: false
  })

  const notes = notesFileNames.filter((fileName) => fileName.endsWith('.md'))

  // For each note, read its content and send to Lambda
  const syncPromises = notes.map(async (fileName) => {
    const title = fileName.replace(/\.md$/, '')
    const content = await readNote(title)

    // make sure we're sending in a good format like json
    return axios.post(`${API_ENDPOINT}/notes`, {
      title,
      content,
      lastEditTime: new Date().getTime()
    })

    // [ ] - then when the promise comes back you should do like a .then() or something and reconcile the file system with the API (you can use lastEditTime, btw, if needed)
    // [ ] - create any files that you don't have
    // [ ] - delete any files that the API didn't return
    // [ ] - update all other files (or just ones with a later edit time if you really want to get that complicated, which you probably don't_
  })

  await Promise.all(syncPromises)
  return true
}
