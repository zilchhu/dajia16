import { createStore } from "vuex"

export const userStore = createStore({
  state: {
    account: null,
    token: null,
  },
  mutations: {
    setAccount(state, account) {
      if (account == null) localStorage.removeItem("account")
      else localStorage.setItem("account", account)
      state.account = account
    },
    setToken(state, token) {
      if (token == null) localStorage.removeItem("token")
      else localStorage.setItem("token", token)
      state.token = token
    },
  },
})

export default userStore
