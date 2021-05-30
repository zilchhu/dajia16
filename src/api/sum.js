import instance, { urls } from './base'

export default class Sum {
  constructor(date = 1) {
    this.date = date
  }

  single() {
    return instance.get(urls.sum.base(this.date))
  }

  sum2() {
    return instance.get(urls.sum.sum2)
  }
}
