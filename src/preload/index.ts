import {
  CreateNote,
  DeleteNote,
  GetNotes,
  ReadNote,
  WriteNote,
  SyncNotesWithCloud,
  Login,
  Signup,
  Logout,
  GetCurrentUser
} from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    login: (...args: Parameters<Login>) => ipcRenderer.invoke('login', ...args),
    signup: (...args: Parameters<Signup>) => ipcRenderer.invoke('signup', ...args),
    logout: (...args: Parameters<Logout>) => ipcRenderer.invoke('logout', ...args),
    getCurrentUser: (...args: Parameters<GetCurrentUser>) =>
      ipcRenderer.invoke('getCurrentUser', ...args),
    // invoking the getNotes function on the 'backend' (which is the main process)
    // also uses the GetNotes Parameters type to make sure if we change the type, we change this code as well
    getNotes: (...args: Parameters<GetNotes>) => ipcRenderer.invoke('getNotes', ...args),
    readNote: (...args: Parameters<ReadNote>) => ipcRenderer.invoke('readNote', ...args),
    writeNote: (...args: Parameters<WriteNote>) => ipcRenderer.invoke('writeNote', ...args),
    createNote: (...args: Parameters<CreateNote>) => ipcRenderer.invoke('createNote', ...args),
    deleteNote: (...args: Parameters<DeleteNote>) => ipcRenderer.invoke('deleteNote', ...args),
    syncNotesWithCloud: (...args: Parameters<SyncNotesWithCloud>) =>
      ipcRenderer.invoke('syncNotesWithCloud', ...args)
  })
} catch (error) {
  console.error(error)
}
