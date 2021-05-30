<template lang="pug">
.shop
  .header
    span.platform {{platform}}
    span.shopid {{shopid}}
    span.shop-name {{shop_name}}
  .content(style="width: 960px;")
    a-spin(:spinning="spinning")
      //- .title-meta(v-if="history_one.a.length == 0 && history_one.qs.length > 0")
      //-   div
      //-     span.txt today
      //-   div
      //-     a-button(size="small" type="link" @click="history_click") history
      //-     a-button(size="small" type="link" @click="detail_click") detail
      //- div(v-if="history_one.a.length == 0 && history_one.qs.length > 0")
      //-   shop-form-simple(:as="shop_as" :shop_meta="shop_meta")
      //-   shop-data(v-if="shop_data_show" :shop_data="shop_data")
      //-   shop-history(v-if="shop_history_show" :shopid="shop_meta.shop_id")
      activity-card-simple(v-if="history_one.qs.length > 0 && history_one.a.length == 0" :activity="history_one")
      user-activities(:activities="shops")
  a-back-top
</template>

<script>
import { message } from 'ant-design-vue'
import Shop from '../../api/shop'
import UserActivities from '../user/UserActivities'
import ActivityCardSimple from '../../components/user/ActivityCardSimple'

export default {
  name: 'shop',
  components: {
    UserActivities,
    ActivityCardSimple
  },
  data() {
    return {
      spinning: false,
      shops: [],
      history_one: {
        a: [],
        qs: []
      }
    }
  },
  computed: {
    shop_name() {
      return this.shops.length > 0 ? this.shops[0].shop_name : ''
    },
    platform() {
      return this.shops.length > 0 ? this.shops[0].platform : ''
    },
    shopid() {
      return this.$route.params.shopid
    }
  },
  methods: {
    fetch_shop_single() {
      this.spinning = true
      new Shop(this.shopid)
        .single()
        .then(res => {
          this.shops = res
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    },
    fetch_shop_history_one() {
      this.spinning = true
      new Shop(this.shopid)
        .single_history(true)
        .then(res => {
          this.history_one = res
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    },
    init() {
      this.fetch_shop_history_one()
      this.fetch_shop_single()
    }
  },
  created() {
    this.init()
  },
  watch: {
    $route(route) {
      if (route.name == 'shop') this.init()
    }
  }
}
</script>

<style lang="sass" scoped>
.shop
  display: flex
  width: 100%
  min-height: 100vh
  flex-direction: column
  align-items: center
  background: #fbfbfb

.header
  display: flex
  max-width: 960px
  width: 100%
  height: 60px
  padding: 12px
  justify-content: flex-start
  align-items: center
  font-size: 1.1em

.platform, .shopid
  padding-right: 20px

.title-meta
  display: flex
  justify-content: space-between
  align-items: center

.ant-btn-link
  font-size: 9px
  color: rgba(0, 0, 0, 0.38)

.txt
  padding: 0 8px
  font-size: 10px
  color: rgba(0, 0, 0, 0.38)
</style>
