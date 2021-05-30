import axios from 'axios'
import urls_ from './urls'

const instance = axios.create({
  baseURL: 'http://192.168.3.3:9005',
  responseType: 'json',
  timeout: 30 * 1000
})

instance.interceptors.response.use(
  res => {
    if (res.data.e) {
      return Promise.reject(res.data.e)
    } else {
      return res.data.res
    }
  },
  e => Promise.reject(e)
)

export default instance
export const urls = urls_
