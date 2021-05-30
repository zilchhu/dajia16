import instance, { urls } from './base'

export default class WhiteList {
  constructor() {}

  mtSmartAds() {
    return instance.get(urls.whitelist.mtSmartAds)
  }

  mtCpcAds() {
    return instance.get(urls.whitelist.mtCpcAds)
  }

  elmSmartAds() {
    return instance.get(urls.whitelist.elmSmartAds)
  }

  saveMtSmartAds(data) {
    return instance.post(urls.whitelist.mtSmartAds, data)
  }

  saveMtCpcAds(data) {
    return instance.post(urls.whitelist.mtCpcAds, data)
  }

  saveElmSmartAds(data) {
    return instance.post(urls.whitelist.elmSmartAds, data)
  }

  delMtSmartAds(data) {
    return instance.delete(urls.whitelist.mtSmartAds, { params: data })
  }

  delMtCpcAds(data) {
    return instance.delete(urls.whitelist.mtCpcAds, { params: data })
  }

  delElmSmartAds(data) {
    return instance.delete(urls.whitelist.elmSmartAds, { params: data })
  }
}
