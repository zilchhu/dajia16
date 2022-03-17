import instance, { urls } from "./base"

export default class Probs {
  constructor() {}

  single(key) {
    return instance.get(urls.probs.base(key))
  }

  singleDate(key, date) {
    return instance.get(urls.probs.baseDate(key, date))
  }

  multiDates(key, beginDate, endDate) {
    return instance.get(urls.probs.baseDate2(key, beginDate, endDate))
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

  delAn(body) {
    return instance.post(urls.probs.delAn, { ...body })
  }

  addSss(body) {
    return instance.post("/probs/_shs/add", { ...body })
  }

  editSss(body) {
    return instance.post("/probs/_shs/edit", { ...body })
  }

  delSss(body) {
    return instance.post("/probs/_shs/del", { ...body })
  }

  addZps(body) {
    return instance.post("/probs/_zps/add", { ...body })
  }

  editZps(body) {
    return instance.post("/probs/_zps/edit", { ...body })
  }

  remarkZps(body) {
    return instance.post("/probs/_zps/remark", { ...body })
  }

  saveAs(body) {
    return instance.post("/saveProbAs", { ...body })
  }

  saveAt(body) {
    return instance.post("/saveProbAt", { ...body })
  }

  saveAu(body) {
    return instance.post("/saveProbAu", { ...body })
  }
}
