import instance, { urls } from './base'

export default class Perf {
  constructor(date = 31) {
    this.date = date
  }

  single(djh = 1) {
    return instance.get(urls.perf.base(this.date), { params: { djh } })
  }
}
