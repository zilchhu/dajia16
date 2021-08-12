import instance, { urls } from './base'

export default class Probs {
  constructor() { }

  single(key) {
    return instance.get(urls.probs.base(key))
  }

  save(type, key, handle) {
    return instance.post(urls.probs.save(), { type, key, handle })
  }

  addAn(body) {
    return instance.post(urls.probs.addAn, { ...body })
  }

  editAn(body) {
    return instance.post(urls.probs.editAn, { ...body })
  }
}
