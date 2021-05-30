import instance, { urls } from './base'

export default class Change {
  constructor() {}

  single() {
    return instance.get(urls.change.base())
  }

  save(key, handle) {
    return instance.post(urls.change.save(), { key, handle })
  }
}
