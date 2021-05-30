import axios from 'axios'
import urls_ from './urls'

const instance2 = axios.create({
  baseURL: 'http://192.168.3.3:9010',
  responseType: 'json',
  timeout: 300 * 1000
})

instance2.interceptors.response.use(
  res => {
    if (res.data.e) {
      return Promise.reject(res.data.e)
    } else {
      return res.data.res
    }
  },
  e => Promise.reject(e)
)

export default instance2
export const urls = urls_
