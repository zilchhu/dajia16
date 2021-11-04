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

  addSss(body) {
    return instance.post('/probs/_sss/add', { ...body })
  }

  editSss(body) {
    return instance.post('/probs/_sss/edit', { ...body })
  }

  delSss(body) {
    return instance.post('/probs/_shs/del', { ...body })
  }
  
  addZps(body) {
    return instance.post('/probs/_zps/add', { ...body })
  }

  editZps(body) {
    return instance.post('/probs/_zps/edit', { ...body })
  }
}
