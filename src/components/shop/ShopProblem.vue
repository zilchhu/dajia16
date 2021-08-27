<template lang="pug">
a-table(:columns="cols" :data-source="data" rowKey="key" :loading="loading"
  :expandRowByClick="true" :pagination="false" :expandIconAsCell="false" :expandIconColumnIndex="-1" :expandedRowKeys="expandedRowKeys"
  @expandedRowsChange="expandedRowsChange"
  size="small" style="width: 1000px;")
  template(#expandedRowRender="{record}")
    shop-order(:goods_meta="{...shop_meta, activi: record['活动'], counts: record['商品数']}")
</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'
import ShopOrder from './ShopOrder'

let cols = [
  {
    title: '门店Id',
    dataIndex: 'shop_id',
    width: 100
  },
  {
    title: '门店',
    dataIndex: 'shop_name',
    width: 180
  },
  {
    title: '商品数',
    dataIndex: '商品数',
    width: 80,
    align: 'right'
  },
  {
    title: '活动',
    dataIndex: '活动',
    width: 80,
    align: 'right'
  },
  {
    title: '成本',
    dataIndex: '成本',
    width: 80,
    align: 'right'
  },
  {
    title: '收入',
    dataIndex: '收入',
    width: 80,
    align: 'right'
  },
  {
    title: '成本比例',
    dataIndex: '成本比例',
    width: 80,
    align: 'right'
  },
  {
    title: '单量',
    dataIndex: '单量',
    width: 80,
    align: 'right'
  },
  {
    title: '单量占比',
    dataIndex: '单量占比',
    width: 80,
    align: 'right'
  }
]

export default {
  name: 'shop-problem',
  components: {
    ShopOrder
  },
  props: ['shop_meta'],
  data() {
    return {
      cols:
        this.shop_meta.platform == 'mt'
          ? cols
          : [
              ...cols,
              {
                title: '单均配送',
                dataIndex: '单均配送费',
                width: 80,
                align: 'right'
              }
            ],
      data: [],
      loading: false,
      expandedRowKeys: []
    }
  },
  methods: {
    fetchProb() {
      this.loading = true
      let { shopId, date, platform } = this.shop_meta
      new Shop(shopId)
        .prob('cost', platform, date)
        .then(res => {
          this.data = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    expandedRowsChange(keys) {
      this.expandedRowKeys = keys
    }
  },
  created() {
    this.fetchProb()
  },
  watch: {
    shop_meta(n) {
      this.expandedRowKeys = []
      this.cols =
        n.platform == 'mt'
          ? cols
          : [
              ...cols,
              {
                title: '单均配送',
                dataIndex: '单均配送费',
                width: 80,
                align: 'right'
              }
            ]
      this.fetchProb()
    }
  }
}
</script>
