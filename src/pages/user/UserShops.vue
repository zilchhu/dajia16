<template lang="pug">
a-list(:dataSource="shops" :split="false")
  template(#header)
    p.header {{header}}
  template(#renderItem="{item, index}")
    shop-card(:shop="{...item, index}")
</template>

<script>
import ShopCard from '../../components/shop/ShopCard'
export default {
  name: 'user-shops',
  components: {
    ShopCard
  },
  props: {
    shops: Array,
    type: String,
    counts: Object
  },
  computed: {
    header() {
      if (this.type == 'responsibles')
        return `优化了${this.counts.count_a}个问题，${this.counts.count_shop_a}家门店；待优化${this.counts.count_q -
          this.counts.count_a}个问题，${this.counts.count_shop - this.counts.count_shop_a}家门店`
      if (this.type == 'success') return `${this.counts.count_shop}家门店合格`
      if (this.type == 'unimproved') return `待优化${this.counts.count_q}个问题，${this.counts.count_shop}家门店`
      if (this.type == 'improved') return `优化了${this.counts.count_a}个问题，${this.counts.count_shop_a}家门店`
      if (this.type == 'improving')
        return `优化了${this.counts.count_a}个问题，${this.counts.count_shop_a}家门店；待优化${this.counts.count_q -
          this.counts.count_a}个问题，${this.counts.count_shop - this.counts.count_shop_a}家门店`
      return ""
    }
  }
}
</script>

<style lang="sass" scoped>
.header
  font-size: 13px
  padding: 0 12px
</style>