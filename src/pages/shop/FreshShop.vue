<template lang="pug">
div
  a-table.ant-table-fresh(:columns="fresh_shop_columns" :data-source="fresh_shop_data.shops" rowKey="key" :loading="spinning" 
    :pagination="{showSizeChanger: true, defaultPageSize, pageSizeOptions: ['19', '38', '76', '152'], size: 'small'}" 
    @change="table_change"
    size="small" :scroll="{ x: scrollX, y: scrollY}" bordered :style="`max-width: ${scrollX + 10}px;`"
    :rowClassName="(record) => record.field == '评论数' ? 'table-striped' : null")
    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      //- a-row(type="flex")
      //-   a-col(flex="auto")
      //-     a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${240}px;`")
      //-       a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      //-   a-col(flex="60px")
      //-     a-button(type="link" @click="confirm") confirm
      //-     br
      //-     a-button(type="link" @click="clearFilters") reset
      table-select(:style="`min-width: 160px; width: ${column.dataIndex == 'name' ? 350 : column.width + 50 || 300}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

      
    template(#value="{text, record}")
      .cell(:class="{unsatisfied: isUnsatisfy(record, text)}") {{text}}

    template(#field="{text, record}")
      .cell(:title="record.name") {{text}}

  a-modal(v-model:visible="aModel" :footer="null" centered :width="800")
    a-table(:columns="fresh_as_columns" :data-source="fresh_as" rowKey="updated_at" :pagination="false" :scroll="{y: 850}" size="small" style="max-width: 700px;")
      template(#a2="{text, record}")
        a-textarea(:value="text" @change="e => handleChange(e.target.value, record.wmpoiid, record.updated_at)" :auto-size="{ minRows: 1 }")

  a-modal(v-model:visible="probClickModal" :footer="null" centered :width="1080")
    shop-problem(:shop_meta="shop_meta")

  a-modal(v-model:visible="ratesClickModal" :footer="null" centered :width="800")
    shop-indices(:shop_meta="shop_meta_rates")

  a-modal(v-model:visible="offsellClickModal" :footer="null" centered :width="1080")
    shop-offsell(:goods_meta="shop_meta_offsells")

  a.expo(:href="`http://192.168.3.3:9040/新店表${yesterday}.xlsx`" target="_blank") export
</template>

<script>
import { message } from 'ant-design-vue'
import FreshShop from '../../api/fresh-shop'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import updateLocale from 'dayjs/plugin/updateLocale'

import ShopProblem from '../../components/shop/ShopProblem'
import ShopIndices from '../../components/shop/ShopIndices'
import ShopOffsell from '../../components/shop/ShopOffsell'
import TableSelect from '../../components/TableSelect'
import { SaveOutlined } from '@ant-design/icons-vue'

import 'dayjs/locale/zh-cn'

dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(updateLocale)

dayjs.locale('zh-cn')

dayjs.updateLocale('zh-cn', {
  weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
})

export default {
  name: 'fresh-shop',
  components: {
    ShopProblem,
    ShopIndices,
    ShopOffsell,
    TableSelect,
    SaveOutlined
  },
  data() {
    return {
      fresh_shop_data: {
        dates: [],
        shops: []
      },
      fresh_as_data: [],
      fresh_as: [],
      aModel: false,
      spinning: false,
      scrollY: 900,
      debounce_save: null,
      defaultPageSize: 19,
      last_fresh_shop_route: { path: '/freshshop' },
      probClickModal: false,
      ratesClickModal: false,
      offsellClickModal: false,
      shop_meta: { shopId: null, platform: null },
      shop_meta_rates: { shopId: null, platform: null },
      shop_meta_offsells: { shopId: null, platform: null, day: null },
      today: dayjs().format('YYYY-MM-DD')
    }
  },
  computed: {
    yesterday() {
      return dayjs()
        .subtract(1, 'day')
        .format('YYYYMMDD')
    },
    fresh_shop_columns() {
      let fiexed_cols = [
        {
          title: '物理店',
          dataIndex: 'real_shop_name',
          width: 85,
          slots: { filterDropdown: 'filterDropdown' },
          filterMultiple: true,
          fixed: 'left',
          customRender: ({ text, record, index }) => {
            const obj = {
              children: (
                <div
                  onclick={() => this.$router.push({ name: 'user', params: { username: record.new_person, date: 0 } })}
                  style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);"
                >
                  {text}
                </div>
              ),
              props: {}
            }
            if (index % 19 == 0) {
              obj.props.rowSpan = 19
            } else {
              obj.props.rowSpan = 0
            }
            return obj
          },
          onFilter: (value, record) => record.real_shop_name == value
        },
        {
          title: '门店',
          dataIndex: 'name',
          width: 75,
          slots: { filterDropdown: 'filterDropdown' },
          filterMultiple: true,
          fixed: 'left',
          customRender: ({ text, record, index }) => {
            const obj = {
              children: (
                <div style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);">
                  {text}
                  <br />
                  {record.wmPoiId}
                </div>
              ),
              props: {}
            }
            if (index % 19 == 0) {
              obj.props.rowSpan = 19
            } else {
              obj.props.rowSpan = 0
            }
            return obj
          },
          onFilter: (value, record) => record.name == value
        },
        {
          title: '负责人',
          dataIndex: 'new_person',
          width: 85,
          slots: { filterDropdown: 'filterDropdown' },
          filterMultiple: true,
          fixed: 'left',
          customRender: ({ text, record, index }) => {
            const obj = {
              children: (
                <div
                  onclick={() => this.$router.push({ name: 'user', params: { username: record.new_person, date: 0 } })}
                  style="writing-mode: vertical-lr; white-space: pre-wrap; color: rgba(0,0,0,.65);"
                >
                  {text}
                </div>
              ),
              props: {}
            }
            if (index % 19 == 0) {
              obj.props.rowSpan = 19
            } else {
              obj.props.rowSpan = 0
            }
            return obj
          },
          onFilter: (value, record) => record.new_person == value
        },
        {
          title: '项目',
          dataIndex: 'field',
          width: 100,
          // filters: this.getColFilters('field'),
          // filterMultiple: true,
          fixed: 'left',
          slots: { customRender: 'field' },
          onFilter: (value, record) => record.field == value
        }
      ]
      let dates_cols = this.fresh_shop_data.dates.map((v, i) => ({
        title: dayjs(v, 'YYYYMMDD').format('M/D'),
        dataIndex: v,
        align: 'right',
        width: 80,
        // slots: { customRender: 'value' }
        customRender: ({ text, record }) => {
          const obj2 = {
            children: (
              <div
                className={this.isUnsatisfy(record, text) ? 'unsatisfied' : ''}
                onClick={() => {
                  if (record.field == '成本比例') this.costRatioClick(v, record)
                  else if (record.field == '评分') this.ratingClick(record)
                  else if (record.field == '下架产品量') this.offsellClick(v, record)
                }}
              >
                {text}
              </div>
            ),
            props: {}
          }
          const obj3 = {
            children: (
              <div style="display: flex; align-items: center; max-width: 1080px;">
                <a-textarea
                  auto-size={{ minRows: 1 }}
                  defaultValue={this.fresh_as_data.find(
                      v => v.wmpoiid == record.wmPoiId && v.updated_at == this.today
                    )?.a2}
                  id={record.key}
                />
                <SaveOutlined style="flex-basis: 80px;" onClick={() => this.handleAAModel(record)} />
                <a-badge
                  count={this.fresh_as_data.filter(v => v.wmpoiid == record.wmPoiId).length}
                  number-style={{ backgroundColor: '#52c41acc' }}
                  style="flex-basis: 80px;"
                >
                  <div onClick={() => this.handleAModel(record)}>历史记录</div>
                </a-badge>
              </div>
            ),
            props: { colSpan: i == 0 ? this.fresh_shop_data.dates.length : 0 }
          }
          return record.field == '优化' ? obj3 : obj2
        }
        // sorter: (a, b) => this.toNum(a[v]) - this.toNum(b[v])
      }))
      // console.log([...fiexed_cols, ...dates_cols])
      return [...fiexed_cols, ...dates_cols]
    },
    fresh_as_columns() {
      return [
        {
          title: '优化记录',
          dataIndex: 'a2',
          width: 600,
          slots: { customRender: 'a2' }
        },
        {
          title: '日期',
          dataIndex: 'updated_at',
          width: 100
        }
      ]
    },
    scrollX() {
      let x = this.reduce_width(this.fresh_shop_columns)
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
    debounce(fn) {
      let timeout = null
      return function() {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    getColFilters(colName) {
      return Array.from(new Set(this.fresh_shop_data.shops.map(row => row[colName] || '')))
        .sort()
        .map(col => ({
          label: col,
          value: col
        }))
    },
    fetch_fresh_shop() {
      this.spinning = true
      new FreshShop()
        .single()
        .then(res => {
          this.fresh_shop_data = res
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    },
    fetch_fresh_as() {
      this.spinning = true
      new FreshShop()
        .getAs()
        .then(res => {
          this.fresh_as_data = res
          this.spinning = false
        })
        .catch(e => {
          console.error(e)
          message.error(e)
          this.spinning = false
        })
    },
    isUnsatisfy(record, text) {
      if (record.field == '评论数') return this.toNum(text) < 20
      if (record.field == '评分') return this.toNum(text) < 4.8
      if (record.field == '推广') return this.toNum(text) < 50 || this.toNum(text) > 150
      if (record.field == '客单价') return this.toNum(text) < 12
      if (record.field == '曝光量') return this.toNum(text) < 3000
      if (record.field == '进店率') return this.toNum(text) < 8
      if (record.field == '下单率') return this.toNum(text) < 25
      if (record.field == '下架产品量') return this.toNum(text) > 5
      if (record.field == '下架产品量') return this.toNum(text) > 5
      if (record.field == '商圈排名') return this.toNum(text) > 2
      if (record.field == '高佣返现') return this.toNum(text) == 0 && record.platform == '美团'
      if (record.field == '延迟发单') return this.toNum(text) == 0 && record.platform == '饿了么'
      if (record.field == '评论/单量') return this.toNum(text) < 20
      if (record.field == '成本比例') return this.toNum(text) > 50
    },
    handleChange(value, wmpoiid, updated_at) {
      console.time('change')
      const target = this.fresh_as_data.filter(
        v => v.wmpoiid == wmpoiid && dayjs(v.updated_at).isSame(dayjs(updated_at), 'day')
      )[0]
      if (target) {
        target['a2'] = value
      } else {
        this.fresh_as_data = [...this.fresh_as_data, { wmpoiid, a2: value, updated_at }]
      }
      console.log(this.fresh_as_data.filter(v=>v.wmpoiid == wmpoiid))
      console.timeEnd('change')
      this.debounce_save(wmpoiid, updated_at)
    },
    save(wmpoiid, updated_at) {
      const target = this.fresh_as_data.filter(
        v => v.wmpoiid == wmpoiid && dayjs(v.updated_at).isSame(dayjs(updated_at), 'day')
      )[0]
      if (target) {
        new FreshShop()
          .saveA(target['wmpoiid'], target['a2'], target['updated_at'])
          .then(res => {
            console.log(res)
            message.success('保存成功')
          })
          .catch(err => {
            message.error('保存失败')
          })
        console.log(target)
      }
    },
    handleAModel(record) {
      this.fresh_as = this.fresh_as_data.filter(v => v.wmpoiid == record.wmPoiId)
      this.aModel = true
    },
    handleAAModel(record) {
      console.log(record)
      let value = document.getElementById(record.key).value
      this.handleChange(value, record.wmPoiId, this.today)
    },
    table_change(pagination) {
      localStorage.setItem('freshShop/defaultPageSize', pagination.pageSize)
    },
    costRatioClick(date, record) {
      this.shop_meta = {
        shopId: record.wmPoiId,
        platform: record.platform == '美团' ? 'mt' : 'elm',
        date: dayjs(date, 'YYYYMMDD')
          .add(1, 'day')
          .format('YYYYMMDD')
      }
      this.probClickModal = true
    },
    ratingClick(record) {
      this.shop_meta_rates = { shopId: record.wmPoiId, platform: record.platform == '美团' ? 'mt' : 'elm' }
      this.ratesClickModal = true
    },
    offsellClick(day, record) {
      this.shop_meta_offsells = { shopId: record.wmPoiId, platform: record.platform == '美团' ? 'mt' : 'elm', day }
      this.offsellClickModal = true
    }
  },
  created() {
    this.scrollY = document.body.clientHeight - 126
    this.defaultPageSize = +localStorage.getItem('freshShop/defaultPageSize') || 19
    this.debounce_save = this.debounce(this.save)
    this.fetch_fresh_shop()
    this.fetch_fresh_as()
  },
  watch: {
    $route(route) {
      if (route.name == 'fresh-shop') {
        this.defaultPageSize = +localStorage.getItem('freshShop/defaultPageSize') || 19
        if (route.path != this.last_fresh_shop_route.path) {
          this.fetch_fresh_shop()
        }
        this.last_fresh_shop_route = route
      }
    }
  }
}
</script>

<style lang="sass">
.cell
  display: inline-block
  width: 100%
  text-align: right

.unsatisfied
  color: #fa541c

.ant-table-fresh .table-striped
  background-color: #6ed8c750

.expo
  display: block
  position: absolute
  bottom: 20px
  left: 10px
  z-index: 100
</style>
