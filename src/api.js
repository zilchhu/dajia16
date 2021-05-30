import axios from 'axios'

const inst = axios.create({
  responseType: 'json',
  baseURL: 'http://192.168.3.3:9004/',
  timeout: 30 * 1000
})

inst.interceptors.response.use(
  res => {
    if (res.data.err) {
      return Promise.reject(res.data.err)
    } else {
      return res.data.data
    }
  },
  err => Promise.reject(err)
)

const urls = {
  table: 'table',
  tableByDate: 'tableByDate',
  tableByShop: 'tableByShop',
  plan: 'plan',
  plans: 'plans'
}

export async function getTableByDate(day_from_today = 1) {
  return inst.get(`${urls.tableByDate}/${day_from_today}`)
}

export async function getTableByShop(shopId) {
  return inst.get(`${urls.tableByShop}/${shopId}`)
}

export async function updateTableById(id, a) {
  return inst.post(urls.plan, { id, a })
}

export async function updateTableByShopIds(shopids, date, a) {
  return inst.post(urls.plans, { shopids, date, a })
}
//
export function getTable() {
  // mock
  return { err: null, data: [] }
}
