import instance, { urls } from './base'

export default class Plan {
  constructor(shopid) {
    this.shopid = shopid
  }

  multi(ids, a) {
    let data = {
      ids,
      a
    }
    return instance.post(urls.plan.multi, data)
  }
}
