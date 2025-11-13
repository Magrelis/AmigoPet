import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: LocalStorage.getItem('@amigopet-user') || null,
    token: LocalStorage.getItem('@amigopet-token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    firstLetter: (state) => state.user?.name?.charAt(0)?.toUpperCase() || '',
  },
  actions: {
    setUser(user) {
      this.user = user
      if (user) LocalStorage.set('@amigopet-user', user)
      else LocalStorage.remove('@amigopet-user')
    },
    setToken(token) {
      this.token = token
      if (token) LocalStorage.set('@amigopet-token', token)
      else LocalStorage.remove('@amigopet-token')
    },
    setAuth({ user, token }) {
      this.setUser(user)
      this.setToken(token)
    },
    logout() {
      this.setAuth({ user: null, token: null })
    },
  },
})
