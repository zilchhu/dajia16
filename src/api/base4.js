import axios from "axios"

const instance = axios.create({
  method: 'POST',
  baseURL: "http://192.168.3.3:9008/query",
  responseType: "json",
  timeout: 300 * 1000,
})

instance.interceptors.response.use(
  res => {
    if (res.data.err) {
      return Promise.reject(typeof res.data.err == "object" ? JSON.stringify(res.data.err) : res.data.err)
    } else {
      return res.data
    }
  },
  e => Promise.reject(e)
)

export default instance
