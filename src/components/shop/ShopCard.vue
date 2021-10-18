<template lang="pug">
a-list-item(:key="shop.id")
  a-list-item-meta
    template(#title)
      .title
        span.num {{title_num}}
        div
          a-button(size="small" type="link" @click="history_click") history
          a-button(size="small" type="link" @click="detail_click") detail
    template(#description)
      shop-form(:as="shop_as" :shop_meta="shop_meta")
      shop-data(v-if="shop_data_show" :shop_data="shop_data" :shop_meta="shop_meta")
      shop-history(v-if="shop_history_show" :shopid="shop_meta.shop_id")
</template>

<script>
import ShopForm from './ShopForm'
import ShopData from './ShopData'
import ShopHistory from '../shop/ShopHistory'
import dayjs from 'dayjs'

export default {
  name: 'shop-card',
  components: {
    ShopForm,
    ShopData,
    ShopHistory
  },
  props: {
    shop: Object
  },
  data() {
    return {
      shop_data_show: false,
      shop_history_show: false
    }
  },
  computed: {
    shop_meta() {
      return {
        id: this.shop.id,
        shop_id: this.shop.shop_id,
        shop_name: this.shop.shop_name,
        platform: this.shop.platform,
        date: dayjs(`${this.shop.date}`, 'YYYYMMDD').add(1, 'day').format('YYYYMMDD')
      }
    },
    shop_as() {
      if (this.shop.a.length == 0) {
        return this.shop.qs.map(q => ({
          a: '',
          name: this.shop.person,
          operation: 'save',
          q: q.type,
          time: '',
          time_parsed: '',
          value: q.value,
          threshold: q.threshold
        })).concat([
          {
            a: '',
            name: this.shop.person,
            operation: 'save',
            q: '自定义',
            time: '',
            time_parsed: '',
            value: null,
            threshold: null
          },
          {
            a: '',
            name: this.shop.person,
            operation: 'save',
            q: '发现问题',
            time: '',
            time_parsed: '',
            value: null,
            threshold: null
          },
          {
            a: '',
            name: this.shop.person,
            operation: 'save',
            q: '解决问题',
            time: '',
            time_parsed: '',
            value: null,
            threshold: null
          },
          {
            a: '',
            name: this.shop.person,
            operation: 'save',
            q: '举一反三',
            time: '',
            time_parsed: '',
            value: null,
            threshold: null
          }
        ])
      } else {
        return this.shop.a.map(a => ({
          ...a,
          value: this.shop.qs.find(q => q.type == a.q)?.value,
          threshold: this.shop.qs.find(q => q.type == a.q)?.threshold
        }))
      }
    },
    title_num() {
      return `#${this.shop.index + 1}`
    },
    shop_data() {
      return {
        third_send: this.shop.third_send,
        orders: this.shop.orders,
        income: this.shop.income,
        income_avg: this.shop.income_avg,
        income_sum: this.shop.income_sum,
        cost: this.shop.cost,
        cost_avg: this.shop.cost_avg,
        cost_sum: this.shop.cost_sum,
        cost_ratio: this.shop.cost_ratio,
        cost_sum_ratio: this.shop.cost_sum_ratio,
        consume: this.shop.consume,
        consume_avg: this.shop.consume_avg,
        consume_sum: this.shop.consume_sum,
        consume_ratio: this.shop.consume_ratio,
        consume_sum_ratio: this.shop.consume_sum_ratio,
        settlea_30: this.shop.settlea_30,
        settlea_1: this.shop.settlea_1,
        settlea_7: this.shop.settlea_7,
        settlea_7_3: this.shop.settlea_7_3,
        income_score: this.shop.income_score,
        consume_score: this.shop.consume_score,
        cost_score: this.shop.cost_score,
        score: this.shop.score,
        date: this.shop.date
      }
    }
  },
  methods: {
    detail_click() {
      this.shop_data_show = !this.shop_data_show
    },
    history_click() {
      this.shop_history_show = !this.shop_history_show
    }
  }
}
</script>

<style lang="sass" scoped>
.ant-list-split, .ant-list-item
  border: none

.ant-list-item
  padding: 12px

.title
  display: flex
  justify-content: space-between
  align-items: center

.ant-btn-link
  font-size: 9px
  color: rgba(0, 0, 0, 0.38)

.num
  font-size: 10px
  color: rgba(0, 0, 0, 0.38)
</style>
