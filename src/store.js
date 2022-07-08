import { createStore } from "vuex"

export const userStore = createStore({
  state: {
    account: localStorage.getItem('account'),
    token: localStorage.getItem('token'),
    deviceId: sessionStorage.getItem('deviceId'),
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
    setDeviceId(state, deviceId) {
      if(deviceId == null) sessionStorage.removeItem("deviceId")
      else sessionStorage.setItem("deviceId", deviceId)
      state.deviceId = deviceId
    }
  },
})

export default userStore
