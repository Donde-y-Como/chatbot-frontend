export interface LoginData {
  email: string
  password: string
}

export interface UserData {
  id: string
  logo: string
  name: string
  plan: {
    name: string
  }
}
