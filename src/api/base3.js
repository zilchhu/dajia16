import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://192.168.3.3:9007',
  responseType: 'json',
  timeout: 300 * 1000
})

instance.interceptors.response.use(
  res => {
    if (res.data.error) {
      return Promise.reject(JSON.stringify(res.data.error))
    } else {
      return res.data
    }
  },
  e => Promise.reject(e)
)

export default instance
