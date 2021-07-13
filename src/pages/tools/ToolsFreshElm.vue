<template lang="pug">
.fresh-elm
  .header
    span.title new-shop-setting:elm
  .form
    a-input(v-model:value="shopId" placeholder="门店ID" size="small" style="width: 160px; flex: 1 1 auto;")
    a-input(v-model:value="sourceShopId" placeholder="折扣商品源门店ID" size="small" style="width: 160px; flex: 1 1 auto;")

    a-radio-group(name="shop_type" v-model:value="shop_type" size="small")
      a-radio(value="甜品") 甜品
      a-radio(value="贡茶") 贡茶
    a-radio-group(name="shop_reduc_type" v-model:value="shop_reduc_type" size="small")
      a-radio(value="甜品") 甜品
      a-radio(value="甜品择优") 甜品择优
      a-radio(value="贡茶") 贡茶
      a-radio(value="贡茶择优") 贡茶择优
      a-radio(value="原价扣点") 原价扣点
    a-radio-group(name="shop_brand_type" v-model:value="shop_brand_type" size="small")
      a-radio(value="苏姐牛奶") 苏姐牛奶
      a-radio(value="喜三德") 喜三德
      a-radio(value="芋上") 芋上
      a-radio(value="贡茶") 贡茶
    a-popconfirm(
      title="警告！这是新店设置操作，请确认后执行。"
      ok-text="确定"
      cancel-text="取消"
      @confirm="run")
      a-button(:loading="loading" size="small") run
  a-list(:dataSource="tasks" :split="false" :loading="loading" :grid="{ gutter: 6, column: 2 }")
    template(#renderItem="{item, index}")
      a-list-item(:key="item.key")
        a-list-item-meta
          template(#title)
            a-checkbox(v-model:checked="item.checked") {{item.name}}
          template(#description)
            .txt {{item.res}}
</template>

<script>
import Fresh from '../../api/fresh'
import { message } from 'ant-design-vue'


export default {
  name: 'tools-fresh-elm',
  data() {
    return {
      shopId: '2065322800',
      sourceShopId: '',
      shop_type: '甜品',
      shop_reduc_type: '甜品',
      shop_brand_type: '苏姐牛奶',
      tasks: [
        { key: 1, name: '吃货红包', checked: true, res: null },
        { key: 2, name: '店铺满赠', checked: true, res: null },
        { key: 3, name: '超级吃货红包', checked: true, res: null },
        { key: 4, name: '下单返红包', checked: true, res: null },
        { key: 5, name: '集点返红包', checked: true, res: null },
        { key: 6, name: '顾客下单', checked: true, res: null },
        { key: 7, name: '自动回复', checked: true, res: null },
        { key: 8, name: '满减活动', checked: true, res: null },
        { key: 9, name: '极速退款', checked: true, res: null },
        { key: 10, name: '店铺招牌', checked: true, res: null },
        { key: 11, name: '店内海报', checked: true, res: null },
        { key: 12, name: '爆款橱窗', checked: true, res: null },
        { key: 13, name: '特色分类', checked: true, res: null },
        { key: 14, name: '品牌故事', checked: true, res: null },
        { key: 15, name: '营业时间', checked: true, res: null },
        { key: 16, name: '店铺公告', checked: true, res: null },
        { key: 17, name: '到店自取', checked: true, res: null },
        { key: 18, name: '减配送费', checked: true, res: null },
        { key: 19, name: '折扣商品', checked: true, res: null },
        { key: 20, name: '超值换购', checked: true, res: null }
      ],
      loading: false
    }
  },
  methods: {
    run() {
      this.loading = true
      let userTasks = this.tasks.filter(v => v.checked).map(v => ({ name: v.name }))
      let userRule = { shopId: this.shopId, shopType: this.shop_type, shopReducType: this.shop_reduc_type, shopBrandType: this.shop_brand_type, sourceShopId: this.sourceShopId }
      new Fresh(userTasks, userRule)
        .elm()
        .then(result => {
          this.tasks = this.tasks.map(v => {
            let res = result.find(k => k.name == v.name)
            if (res) {
              return {
                ...v,
                checked: res.status == 'fail',
                res: res.status == 'succ' ? res.value : res.reason
              }
            }
            return v
          })
          console.log(this.tasks)
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    }
  }
}
</script>

<style lang="sass" scoped>
.fresh-elm
  width: 100%
  padding: 0 20px

.header
  display: flex
  width: 100%
  justify-content: flex-start
  height: 60px

.title
  font-size: 1.1em
  font-weight: bold

.form
  display: flex
  height: 60px
  margin-bottom: 20px
  justify-content: space-around
  align-items: center

.form > *
  margin-right: 30px
</style>
