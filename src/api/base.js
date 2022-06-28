import axios from "axios"

export const HOST = 'http://192.168.3.3:43251'

const instance = axios.create({
  baseURL: `${HOST}/api/gd`,
  responseType: "json",
  timeout: 120 * 1000,
})

export default async function baseFetch(req) {
  const { data } = await instance(req)
  if (data.code != 0) throw new Error(data.message)
  return data.data
}
