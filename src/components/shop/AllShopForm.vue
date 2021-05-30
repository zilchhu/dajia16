<template lang="pug">
div
  a-table(:columns="columns" :data-source="items" rowKey="q" :pagination="false" size="small" :showHeader="false")
    template(#name="{text, record}")
      a-input(:value="text" @change="e => handleChange(e.target.value, record.q, 'name')" size="small")
    template(#a="{text, record}")
      a-textarea(:value="text" @change="e => handleChange(e.target.value, record.q, 'a')" :autoSize="{minRows: 1}")
  .button-wrapper
    a-button(@click="save" size="small") save
</template>

<script>
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import Plan from '../../api/plan'

// function omit(obj, ks) {
//   let newKs = Object.keys(obj).filter(v => !ks.includes(v))
//   let newObj = newKs.reduce((res, k) => {
//     return { ...res, [k]: obj[k] }
//   }, {})
//   return newObj
// }

export default {
  name: 'all-shop-form',
  props: ['shop_metas'],
  data() {
    const columns = [
      {
        title: '问题',
        dataIndex: 'q',
        width: 80
      },
      {
        title: '姓名',
        dataIndex: 'name',
        width: 80,
        slots: { customRender: 'name' }
      },
      {
        title: '优化',
        dataIndex: 'a',
        width: 380,
        slots: { customRender: 'a' }
      }
    ]
    const as = ['低收入', '高推广', '高成本', '严重超跌'].map(q => ({
      q,
      name: '',
      a: '',
      operation: '',
      time: ''
    }))
    return {
      columns,
      items: as
    }
  },
  methods: {
    handleChange(value, key, column) {
      const newItems = [...this.items]
      const target = newItems.filter(item => key === item.q)[0]
      if (target) {
        target[column] = value
        this.items = newItems
      }
    },
    save() {
      let newItems = [...this.items]
      newItems = newItems.map(v => ({
        ...v,
        time: v.a.trim().length > 0 ? dayjs().format('YYYY/MM/DD HH:mm:ss') : '',
        operation: v.a.trim().length > 0 ? 'save_all' : ''
      }))
      let a = JSON.stringify(newItems)
      let ids = this.shop_metas.map(v => v.id)
      new Plan()
        .multi(ids, a)
        .then(res => {
          message.success(res)
          this.items = newItems
        })
        .catch(err => {
          message.error(err)
        })
    }
  }
}
</script>

<style lang="sass">
.ant-table-tbody > tr > td
  border: none

.button-wrapper
  display: flex
  justify-content: flex-end
  padding: 8px
</style>
