<template lang="pug">
a-list-item(:key="activity.time")
  a-list-item-meta
    template(#title)
      p.title {{title}}
      .title-meta
        div
          i.num {{title_num}}
        div
          a-button(size="small" type="link" @click="history_click") 历史数据
          a-button(size="small" type="link" @click="detail_click") 详情
    template(#description)
      shop-form(:as="shop_as" :shop_meta="shop_meta")
      shop-data(v-if="shop_data_show" :shop_data="shop_data" :shop_meta="shop_meta")
      shop-history(v-if="shop_history_show" :shopid="shop_meta.shop_id")
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import updateLocale from 'dayjs/plugin/updateLocale'

import 'dayjs/locale/zh-cn'

dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(updateLocale)

dayjs.locale('zh-cn')

dayjs.updateLocale('zh-cn', {
  weekdays: ['周日', '一', '二', '三', '四', '五', '六']
})

import ShopForm from '../shop/ShopForm'
import ShopData from '../shop/ShopData'
import ShopHistory from '../shop/ShopHistory'

export default {
  name: 'activity-card-simple',
  components: {
    ShopForm,
    ShopData,
    ShopHistory
  },
  props: {
    activity: Object
  },
  data() {
    return {
      shop_data_show: false,
      shop_history_show: false,
      last_shop_route: { path: null },
      last_user_route: { path: null }
    }
  },
  computed: {
    title() {
      return ''
    },
    shop_meta() {
      return {
        id: this.activity.id,
        shop_id: this.activity.shop_id,
        shop_name: this.activity.shop_name,
        platform: this.activity.platform,
        date: dayjs(`${this.activity.date}`, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD')
      }
    },
    title_num() {
      return `*待优化*`
    },
    title_name() {
      return this.activity.person
    },
    shop_data() {
      return {
        third_send: this.activity.third_send,
        orders: this.activity.orders,
        income: this.activity.income,
        income_avg: this.activity.income_avg,
        income_sum: this.activity.income_sum,
        cost: this.activity.cost,
        cost_avg: this.activity.cost_avg,
        cost_sum: this.activity.cost_sum,
        cost_ratio: this.activity.cost_ratio,
        cost_sum_ratio: this.activity.cost_sum_ratio,
        consume: this.activity.consume,
        consume_avg: this.activity.consume_avg,
        consume_sum: this.activity.consume_sum,
        consume_ratio: this.activity.consume_ratio,
        consume_sum_ratio: this.activity.consume_sum_ratio,
        settlea_30: this.activity.settlea_30,
        settlea_1: this.activity.settlea_1,
        settlea_7: this.activity.settlea_7,
        settlea_7_3: this.activity.settlea_7_3,
        income_score: this.activity.income_score,
        consume_score: this.activity.consume_score,
        cost_score: this.activity.cost_score,
        score: this.activity.score,
        date: this.activity.date
      }
    },
    shop_as() {
      return this.activity.qs.map(q => ({
        ...q,
        q: q.type,
        name: this.activity.person,
        a: '',
        operation: 'save',
        time: '',
        time_parsed: ''
      }))
    }
  },
  methods: {
    detail_click() {
      this.shop_data_show = !this.shop_data_show
    },
    history_click() {
      this.shop_history_show = !this.shop_history_show
    }
  },
  watch: {
   activity(route) {
      if (route.name == 'shop' && route.path != this.last_shop_route.path) {
        this.shop_data_show = false
        this.shop_history_show = false
        this.last_shop_route = route
      } else if (route.name == 'user' && route.path != this.last_user_route.path) {
        this.shop_data_show = false
        this.shop_history_show = false
        this.last_user_route = route
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.title
  font-size: 1.1em
  font-weight: bold
  margin: 0
  white-space: pre-wrap

.title-meta
  display: flex
  justify-content: space-between
  align-items: center

.ant-btn-link
  font-size: 9px
  color: #1890ddcc

.name:hover, .time-href:hover
  color: #40a9ff

.num, .name, .time, .type
  font-size: 10px
  color: rgba(0, 0, 0, 0.38)
  margin: 4px 16px 10px 0

.ant-list-split, .ant-list-item
  border: none

.ant-list-item
  padding: 12px
</style>
