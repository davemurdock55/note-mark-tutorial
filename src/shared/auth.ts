export interface UserCredentials {
  username: string
  token: string
  isLoggedIn: boolean
}

export const defaultUserState: UserCredentials = {
  username: '',
  token: '',
  isLoggedIn: false
}
