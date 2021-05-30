<template lang="pug">
a-table(:columns="acts_columns" :data-source="acts_data.shops" rowKey="shop_name" :loading="spinning" 
  :pagination="{showSizeChanger: true, defaultPageSize: 20, pageSizeOptions: ['20', '40', '80', '160'], size: 'small'}" size="small" :scroll="{x: scrollX, y: scrollY}" bordered)
  template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
    a-row(type="flex")
      a-col(flex="auto")
        a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 200px; width: ${column.width}px;`")
          a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      a-col(flex="60px")
        a-button(type="link" @click="confirm") confirm
        br
        a-button(type="link" @click="clearFilters") reset
  template(#shop_name="{text, record}")
    router-link.cell(:to="{name: 'shop', params: {shopid: record.shop_id}}" style="color: rgba(0, 0, 0, 0.65);") {{text}}
</template>

<script>
import { message } from 'ant-design-vue'
import User from '../../api/user'
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
  name: 'user-acts-ov-table',
  data() {
    return {
      acts_data: {
        dates: [],
        shops: []
      },
      spinning: false,
      scrollY: 900
    }
  },
  computed: {
    username() {
      return this.$route.params.username
    },
    acts_columns() {
      let fiexed_cols = [
        {
          title: '店名',
          dataIndex: 'shop_name',
          key: 'shop_name',
          width: 160,
          slots: { filterDropdown: 'filterDropdown', customRender: 'shop_name' },
          filterMultiple: true,
          fixed: 'left',
          onFilter: (value, record) => record.shop_name == value
        },
        {
          title: '平台',
          dataIndex: 'platform',
          key: 'platform',
          width: 70,
          filters: this.getColFilters('platform'),
          filterMultiple: true,
          fixed: 'left',
          onFilter: (value, record) => record.platform == value
        }
      ]
      let dates_cols = this.acts_data.dates.map(v => ({
        title: v,
        children: [
          {
            title: '低收入',
            dataIndex: `low_income_${v}`,
            key: `low_income_${v}`,
            align: 'left',
            width: 190
          },
          {
            title: '高推广',
            dataIndex: `high_consume_${v}`,
            key: `high_consume_${v}`,
            align: 'left',
            width: 190
          },
          {
            title: '高成本',
            dataIndex: `high_cost_${v}`,
            key: `high_cost_${v}`,
            align: 'left',
            width: 190
          },
          {
            title: '严重超跌',
            dataIndex: `severe_slump_${v}`,
            key: `severe_slump_${v}`,
            align: 'left',
            width: 190
          }
        ]
      }))
      console.log([...fiexed_cols, ...dates_cols])
      return [...fiexed_cols, ...dates_cols]
    },
    scrollX() {
      let x = this.reduce_width(this.acts_columns)
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
      return Array.from(new Set(this.acts_data.shops.map(row => row[colName]))).map(col => ({ text: col, value: col }))
    },
    fetch_acts_ov_single() {
      this.spinning = true
      new User(this.username)
        .all_acts()
        .then(res => {
          this.acts_data = this.getActsData(res.activities)
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    },
    getActsData(res) {
      let acts = Object.values(res).reduce((a, c) => {
        return [...a, ...c]
      }, [])
      acts = acts.map(a => ({ ...a, time: dayjs(a.time, 'YYYY/MM/DD HH:mm:ss').format('YYYY-MM-DD') }))
      let shops = Array.from(new Set(acts.map(a => a.shop_name)))
      shops = shops.map(s => {
        let shop_id = acts.find(v => v.shop_name == s).shop_id
        let platform = acts.find(v => v.shop_name == s).platform
        let low_incomes = acts
          .filter(k => k.shop_name == s && k.q == '低收入')
          .sort((a, b) => b.date - a.date)
          .reduce((o, c) => ({ ...o, [`low_income_${c.time}`]: c.a }), {})
        let high_consumes = acts
          .filter(k => k.shop_name == s && k.q == '高推广')
          .sort((a, b) => b.date - a.date)
          .reduce((o, c) => ({ ...o, [`high_consume_${c.time}`]: c.a }), {})
        let high_costs = acts
          .filter(k => k.shop_name == s && k.q == '高成本')
          .sort((a, b) => b.date - a.date)
          .reduce((o, c) => ({ ...o, [`high_cost_${c.time}`]: c.a }), {})
        let severe_slumps = acts
          .filter(k => k.shop_name == s && k.q == '严重超跌')
          .sort((a, b) => b.date - a.date)
          .reduce((o, c) => ({ ...o, [`severe_slump_${c.time}`]: c.a }), {})
        return { shop_id, shop_name: s, platform, ...low_incomes, ...high_consumes, ...high_costs, ...severe_slumps }
      })
      return {
        dates: Object.keys(res),
        shops
      }
    }
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 166
    this.fetch_acts_ov_single()
  },
  watch: {
    $route(route) {
      if (route.name == 'user-acts') {
        this.fetch_acts_ov_single()
      }
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
