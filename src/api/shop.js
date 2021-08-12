import instance, { urls } from './base'

export default class Shop {
  constructor(shopid) {
    this.shopid = shopid
  }

  single() {
    return instance.get(urls.shop.base(this.shopid))
  }

  single_history(oneday) {
    return instance.get(urls.shop.history(this.shopid), { params: { oneday } })
  }

  shops(platform) {
    return instance.get(urls.shop.shops(platform))
  }

  real() {
    return instance.get(urls.shop.real)
  }

  real2() {
    return instance.get(urls.shop.real2)
  }

  addNewShop(data) {
    return instance.post(urls.shop.addNewShop, data)
  }

  addFengniao(data) {
    return instance.post(urls.shop.addFengniao, data)
  }

  delFengniao(data) {
    return instance.post(urls.shop.delFengniao, data)
  }

  fengniao() {
    return instance.get(urls.shop.fengniao)
  }

  addDada(data) {
    return instance.post(urls.shop.addDada, data)
  }

  delDada(data) {
    return instance.post(urls.shop.delDada, data)
  }

  dada() {
    return instance.get(urls.shop.dada)
  }

  addShunfeng(data) {
    return instance.post(urls.shop.addShunfeng, data)
  }

  delShunfeng(data) {
    return instance.post(urls.shop.delShunfeng, data)
  }

  shunfeng() {
    return instance.get(urls.shop.shunfeng)
  }

  addMyt(data) {
    return instance.post(urls.shop.addMyt, data)
  }

  delMyt(data) {
    return instance.post(urls.shop.delMyt, data)
  }

  myt() {
    return instance.get(urls.shop.myt)
  }

  prob(type, platform, date) {
    return instance.get(urls.shop.prob.base(type, platform, this.shopid, date))
  }

  order(platform, activi, counts, date) {
    return instance.get(urls.shop.order.base(this.shopid, platform, date), { params: { activi, counts } })
  }

  indices(platform, day = 7) {
    return instance.get(urls.shop.indices.base(platform, this.shopid, day))
  }

  offsell(platform, day) {
    return instance.get(urls.shop.offsell.base(platform, this.shopid, day))
  }

  auths() {
    return instance.get(urls.shop.auths)
  }
}
