<template lang="pug">
div
  a-table.ant-table-change(
    rowKey="shop_id",
    :loading="loading",
    :columns="extendedCols",
    :data-source="table",
    :pagination="{ showSizeChanger: true, defaultPageSize: 20, pageSizeOptions: ['20', '50', '100', '200', '400'], size: 'small' }",
    :scroll="scroll"
    size="small",
    @change="onTableChange"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      column-filter(
        :column="column"
        :table="table"
        :tableFilters="tableFilters"
        :filterPanes="column._filterPanes"
        :customFilterOption="column._customFilterOption",
        :selectedKeys="selectedKeys"
        :setSelectedKeys="setSelectedKeys"
        :confirm="confirm"
        :clearFilters="clearFilters"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column._tag == 'date'")
        div(v-if="text")
          .pointer(:class="{ red: text.rate && text.rate < 4.7 }" @click="openCommsModal(record, text.date)") 评分: {{ text.rate || '-' }}
          .m-content(v-if="text.is_old_day") {{ text.content }}
          a-textarea.m-textarea(
            v-else
            :value="text.content"
            placeholder="跟进处理"
            @change="(e) => handleChange(e.target.value, record.shop_id, column.dataIndex, text.id)"
            autoSize
            :spellcheck="false"
          )

  .left-bottom-div
    a-button(type="link", size="small", @click="fetchTable") 
      SyncOutlined
      span(style="margin-left: 4px") 刷新
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 
      ExportOutlined
      span(style="margin-left: 4px") 导出
    a(
      v-show="tableUrl",
      :href="tableUrl",
      target="_blank"
    ) 
      DownloadOutlined
      span 下载

  a-modal(
    v-model:visible="commsModalShow"
    :footer="null",
    centered,
    :width="bodyRect.width * 0.88"
  )
    BadComms(:platform="commsPlatform" :shopId="commsShopId" :shopName="commsShopName" :rateDate="commsRateDate")
</template>

<script>
import { message } from "ant-design-vue"
import { SyncOutlined, ExportOutlined, DownloadOutlined } from "@ant-design/icons-vue"
import ColumnFilter from "../../components/ColumnFilter"
import BadComms from "./RateFollowUpBadComms"
import app from "apprun"
import baseFetch from "../../api/base.js"

export default {
  name: "RateFollowUp",
  components: {
    ColumnFilter,
    BadComms,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      bodyRect: { width: 900, height: 800 },
      columns: [],
      table: [],
      tableFilters: {},
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      commsModalShow: false,
      commsPlatform: "",
      commsShopId: "",
      commsShopName: "",
      commsRateDate: ""
    }
  },
  computed: {
    scrollX() {
      return this.columns.map((col) => col.width ?? 200).reduce((p, v) => p + v, 0)
    },
    scroll() {
      return { y: this.scrollY, x: this.scrollX }
    },
    extendedCols() {
      return this.columns.map(col => ({
        customFilterDropdown: col._filter,
        onFilter: (value, record) => record[col.dataIndex] == value,
        _filterPanes: [{ key: 'text', label: '内容' }],
        _customFilterOption: (row, col) => ({ value: row[col.dataIndex], text: this.toString(row[col.dataIndex]), color: 'white' }),
        showSorterTooltip: false,
        sorter: col._sort ? (a, b) => this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]) : null,
        ...col
      }))
    },
  },
  methods: {
    toNum(str) {
      try {
        let f = parseFloat(str)
        if (isNaN(f)) return 0
        return f
      } catch (err) {
        return 0
      }
    },
    toString(val) {
      if (val == null) return ''
      if (typeof val == 'string') return val
      return JSON.stringify(val)
    },
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 1500)
      }
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: `/v1/checks/rate_follow_ups`,
      })
        .then((res) => {
          this.columns = [
            { key: "platform", title: "平台", dataIndex: "platform", width: 60, fixed: "left", _filter: true },
            { key: "shop_id", title: "店铺id", dataIndex: "shop_id", width: 100, fixed: "left", _filter: true },
            { key: "shop_name", title: "店铺名称", dataIndex: "shop_name", width: 130, fixed: "left", _filter: true },
            { key: "real_shop_name", title: "物理店", dataIndex: "real_shop_name", width: 80, fixed: "left", _filter: true },
            { key: "person", title: "负责人", dataIndex: "person", width: 70, fixed: "left", _filter: true },
            { key: "city", title: "城市", dataIndex: "city", width: 60, _filter: true },
            ...res.dates.map((date) => ({
              key: date,
              title: date,
              dataIndex: date,
              width: 180,
              _tag: "date",
              _filter: true,
              _filterPanes: [
                { key: 'rate', label: '评分' },
                { key: 'content', label: '处理' },
                { key: 'text', label: '值' },
                { key: 'color', label: '颜色' },
              ],
              _customFilterOption: (row, col) => ({
                value: row[col.dataIndex],
                text: this.toString(row[col.dataIndex]),
                rate: this.toString(row[col.dataIndex]?.rate),
                content: this.toString(row[col.dataIndex]?.content),
                color: row[col.dataIndex]?.rate && row[col.dataIndex]?.rate < 4.7 ? 'red' : 'white'
              }),
            })),
          ]
          this.table = res.rates
          this.loading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.loading = false
        })
    },
    onTableChange(pagination, filters, sorter, { currentDataSource }) {
      this.tableFilters = filters
    },
    handleChange(value, shop_id, col, id) {
      const i = this.table.findIndex((item) => item.shop_id == shop_id)
      if (i > -1) {
        this.table[i][col].content = value
        this.debounce_save(value, id)
      }
    },
    save(value, id) {
      baseFetch({
        method: "PUT",
        url: `/v1/checks/rate_follow_ups/${id}`,
        data: {
          content: value,
        },
      })
        .then((res) => {
          message.success(res)
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    openCommsModal(rec, rateDate) {
      this.commsPlatform = rec.platform
      this.commsShopId = rec.shop_id
      this.commsShopName = rec.shop_name
      this.commsRateDate = rateDate
      this.commsModalShow = true
    },
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: '评分跟进表',
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

    this.debounce_save = this.debounce(this.save)
    this.fetchTable()
  },
  mounted() {
    this.bodyRect = document.body.getBoundingClientRect()
    this.scrollY = document.body.clientHeight - 204
  },
}
</script>

<style lang="sass" scoped>
.m-textarea
  padding: 0
  border-color: white
  font-size: 12px !important
  font-weight: bold

.m-content
  padding: 0
  font-size: 12px !important
  font-weight: bold

.red
  color: red

.pointer
  cursor: pointer
</style>
