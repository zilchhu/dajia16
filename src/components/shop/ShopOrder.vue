<template lang="pug">
a-table.ant-table-striped(:columns="cols" :data-source="data" rowKey="订单id" :loading="loading"
  :expandRowByClick="true" :pagination="false" :expandIconAsCell="false" :expandIconColumnIndex="-1"
  size="small" style="width: 1000px;" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")
  //- template(#expandedRowRender="{record}")
  //-   shop-data(:shop_data="omit(record, history_hiddens)" style="width: 936px;")
  template(#订单id="{text}")
    div(style="font-size: 10px") {{text}}
    //- a(v-else
    //-   :href="`https://melody.shop.ele.me/app/shop/${goods_meta.shopId}/order__searchings#app.shop.order.searchings?searchInfo={"searchType":"orderId","keyWord":"${text}","searchValue":null}`"
    //-   style="font-size: 10px; color: rgba(0, 0, 0, 0.65);") {{text}}
  template(#订单信息="{text}")
    div(style="white-space: pre-wrap; font-size: 0.93em;") {{text}}
</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'

let cols = [
  {
    title: '订单id',
    dataIndex: '订单id',
    slots: {customRender: '订单id'},
    width: 110
  },
  {
    title: '活动',
    dataIndex: '活动',
    width: 60
  },
  {
    title: '商品数',
    dataIndex: '商品数',
    width: 50,
    align: 'right'
  },
  {
    title: '订单信息',
    dataIndex: '订单信息',
    slots: {customRender: '订单信息'},
    width: 280,
    align: 'right'
  },
  {
    title: '成本',
    dataIndex: '成本',
    width: 60,
    align: 'right'
  },
  {
    title: '收入',
    dataIndex: '收入',
    width: 60,
    align: 'right'
  },
  {
    title: '成本比例',
    dataIndex: '成本比例',
    width: 60,
    align: 'right'
  }
]

export default {
  name: 'shop-order',
  props: ['goods_meta'],
  data() {
    return {
      cols:
        this.goods_meta.platform == 'mt'
          ? cols
          : [
              ...cols,
              {
                title: '单均配送',
                dataIndex: '单均配送',
                width: 80,
                align: 'right'
              }
            ],
      data: [],
      loading: false
    }
  },
  methods: {
    fetchOrder() {
      this.loading = true
      let { shopId, platform, activi, counts, date } = this.goods_meta
      new Shop(shopId)
        .order(platform, activi, counts, date)
        .then(res => {
          this.data = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    }
  },
  created() {
    this.fetchOrder()
  },
  watch: {
    goods_meta(n) {
      this.fetchOrder()
      this.cols =
        n.platform == 'mt'
          ? cols
          : [
              ...cols,
              {
                title: '单均配送',
                dataIndex: '单均配送',
                width: 80,
                align: 'right'
              }
            ]
    }
  }
}
</script>

<style lang="sass" scoped>
.ant-table-striped :deep(.table-striped) 
  background-color: #fafafa

</style>