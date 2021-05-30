<template lang="pug">
a-table(:columns="shop_indices_columns" :data-source="shop_indices_data.data" rowKey="field" :loading="spinning" 
  :pagination="false" 
  size="small" :scroll="{ x: scrollX, y: scrollY}" bordered :style="`max-width: ${scrollX + 10}px;`")
  template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
    a-row(type="flex")
      a-col(flex="auto")
        a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${240}px;`")
          a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      a-col(flex="60px")
        a-button(type="link" @click="confirm") confirm
        br
        a-button(type="link" @click="clearFilters") reset

</template>

<script>
import { message } from 'ant-design-vue'
import Shop from '../../api/shop'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import updateLocale from 'dayjs/plugin/updateLocale'

import 'dayjs/locale/zh-cn'

dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(updateLocale)

dayjs.locale('zh-cn')

dayjs.updateLocale('zh-cn', {
  weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
})

export default {
  name: 'shop-indices',
  props: ['shop_meta'],
  data() {
    return {
      shop_indices_data: {
        dates: [],
        data: []
      },
      spinning: false,
      scrollY: 900
    }
  },
  computed: {
    shop_indices_columns() {
      let fiexed_cols = [
        {
          title: '指标',
          dataIndex: 'field',
          width: 120,
          filters: this.getColFilters('field'),
          filterMultiple: true,
          fixed: 'left',
          onFilter: (value, record) => record.field == value
        }
      ]
      let dates_cols = this.shop_indices_data.dates.map(v => ({
        title: dayjs(v, 'YYYY-MM-DD').format('M/D'),
        dataIndex: v,
        align: 'right',
        width: 80,
        // sorter: (a, b) => this.toNum(a[v]) - this.toNum(b[v])
      }))
      // console.log([...fiexed_cols, ...dates_cols])
      return [...fiexed_cols, ...dates_cols]
    },
    scrollX() {
      let x = this.reduce_width(this.shop_indices_columns)
      return x
    }
  },
  methods: {
    reduce_width(nodes) {
      return nodes.reduce((sw, c) => {
        if (c.width) return sw + c.width
        if (c.children) return sw + this.reduce_width(c.children)
        return sw
      }, 10)
    },
    toNum(str) {
      try {
        return parseFloat(str)
      } catch (error) {
        return 0
      }
    },
    getColFilters(colName) {
      return Array.from(new Set(this.shop_indices_data.data.map(row => row[colName]))).map(col => ({
        text: col,
        value: col
      }))
    },
    fetch_shop_indices() {
      this.spinning = true
      new Shop(this.shop_meta.shopId)
        .indices(this.shop_meta.platform)
        .then(res => {
          this.shop_indices_data = res
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    }
  },
  created() {
    this.scrollY = document.body.clientHeight - 126
    this.fetch_shop_indices()
  },
  watch: {
    shop_meta() {
      this.fetch_shop_indices()
    }
  }
}
</script>

<style lang="sass" scoped>
.cell
  display: inline-block
  width: 100%
  text-align: right

.unsatisfied
  color: #fa541c
</style>
