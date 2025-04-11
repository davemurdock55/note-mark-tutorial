import { UserCredentials } from './auth-types'
import { NoteContent, NoteInfo } from './models'

export type Login = (username: string, password: string) => Promise<UserCredentials>
export type Signup = (name: string, username: string, password: string) => Promise<UserCredentials>
export type Logout = () => Promise<boolean>
export type GetCurrentUser = () => Promise<UserCredentials>
export type GetNotes = () => Promise<NoteInfo[]>
export type ReadNote = (title: NoteInfo['title']) => Promise<NoteContent>
export type WriteNote = (
  title: NoteInfo['title'],
  content: NoteContent,
  lastEditTime: number,
  createdAtTime: number
) => Promise<void>
export type CreateNote = () => Promise<NoteInfo['title'] | false>
export type DeleteNote = (title: NoteInfo['title'], confirmation?: boolean) => Promise<boolean>
export type SyncNotesWithCloud = () => Promise<boolean>
