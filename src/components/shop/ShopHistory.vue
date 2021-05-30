<template lang="pug">
a-table(:columns="shopTableCols" :data-source="history" rowKey="date" :loading="loading"
  :expandRowByClick="true" :pagination="{showSizeChanger: true, defaultPageSize: 10}" :expandIconAsCell="false" :expandIconColumnIndex="-1"
  :scroll="{x: shopScrollX}" size="small" style="width: 936px;")
  template(#expandedRowRender="{record}")
    shop-data(:shop_data="omit(record, history_hiddens)" style="width: 936px;" :shop_meta="{shop_id: shopid, platform: record.platform}")
</template>

<script>
import Shop from '../../api/shop'
import ShopData from './ShopData'
import { message } from 'ant-design-vue'
export default {
  name: 'shop-history',
  props: {
    shopid: Number
  },
  components: {
    ShopData
  },
  data() {
    return {
      history: [],
      loading: false,
      history_hiddens: ['id', 'city', 'person', 'real_shop', 'shop_id', 'shop_name', 'platform', 'a', 'qs']
    }
  },
  computed: {
    shopTableCols() {
      return [
        {
          title: '总收入',
          dataIndex: 'income_sum',
          align: 'right',
          width: 84,
          sorter: (a, b) => this.toNum(a.income_sum) - this.toNum(b.income_sum)
        },
        {
          title: '平均收入',
          dataIndex: 'income_avg',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.income_avg) - this.toNum(b.income_avg)
        },
        {
          title: '配送',
          dataIndex: 'third_send',
          align: 'right',
          width: 84,
          sorter: (a, b) => this.toNum(a.third_send) - this.toNum(b.third_send)
        },
        {
          title: '订单',
          dataIndex: 'orders',
          align: 'right',
          width: 80,
          sorter: (a, b) => this.toNum(a.orders) - this.toNum(b.orders)
        },
        {
          title: '收入',
          dataIndex: 'income',
          align: 'right',
          width: 90,
          sorter: (a, b) => this.toNum(a.income) - this.toNum(b.income)
        },
        {
          title: '成本比例',
          dataIndex: 'cost_ratio',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.cost_ratio) - this.toNum(b.cost_ratio)
        },
        {
          title: '推广',
          dataIndex: 'consume',
          align: 'right',
          width: 84,
          sorter: (a, b) => this.toNum(a.consume) - this.toNum(b.consume)
        },
        {
          title: '推广比例',
          dataIndex: 'consume_ratio',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.consume_ratio) - this.toNum(b.consume_ratio)
        },
        {
          title: '比30日',
          dataIndex: 'settlea_30',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.settlea_30) - this.toNum(b.settlea_30)
        },
        {
          title: '比昨日',
          dataIndex: 'settlea_1',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.settlea_1) - this.toNum(b.settlea_1)
        },
        {
          title: '比上周',
          dataIndex: 'settlea_7',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.settlea_7) - this.toNum(b.settlea_7)
        },
        {
          title: '总分',
          dataIndex: 'score',
          align: 'right',
          width: 84,
          sorter: (a, b) => this.toNum(a.score) - this.toNum(b.score)
        },
        {
          title: '日期',
          dataIndex: 'date',
          align: 'right',
          width: 100,
          sorter: (a, b) => this.toNum(a.date) - this.toNum(b.date)
        }
      ]
    },
    shopScrollX() {
      return this.shopTableCols.reduce((sum, { width }) => sum + width, 50)
    }
  },
  methods: {
    toNum(str) {
      try {
        return parseFloat(str)
      } catch (error) {
        return 0
      }
    },
    fetch_shop_history() {
      this.loading = true
      new Shop(this.shopid)
        .single_history()
        .then(res => {
          this.history = res
          this.loading = false
        })
        .catch(e => {
          message.error(e)
          this.loading = false
        })
    },
    omit(obj, ks) {
      let newKs = Object.keys(obj).filter(v => !ks.includes(v))
      let newObj = newKs.reduce((res, k) => {
        return { ...res, [k]: obj[k] }
      }, {})
      return newObj
    }
  },
  mounted() {
    this.fetch_shop_history()
  }
}
</script>
