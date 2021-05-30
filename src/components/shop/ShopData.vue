<template lang="pug">
div
  a-card(size="small")
    a-card-grid(style="width: 115px; padding: 0 7px;" v-for="key in Object.keys(shop_data)" :key="key")
      a-dropdown(:trigger="['contextmenu']")
        a-statistic(:title="en2zh.get(key)" :value="shop_data[key]" valueStyle="font-size: 1em;" @click="() => statisticClick(key)")
          template(#formatter="{value}")
            p.truncate {{emptyVal(value)}}
        template(#overlay)
          a-menu
            a-menu-item(key="1" @click="e => click(key)") item1
  a-modal(v-model:visible="probClickModal" :footer="null" centered :width="1080")
    shop-problem(:shop_meta="{shopId: shop_meta.shop_id, platform: shop_meta.platform == '美团' ? 'mt' : 'elm', date: shop_meta.date}")

</template>

<script>
import ShopProblem from './ShopProblem'

export default {
  name: 'shop-data',
  components: {
    ShopProblem
  },
  props: {
    shop_data: Object,
    shop_meta: Object
  },
  data() {
    return {
      probClickModal: false
    }
  },
  computed: {
    en2zh() {
      const map = new Map()
      map.set('id', 'id')
      map.set('city', '城市')
      map.set('person', '负责')
      map.set('real_shop', '物理店')
      map.set('shop_id', '门店id')
      map.set('shop_name', '店名')
      map.set('platform', '平台')
      map.set('rating', '评分')
      map.set('rating_last', '上次评分')
      map.set('third_send', '三方配送')
      map.set('unit_price', '单价')
      map.set('orders', '订单')
      map.set('income', '收入')
      map.set('income_avg', '平均收入')
      map.set('income_sum', '总收入')
      map.set('cost', '成本')
      map.set('cost_avg', '平均成本')
      map.set('cost_sum', '总成本')
      map.set('cost_ratio', '成本比例')
      map.set('cost_sum_ratio', '总成本比例')
      map.set('consume', '推广')
      map.set('consume_avg', '平均推广')
      map.set('consume_sum', '总推广')
      map.set('consume_ratio', '推广比例')
      map.set('consume_sum_ratio', '总推广比例')
      map.set('settlea_30', '比30日')
      map.set('settlea_1', '比昨日')
      map.set('settlea_7', '比上周')
      map.set('settlea_7_3', '比上周(3日)')
      map.set('income_score', '收入分')
      map.set('consume_score', '推广分')
      map.set('cost_score', '成本分')
      map.set('score', '总分')
      map.set('date', '日期')
      return map
    }
  },
  methods: {
    emptyVal(val) {
      return val == null || val == undefined ? '-' : val
    },
    click(key) {
      console.log(key)
    },
    statisticClick(key) {
      if (key == 'cost_ratio') this.probClickModal = true
    }
  }
}
</script>

<style lang="sass" scoped>
.truncate
  width: 110px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
</style>
