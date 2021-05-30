<template lang="pug">
a-table.ant-table-striped(:columns="cols" :data-source="data" rowKey="id" :loading="loading"
  :expandRowByClick="true" :pagination="false" :expandIconAsCell="false" :expandIconColumnIndex="-1"
  size="small" style="width: 1000px;" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'

let cols = [
  {
    title: '商品',
    dataIndex: 'name',
    width: 140
  },
  {
    title: '分类',
    dataIndex: 'category_name',
    width: 100
  },
  {
    title: '描述',
    dataIndex: 'description',
    width: 260
  },
  {
    title: '原价',
    dataIndex: 'price',
    width: 70,
    align: 'right'
  },
  {
    title: '餐盒费',
    dataIndex: 'package_fee',
    width: 70,
    align: 'right'
  }
]

export default {
  name: 'shop-offsell',
  props: ['goods_meta'],
  data() {
    return {
      cols,
      data: [],
      loading: false
    }
  },
  methods: {
    fetchOffsell() {
      this.loading = true
      let { shopId, platform, day } = this.goods_meta
      new Shop(shopId)
        .offsell(platform, day)
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
    this.fetchOffsell()
  },
  watch: {
    goods_meta() {
      this.fetchOffsell()
    }
  }
}
</script>

<style lang="sass" scoped>
.ant-table-striped :deep(.table-striped) 
  background-color: #fafafa

</style>