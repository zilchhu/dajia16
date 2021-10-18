import instance, { urls } from './base'

export default class Perf {
  constructor(date = 31) {
    this.date = date
  }

  single(djh = 1) {
    return instance.get(urls.perf.base(this.date), { params: { djh } })
  }

  single2(type = 2) {
    return instance.get(`/perf2?type=${type}`)
  }
}
