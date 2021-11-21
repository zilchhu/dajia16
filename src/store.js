import { createStore } from "vuex"
import { getTable } from "./api"
import dayjs from "dayjs"

const store = createStore({
  state() {
    return {
      table: null,
      user_active_key: "1",
    }
  },
  getters: {
    table1({ table }) {
      return formatTable(table)
    },
    table1Persons({ table }) {
      if (!table || table.err || !table.data) return []
      let distinctPersons = Array.from(new Set(table.data.map(v => v.person)))
      return distinctPersons.map(value => ({ value }))
    },
  },
  mutations: {
    initTable(state, payload) {
      state.table = payload
    },
    updateTable(state, payload) {
      const index = state.table.data.findIndex(v => v.id == payload.id)
      state.table.data[index].op_id = payload.op_id[0]
      state.table.data[index].op_name = payload.op_name
      state.table.data[index].q = payload.q
      state.table.data[index].a = payload.a
    },
    saveUserActiveKey(state, payload) {
      state.user_active_key = payload
    },
  },
  actions: {
    async initTable({ commit }) {
      const getTableRes = await getTable()
      commit("initTable", getTableRes)
    },
  },
})

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

function percent(num) {
  if (typeof num === "string") num = parseFloat(num)
  return `${(num * 100).toFixed(2)}%`
}

function fixed2(num) {
  if (typeof num === "string") num = parseFloat(num)
  return num.toFixed(2)
}

function empty(str) {
  if (str == null) return ""
  else return str
}

export function formatTable(table) {
  if (!table || table.err) return table
  return {
    ...table,
    data: table.data.map(v => ({
      ...v,
      city: empty(v.city),
      person: empty(v.person),
      real_shop: empty(v.real_shop),
      shop_id: empty(v.shop_id),
      shop_name: empty(v.shop_name),
      platform: empty(v.platform),
      income: fixed2(v.income),
      income_avg: fixed2(v.income_avg),
      income_sum: fixed2(v.income_sum),
      cost: fixed2(v.cost),
      cost_avg: fixed2(v.cost_avg),
      cost_sum: fixed2(v.cost_sum),
      cost_ratio: percent(v.cost_ratio),
      cost_sum_ratio: percent(v.cost_sum_ratio),
      consume: fixed2(v.consume),
      consume_avg: fixed2(v.consume_avg),
      consume_sum: fixed2(v.consume_sum),
      consume_ratio: percent(v.consume_ratio),
      consume_sum_ratio: percent(v.consume_sum_ratio),
      settlea_30: percent(v.settlea_30),
      settlea_1: percent(v.settlea_1),
      settlea_7: percent(v.settlea_7),
      settlea_7_3: percent(v.settlea_7_3),
      income_score: fixed2(v.income_score),
      cost_score: fixed2(v.cost_score),
      consume_score: fixed2(v.consume_score),
      score: fixed2(v.score),
    })),
  }
}

export function formatTable2(table) {
  if (!table || table.err) return table
  return {
    ...table,
    data: table.data.map(v => ({
      ...v,
      created_at: dayjs(v.created_at).format("YYYY/MM/DD HH:mm:ss"),
    })),
  }
}

export default userStore
