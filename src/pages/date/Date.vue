<template lang="pug">
div(ref="date")
  s-table.ant-table-change(
    :columns="tableCols",
    :data-source="table",
    rowKey="shop_id",
    :loading="tableLoading",
    :expandRowByClick="true",
    :expandIconAsCell="false",
    :expandIconColumnIndex="-1",
    :pagination="false",
    column-drag
    size="small",
    :scroll="{ x: scrollX, y: scrollY }",
    :rowClassName="(record, index) => (record.new_person != null ? 'table-new-person-row' : null)"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="table",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#headerCell="{ title, column }")
      .header-cell {{ title }}
    template(#emptyText)
      div 无数据，请找技术处理
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == 'shop_id'")
        .copy-cell
          router-link(
            :to="{ name: 'shop', params: { shopid: text }, query: { name: record.shop_name } }",
            style="color: rgba(0, 0, 0, 0.65)"
          ) {{ text }}
          .copy-icon(@click.stop="() => copy(text, `id-${record.shop_id}`)")
            a-tooltip(
              title="copied",
              :visible="shopNameCopyShows[`id-${record.shop_id}`] || false"
            )
              CopyOutlined
      template(v-else-if="column.dataIndex == 'shop_name'")
        .copy-cell
          div {{ text }}
          .copy-icon(@click.stop="() => copy(text, `name-${record.shop_id}`)")
            a-tooltip(
              title="copied",
              :visible="shopNameCopyShows[`name-${record.shop_id}`] || false"
            )
              CopyOutlined
      template(v-else-if="column.dataIndex == 'income'")
        .cell(:class="{ unsatisfied: isIncome(text, record) }", @click="copy") {{ text }}
      template(v-else-if="column.dataIndex == 'consume_ratio'")
        .cell(:class="{ unsatisfied: isConsumeRatio(text, record) }") {{ text }}
      template(v-else-if="column.dataIndex == 'settlea_30'")
        .cell(:class="{ unsatisfied: isSettlea30(text) }") {{ text }}
      template(v-else-if="column.dataIndex == 'person'")
        router-link.cell(
          :to="{ name: 'user', params: { username: text || '-', date: 0 } }",
          style="color: rgba(0, 0, 0, 0.65)"
        ) {{ text }}
      template(v-else-if="column.dataIndex == 'cost_ratio'")
        .cell(
          :class="{ unsatisfied: isCostRatio(text, record) }", 
          @click.stop="() => costRatioClick(text, record)", 
          style="cursor: pointer"
        ) {{ text }}
      template(v-else-if="column.dataIndex == 'rating'")
        .cell(
          @click.stop="() => ratingClick(record)",
          :class="{ unsatisfied: text < record.rating_last }",
          style="cursor: pointer"
        ) {{ text }}
      template(v-else-if="column.dataIndex == 'ship_fee_avg'")
        .cell(
          @click.stop="() => shippingClick(record)",
          style="cursor: pointer"
        ) {{ text }}

    template(#expandedRowRender="{ record }")
      a-card(style="width: 100vw", size="small")
        a-tooltip(
          v-for="key in Object.keys(record).filter((v) => !['a', 'comments'].includes(v))", 
          :key="key"
        )
          template(#title)
            .tip {{ `${record[key]}${thresholdSuffix(key, record.platform)}` }}
          a-card-grid(style="width: 100px; padding: 4px")
            a-statistic(
              :title="en2zh.get(key)",
              :value="record[key]",
              valueStyle="font-size: 1em;"
            )
              template(v-if="ruleIdx.includes(key)", #formatter="{ value }")
                p.truncate(
                  :class="{ unsatisfied: rules2fn[record.platform][key](value) }"
                ) {{ emptyVal(value) }}
                  //- template(v-else-if="key == 'score'")
                  //-   p.truncate(:class="{success: value == 100}") {{value}}
              template(v-else, #formatter="{ value }")
                p.truncate {{ emptyVal(value) }}

      hello-form2(:record="record", @save="onSave")
      .date-shop-btn(@click="viewHistoryShopTable(record)") 往日数据


  a-modal(
    v-model:visible="editRowKeysModal",
    :footer="null",
    centered,
    :width="540"
  )
    div 已停用

  a-modal(
    v-model:visible="dateShopModal",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.9"
  )
    .modal
      DateShop(:table="dateShopTable")

  a-modal(
    v-model:visible="probClickModal",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.86"
  )
    .modal
      shop-problem(:shop_meta="shop_meta", :scrollY="bodyRect.height * 0.7")

  a-modal(
    v-model:visible="ratesClickModal",
    :footer="null",
    centered,
    :width="800"
  )
    shop-indices(:shop_meta="shop_meta_rates")

  a-modal(
    v-model:visible="shippingClickModal",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.9"
  )
    shop-shipping(:shop_meta="shop_meta_shipping")

  .left-bottom-div(v-show="!tableLoading")
    a-button(type="link", size="small", @click="() => getTableByDate()") 刷新
    div(title="强刷新将会删除当前营推表并保存当前工单记录，然后重新创建营推表并恢复工单记录")
      a-button(
        type="link",
        size="small",
        @click="() => getTableByDate(true)"
      ) 强刷新
    a(:href="`http://192.168.3.3:9040/营推表${yesterday}.xlsx`", target="_blank") export
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 导出
    a(
      v-show="tableUrl",
      :href="tableUrl",
      target="_blank"
    ) 下载
</template>

<script>
import dayjs from "dayjs"
import mcopy from "modern-copy"
import app from "apprun"
import { message } from "ant-design-vue"
import { CopyOutlined } from "@ant-design/icons-vue"
import TableSelect from "../../components/TableSelect"
import HelloForm2 from "../../components/HelloForm2"
import ShopProblem from "../../components/shop/ShopProblem"
import ShopIndices from "../../components/shop/ShopIndices"
import ShopShipping from "../../components/shop/ShopShipping"
import DateShop from "./DateShop.vue"
import baseFetch from "../../api/base"

function distinct(s) {
  let ns = s.trim().split("\n")
  ns = ns.map((v) => v.trim())
  ns = Array.from(new Set(ns))
  return ns.filter((v) => /\d+/.test(v))
}

export default {
  name: "date",
  data() {
    return {
      bodyRect: { width: 900, height: 800 },
      table: [],
      tablesByShop: new Map(),
      tableLoading: false,
      rules: [
        ["consume_ratio", ">", 8],
        ["cost_ratio", ">", 53],
        ["settlea_30", "<", 80],
      ],
      mtRules: [["income", "<", 900]],
      elmRules: [["income", "<", 700]],
      ruleIdx: ["income", "consume_ratio", "settlea_30"],
      collapseKey: [],
      selectedRowKeys: [],
      defaultPageSize: 30,
      scrollLeft: 0,
      shop_meta: { shopId: null, platform: null },
      shop_meta_rates: { shopId: null, platform: null },
      shop_meta_shipping: { shopId: null, platform: null },
      shopNameCopyShows: {},
      exporting: false,
      tableUrl: null,
      editedRowKeys: "",
      editRowKeysModal: false,
      probClickModal: false,
      ratesClickModal: false,
      shippingClickModal: false,
      dateShopName: "",
      dateShopTable: [],
      dateShopModal: false,
    }
  },
  components: {
    TableSelect,
    HelloForm2,
    DateShop,
    ShopProblem,
    ShopIndices,
    ShopShipping,
    CopyOutlined,
  },
  computed: {
    tablePersonColFilters() {
      return this.getColFilters("person")
    },
    tableCityColFilters() {
      return this.getColFilters("city")
    },
    tableRealShopColFilters() {
      return this.getColFilters("real_shop")
    },
    tableCols() {
      return [
        {
          title: "城市",
          dataIndex: "city",
          width: 60,
        },
        {
          title: "负责",
          dataIndex: "person",
          width: 60,
        },
        // {
        //   title: "组长",
        //   dataIndex: "leader",
        //   width: 60,
        // },
        {
          title: "物理店",
          dataIndex: "real_shop",
          width: 90,
          _sort: "str",
          _filter: true,
        },
        {
          title: "门店id",
          dataIndex: "shop_id",
          width: 100,
        },
        {
          title: "店名",
          dataIndex: "shop_name",
          width: 280,
        },
        {
          title: "平台",
          dataIndex: "platform",
          width: 60,
        },
        {
          title: "评分",
          dataIndex: "rating",
          align: "right",
          width: 50,
          _sort: true,
        },
        {
          title: "总收入",
          dataIndex: "income_sum",
          align: "right",
          width: 70,
          _sort: true,
        },
        {
          title: "平均收入",
          dataIndex: "income_avg",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "三方配送",
          dataIndex: "third_send",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "单均配送",
          dataIndex: "ship_fee_avg",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "单均扣点",
          dataIndex: "platform_fee_avg",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "起送价",
          dataIndex: "ship_fee_min",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "订单",
          dataIndex: "orders",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "收入",
          dataIndex: "income",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "成本比例",
          dataIndex: "cost_ratio",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "推广",
          dataIndex: "consume",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "推广比例",
          dataIndex: "consume_ratio",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "比30日",
          dataIndex: "settlea_30",
          align: "right",
          width: 70,
          _sort: true,
        },
        {
          title: "比昨日",
          dataIndex: "settlea_1",
          align: "right",
          width: 70,
          _sort: true,
        },
        {
          title: "比上周",
          dataIndex: "settlea_7",
          align: "right",
          width: 70,
          _sort: true,
        },
        {
          title: "总分",
          dataIndex: "score",
          align: "right",
          width: 60,
          _sort: true,
        },
        {
          title: "日期",
          dataIndex: "date",
          align: "right",
          fixed: "right",
          width: 70,
        },
      ].map(this.extendColumn)
    },
    scrollY() {
      return this.bodyRect.height - 148
    },
    scrollX() {
      return this.tableCols.reduce((sum, { width }) => sum + width ?? 200, 20)
    },
    en2zh() {
      const map = new Map()
      map.set("id", "id")
      map.set("city", "城市")
      map.set("person", "负责")
      map.set("leader", "组长")
      map.set("real_shop", "物理店")
      map.set("shop_id", "门店id")
      map.set("shop_name", "店名")
      map.set("platform", "平台")
      map.set("rating", "评分")
      map.set("rating_last", "上次评分")
      map.set("third_send", "三方配送")
      map.set("ship_fee_avg", "单均配送")
      map.set("platform_fee_avg", "单均扣点")
      map.set("ship_fee_min", "起送价")
      map.set("unit_price", "单价")
      map.set("orders", "订单")
      map.set("income", "收入")
      map.set("income_avg", "平均收入")
      map.set("income_sum", "总收入")
      map.set("cost", "成本")
      map.set("cost_avg", "平均成本")
      map.set("cost_sum", "总成本")
      map.set("cost_ratio", "成本比例")
      map.set("cost_sum_ratio", "总成本比例")
      map.set("wait_for_improve_cost", "待优化成本"), map.set("consume", "推广")
      map.set("consume_avg", "平均推广")
      map.set("consume_sum", "总推广")
      map.set("consume_ratio", "推广比例")
      map.set("consume_sum_ratio", "总推广比例")
      map.set("settlea_30", "比30日")
      map.set("settlea_1", "比昨日")
      map.set("settlea_7", "比上周")
      map.set("settlea_7_3", "比上周(3日)")
      map.set("income_score", "收入分")
      map.set("consume_score", "推广分")
      map.set("cost_score", "成本分")
      map.set("score", "总分")
      map.set("date", "日期")
      return map
    },
    rules2fn() {
      let mt = [...this.rules, ...this.mtRules]
      let elm = [...this.rules, ...this.elmRules]
      const fnBody = (r) => `
                                                                                                  let v = 0
                                                                                                  try {
                                                                                                    v = parseFloat(val)
                                                                                                  } catch (e) { console.error(e) }
                                                                                                  return v ${r[1]} ${r[2]}`
      mt = mt.reduce((o, r) => {
        return {
          ...o,
          [r[0]]: new Function("val", fnBody(r)),
        }
      }, {})
      elm = elm.reduce((o, r) => {
        return {
          ...o,
          [r[0]]: new Function("val", fnBody(r)),
        }
      }, {})
      return {
        美团: mt,
        饿了么: elm,
      }
    },
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
        selections: [
          {
            key: "by id",
            text: "by id",
            onSelect: () => {
              this.editRowKeysModal = true
            },
          },
        ],
      }
    },
    selectedShopMetas() {
      let r = distinct(this.editedRowKeys)
      r = r
        .map((r) => ({
          id: this.table.find((v) => v.shop_id == r)
            ? this.table.find((v) => v.shop_id == r).id
            : null,
          shop_id: r,
        }))
        .filter((r) => r.id != null)
      return r
    },
    day() {
      return this.$route.params.day
    },
    yesterday() {
      return dayjs().subtract(1, "day").format("YYYYMMDD")
    },
  },
  methods: {
    withPersonName(rec) {
      if (rec.person == "于松民") {
        let suffix = ""
        // if (rec.real_shop.match(/^白石洲|杨浦|爱联|狮岭|龙华|大岭山|白石厦$/))
        //   suffix = "-小廖";
        // if (rec.real_shop.match(/^长安沙头|东城|龙归|富士康|坪地|石牌|横岗$/))
        //   suffix = "-朋飞";
        return { ...rec, person: "于" + suffix }
      }
      return rec
    },
    getTableByDate(forceRefresh) {
      this.tableLoading = true
      baseFetch({
        url: "/v1/operatings_by_day",
        params: {
          day: this.day,
          refresh: forceRefresh,
        },
      })
        .then((res) => {
          this.table = res
          this.collapseKey = this.table.map((v) => `${v.id}-a`)
          this.tableLoading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.tableLoading = false
        })
    },
    toNum(str) {
      try {
        let f = parseFloat(str)
        if (isNaN(f)) return 0
        return f
      } catch (err) {
        return 0
      }
    },
    extendColumn(col) {
      let _col = {
        ...col,
        customFilterDropdown: true,
        onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
        showSorterTooltip: false,
        resizable: true
      }
      if (col._sort) {
        _col.customFilterDropdown = false
        let sortByNum = (a, b) => {
          if (a == null) return b == null ? 0 : -1
          return this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex])
        }
        let sortByStr = (a, b) => {
          if (a == null) return b == null ? 0 : -1
          return a[col.dataIndex].localeCompare(b[col.dataIndex])
        }
        _col.sorter = col._sort == "str" ? sortByStr : sortByNum
      }
      if (col._notFilter) {
        _col.customFilterDropdown = false
      }
      if (col._filter) {
        _col.customFilterDropdown = true
      }
      return _col
    },
    onSave(id, a) {
      let newTable = [...this.table]
      let i = newTable.findIndex((v) => v.id == id)
      if (i >= 0) {
        newTable[i].a = a
        this.table = newTable
      }
    },
    copy(text, key) {
      mcopy(`${text}`)
      this.shopNameCopyShows[key] = true
      setTimeout(() => (this.shopNameCopyShows = {}), 400)
    },
    isIncome(text, record) {
      if (record.platform == "美团") return this.toNum(text) < 900
      else if (record.platform == "饿了么") return this.toNum(text) < 700
      return false
    },
    isIncomeAvg(text) {
      return this.toNum(text) < 1500
    },
    isConsumeRatio(text, record) {
      return (
        (this.toNum(text) > 8 && record.income > 500) ||
        (this.toNum(text) > 15 && record.consume > 50)
      )
    },
    isCostRatio(text, record) {
      return this.toNum(text) > 53 && record.income > 500
    },
    isSettlea30(text) {
      return this.toNum(text) < 80
    },
    thresholdSuffix(name, platform) {
      let r =
        platform == "美团"
          ? [...this.rules, ...this.mtRules]
          : [...this.rules, ...this.elmRules]
      let rule = r.find((v) => v[0] == name)
      if (!rule) return ""
      let needPercent = ["consume_ratio", "cost_ratio", "settlea_30"].includes(rule[0])
        ? "%"
        : ""
      return ` / ${rule[2]}${needPercent}`
    },
    emptyVal(val) {
      return val == null || val == undefined ? "-" : val
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.editedRowKeys = distinct(
        `${this.editRowKeys}\n${this.selectedRowKeys.join("\n")}`
      ).join("\n")
    },
    table_change(pagination) {
      localStorage.setItem("date/defaultPageSize", pagination.pageSize)
    },
    shopid_click(text) {
      this.$router.push({ name: "shop", params: { shopid: text } })
    },
    viewHistoryShopTable(rec) {
      this.dateShopName = rec.shop_name
      this.dateShopTable = []
      let data = this.tablesByShop.get(rec.shop_id)
      if (data) {
        this.dateShopTable = data
        this.dateShopModal = true
        return
      }

      baseFetch({
        url: "/v1/operatings_by_shopid",
        params: {
          shop_id: rec.shop_id,
        },
      })
        .then((res) => {
          this.tablesByShop.set(rec.shop_id, res)
          this.dateShopTable = res
          this.dateShopModal = true
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    costRatioClick(_, record) {
      if (this.probClickModal == true) return
      this.shop_meta = {
        shopId: record.shop_id,
        platform: record.platform == "美团" ? "mt" : "elm",
        date: record.date,
      }
      this.probClickModal = true
    },
    ratingClick(record) {
      this.shop_meta_rates = {
        shopId: record.shop_id,
        platform: record.platform == "美团" ? "mt" : "elm",
      }
      this.ratesClickModal = true
    },
    shippingClick(record) {
      this.shop_meta_shipping = {
        shopId: record.shop_id,
        shopName: record.shop_name,
        platform: record.platform == "美团" ? "mt" : "elm",
      }
      this.shippingClickModal = true
    },
    transformTable() {
      console.log(this.table)
      return this.table
        .map((row) =>
          Object.entries(row)
            .map(([k, v]) => {
              return [this.en2zh.has(k) ? this.en2zh.get(k) : k, v]
            })
            .reduce((p, c) => ({ ...p, [c[0]]: c[1] }), {})
        )
        .map((row) => {
          let sa = (
            JSON.parse(row.a) ?? [
              { q: "低收入", a: "" },
              { q: "高推广", a: "" },
              { q: "高成本", a: "" },
              { q: "严重超跌", a: "" },
              { q: "自定义", a: "" },
              { q: "发现问题", a: "" },
              { q: "解决问题", a: "" },
              { q: "举一反三", a: "" },
            ]
          )
            .map((r) => ({
              q: r.q,
              a: r.a == "" ? null : `${r.a}\n(${r.name} ${r.time})`,
            }))
            .reduce((p, v) => ({ ...p, [v.q]: v.a }), {})

          return {
            ...row,
            ...sa,
          }
        })
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: '营推表',
        rows: this.transformTable(),
      })
    },
  },
  created() {
    app.on("excel/export-excel-res", (json) => {
      if (json.code != 0) {
        message.error(json.message)
        return
      }

      this.exporting = false
      this.tableUrl = json.data
    })

    this.getTableByDate()
  },
  mounted() {
    this.bodyRect = document.body.getBoundingClientRect()
  },
  watch: {
    $route(route) {
      if (route.name == "date") {
        this.getTableByDate()
      }
    },
  },
}
</script>

<style lang="sass">
.sub-shop-table
  width: 90vw

.modal
  padding-right: 60px

.date-shop-btn
  width: fit-content
  padding: 6px 8px
  font-weight: bold
  font-size: 1.1em
  color: #1890ff
  cursor: pointer

.cell
  display: inline-block
  width: 100%
  text-align: right

.copy-cell
  display: flex
  align-items: center
  column-gap: 4px

.copy-icon
  display: none
  font-size: 13px
  color: gray
  cursor: pointer

.copy-cell:hover .copy-icon
  display: block

.unsatisfied
  color: #fa541c

.success
  color: #52c41a

.threshold
  color: black

.unsatisfied-row
  border-color: #fff2e8
  background-color: #fff2e8

.satisfied-row
  background-color: #f6ffed

.icon-reset
  margin: 0 6px

.truncate
  max-width: 100px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.header-cell
  white-space: normal
  font-size: 0.8em

.small
  font-size: .9em

.expo
  display: block
  position: absolute
  bottom: 10px
  left: 10px
  z-index: 100

.ant-table-thead > tr > th
  border: none

.table-new-person-row
  background-color: #6ed8c71a
</style>
