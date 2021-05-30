<template lang="pug">
a-table(:columns="columns" :data-source="items_show" rowKey="q" :pagination="false" size="small" :showHeader="false")
  template(#name="{text, record}")
    a-input(:value="text" @change="e => handleChange(e.target.value, record, 'name')" size="small")
  template(#a="{text, record}")
    a-textarea(:value="text" @change="e => handleChange(e.target.value, record, 'a')" :autoSize="{minRows: 1}")
  template(#time="{text, record}")
    a-spin(:spinning="saving" size="small") 
      span {{text}}  
</template>

<script>
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { updateTableById } from '../../api'

function omit(obj, ks) {
  let newKs = Object.keys(obj).filter(v => !ks.includes(v))
  let newObj = newKs.reduce((res, k) => {
    return { ...res, [k]: obj[k] }
  }, {})
  return newObj
}

export default {
  name: 'shop-form-simple',
  props: {
    // id: Number,
    as: Array,
    shop_meta: Object
  },
  data() {
    const columns = [
      {
        title: '问题',
        dataIndex: 'q',
        width: 100
      },
      {
        title: '姓名',
        dataIndex: 'name',
        width: 100,
        slots: { customRender: 'name' }
      },
      {
        title: '优化',
        dataIndex: 'a',
        width: 500,
        slots: { customRender: 'a' }
      },
      {
        title: '时间',
        dataIndex: 'time',
        slots: { customRender: 'time' },
        width: 180
      }
    ]
    return {
      columns,
      tags: this.as
        .map(a => ({ ...a, checked: true, saved: a.a.trim().length > 0 }))
        .map(a => ({ ...a, tag_color: a.saved ? '#91d5ff99' : '#fefefe' })),
      debounce_save: null,
      saving: false
    }
  },
  computed: {
    items_show() {
      return this.tags.filter(v => v.checked)
    },
    card_title() {
      return `${this.shop_meta.shop_name}  ${this.shop_meta.platform}`
    }
  },
  methods: {
    handleChange(value, record, column) {
      const newTags = [...this.tags]
      const target = newTags.filter(item => record.q === item.q)[0]
      if (target) {
        target[column] = value
        this.tags = newTags
        this.debounce_save(record)
      }
    },
    save(record) {
      const newItems = [...this.tags]
      const target = newItems.filter(item => record.q === item.q)[0]
      if (target) {
        this.saving = true
        target['time'] = dayjs().format('YYYY/MM/DD HH:mm:ss')
        let a = JSON.stringify(
          newItems.map(v => omit(v, ['checked', 'time_parsed', 'saved', 'tag_color', 'value', 'threshold']))
        )
        updateTableById(this.shop_meta.id, a)
          .then(res => {
            message.success(res)
            this.tags = newItems
            this.saving = false
          })
          .catch(err => {
            message.error(err)
            this.saving = false
          })
        console.log(a)
      }
    },
    debounce(fn) {
      let timeout = null
      return function() {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 600)
      }
    }
  },
  created() {
    this.debounce_save = this.debounce(this.save)
  }
}
</script>

<style lang="sass">
.title
  display: flex
  align-items: center
  justify-content: space-between

.title_shopname, .title_platform
  font-size: 13px
  color: rgba(0, 0, 0, 0.65)
  margin-right: 20px

.title_platform
  font-size: 12px

.ant-tag-checkable-checked
  color: #f5222d
  background: #fff1f0
  border-color: #ffa39e

.ant-tag-checkable:hover
  color: #f5222d

.ant-card-body
  padding: 0 !important

.ant-card-bordered
  border-color: #91d5ff40

.ant-table-tbody > tr > td
  border: none
</style>
