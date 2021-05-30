import instance2, { urls } from './base2'

export default class Tests {
  constructor(wmPoiId) {
    this.wmPoiId = wmPoiId
  }

  sync() {
    return instance2.post(urls.tests.sync, { wmPoiId: this.wmPoiId })
  }

  del() {
    return instance2.post(urls.tests.del, { wmPoiId: this.wmPoiId })
  }
}
