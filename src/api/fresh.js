import instance2, { urls } from './base2'

export default class Fresh {
  constructor(userTasks, userRule) {
    this.userTasks = userTasks
    this.userRule = userRule
  }

  mt() {
    return instance2.post(urls.fresh.mt, { userTasks: this.userTasks, userRule: this.userRule })
  }

  elm() {
    return instance2.post(urls.fresh.elm, { userTasks: this.userTasks, userRule: this.userRule }) 
  }
}
