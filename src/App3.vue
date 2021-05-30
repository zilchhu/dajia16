<template lang="pug">
div
  a-menu(v-model:selectedKeys="menu_keys" theme="light" mode="horizontal")
    a-sub-menu
      template(#title)
        span aggre
      a-menu-item(key="sum:3")
        router-link(:to="{ name: 'sum', params: { day: 7 }}") 营推(天)
      a-menu-item(key="sum2")
        router-link(:to="{ name: 'sum2' }") 营推(月)
      a-menu-item(key="fresh-shop")
        router-link(:to="{ name: 'fresh-shop' }") 新店
      a-menu-item(key="perf:31")
        router-link(:to="{ name: 'perf', params: { day: 31 }}") 绩效

    a-menu-item(key="date")
      a-date-picker(v-model:value="selected_date" @change="date_change" :disabledDate="disabledDate" :allowClear="false" size="small")

    a-sub-menu
      template(#title)
        span check
      a-menu-item(key="problems")
        router-link(:to="{name: 'probs'}") 问题
      a-menu-item(key="changes")
        router-link(:to="{name: 'changes'}") 变化

    a-sub-menu
      template(#title)
        span users
      a-menu-item(v-for="name in all_names" :key="name")
        router-link(:to="{ name: 'user', params: { username: name || '-', date: $route.params.date || 0 }}") {{name}}

    a-menu-item(key="tools")
      router-link(:to="{ name: 'tools'}") tools

    a-sub-menu
      template(#title)
        span 新人培训
      a-menu-item(v-for="name in 新人培训" :key="name")
        a(:href="`http://192.168.3.3:8080/${name}.html`" target="_blank") {{name}}

    a-menu-item(key="notes")
      router-link(:to="{ name: 'note'}") notes

  router-view(v-slot="{ Component }")
    transition
      keep-alive
        component(:is="Component")
</template>

<script>
import User from './api/user'
import dayjs from 'dayjs'
import moment from 'moment'

export default {
  data() {
    return {
      menu_keys: [],
      all_names: [],
      新人培训: ['订单缺陷率', '评价管理', '刷单操作手册', '新店工作安排', '新员工培训流程', '运营工作优化', '运营思维'],
      selected_date: moment().subtract(1, 'days')
    }
  },
  methods: {
    fetch_all_names() {
      new User('')
        .all_names()
        .then(res => {
          this.all_names = res
        })
        .catch(err => console.error(err))
    },
    date_change(date, date_str) {
      let date1 = dayjs()
        .startOf('day')
        .diff(dayjs(date_str).startOf('day'), 'day')
      this.$router.replace({ name: 'date', params: { day: date1 } })
    },
    disabledDate(currentDate) {
      return currentDate.isAfter(moment().subtract(1, 'days'))
    }
  },
  mounted() {
    this.fetch_all_names()
  }
}
</script>

<style lang="sass">
::-webkit-scrollbar
  display: block
  width: 10px
  height: 10px
  background: rgba(241,241,241,.7)
  overflow: auto

::-webkit-scrollbar-thumb
  background: rgba(168,168,168,.6)

.ant-table-pagination.ant-pagination
  margin: 6px 0 !important


.ant-menu-horizontal 
  line-height: 36px !important
  border: none !important

.ant-comment-inner
  padding: 0 !important

.note-main .ant-list-item-meta-title
  margin: 0 !important

.note-main .ant-list-vertical .ant-list-item-meta
  margin-bottom: 0 !important
</style>
