import instance, { urls } from './base'

export default class FreshShop {
  single() {
    return instance.get(urls.fresh_shop.base)
  }

  saveA(wmPoiId, a2, updated_at) {
    return instance.post(urls.fresh_shop.saveA, {
      wmPoiId,
      a2,
      updated_at
    })
  }

  getAs() {
    return instance.get(urls.fresh_shop.as)
  }
}
