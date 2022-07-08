<template lang="pug">
div
  a-table.ant-table-change(
    :columns="extendedCols",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 20, pageSizeOptions: ['20', '50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
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
      template(v-if="column.dataIndex == 'score'")
        span {{ '⭐'.repeat(text) }}
      template(v-else-if="column.dataIndex == 'comment'")
        div
          div(v-html="markComment(text, record.analysisItems)")
          div(v-show="record.riderComment")
            span.text-gray.pr-1 配送:
            span {{ record.riderComment }}
          .comment-analysis {{ record.analysisItems?.map(ana => `${ana.aspectCategory} ${ana.aspectPolarity}`).join('  ') }}
          a-image-preview-group
            a-image(v-for="url in record.imageUrls" :key="url" :width="50" :src="url")
          span.span-btn(@click="appealComment(record)") 申诉
      template(v-else-if="column.dataIndex == 'criticFoodNames'")
        div
          span.pr-1.text-gray 点踩商品:
          span(v-for="food in record.criticFoodNames" :key="food") {{ food }}
        div
          sapn.pr-1.text-gray 点赞商品:
          span(v-for="food in record.praiseFoodNames" :key="food") {{ food }}

      template(v-else-if="column.dataIndex == 'status'")
        div(:class="{ 'text-teal': ['已删除', '无责差评', '申诉成功'].includes(text) }") {{ text }}

  a-drawer.elm-drawer(v-model:visible="elmFrameShow")
    iframe(:src="elmFrameSrc")

  a-drawer.mt-drawer(v-model:visible="mtFrameShow" size="large")
    iframe(:src="mtFrameSrc")

  .left-bottom-div
    a-button(type="link" size="small" :loading="loading" @click="fetchTable(false)") 
      span(style="margin-left: 4px") 刷新
    a-button(type="link" size="small" title="同步最新数据从美团/饿了么平台" :loading="loading" @click="fetchTable(true)") 
      span(style="margin-left: 4px") 同步
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
</template>

<script>
import { message } from "ant-design-vue"
import ColumnFilter from "../../components/ColumnFilter"
import { SyncOutlined, ExportOutlined, DownloadOutlined } from "@ant-design/icons-vue"
import app from "apprun"
import baseFetch from "../../api/base"

export default {
  name: "BadMedComms",
  components: {
    ColumnFilter,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      table: [],
      tableFilters: {},
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      elmFrameShow: false,
      elmFrameSrc: '',
      mtFrameShow: false,
      mtFrameSrc: ''
    }
  },
  computed: {
    columns() {
      return [
        {
          key: 'platform',
          title: "平台",
          dataIndex: "platform",
          width: 60,
          _filter: true
        },
        {
          key: 'shopId',
          title: "店铺ID",
          dataIndex: "shopId",
          width: 85,
          _filter: true
        },
        {
          key: "shopName",
          title: "店铺名称",
          dataIndex: "shopName",
          width: 100,
          _filter: true,
        },
        {
          key: "realShopName",
          title: "物理店",
          dataIndex: "realShopName",
          width: 75,
          _filter: true,
          _sort: true,
          _sortMethod: 'str'
        },
        {
          key: "city",
          title: "城市",
          dataIndex: "city",
          width: 60,
          _filter: true,
        },
        {
          key: "score",
          title: "评分",
          dataIndex: "score",
          width: 70,
          _sort: true,
          _filter: true,
        },
        {
          key: "overDeliveryTime",
          title: "超时",
          dataIndex: "overDeliveryTime",
          width: 70,
          align: "right",
          _sort: true,
          _filter: true,
        },
        {
          key: "comment",
          title: "评价",
          dataIndex: "comment",
          width: 240,
          _filter: true,
        },
        {
          key: "reAppealCnt",
          title: "申诉剩余",
          dataIndex: "reAppealCnt",
          width: 80,
          align: "right",
          _sort: true,
          _filter: true,
        },
        {
          key: "criticFoodNames",
          title: "点赞/点踩",
          dataIndex: "criticFoodNames",
          width: 160,
          _filter: true,
        },
        {
          key: "commentDetail",
          title: "详情",
          dataIndex: "commentDetail",
          width: 160,
          _filter: true,
        },
        {
          key: "status",
          title: "状态",
          dataIndex: "status",
          width: 70,
          _filter: true,
        },
        {
          key: "orderId",
          title: "订单",
          dataIndex: "orderId",
          width: 80,
          _filter: true,
        },
        {
          key: "commentTime",
          title: "时间",
          dataIndex: "commentTime",
          width: 100,
          _filter: true,
          _sort: true,
          _sortMethod: 'str',
          _filterPanes: [{ key: 'text', label: '值', sortMethod: 'str', sortDirection: 'desc' }],
        },
        {
          key: "person",
          title: "负责人",
          dataIndex: "person",
          width: 60,
          _filter: true,
        },
      ]
    },
    extendedCols() {
      return this.columns.map(col => ({
        customFilterDropdown: col._filter,
        onFilter: (value, record) => record[col.dataIndex] == value,
        _filterPanes: [{ key: 'text', label: '值', sortMethod: col._sortMethod, sortDirection: 'asc' }],
        _customFilterOption: (row, col) => ({ value: row[col.dataIndex], text: this.toString(row[col.dataIndex]), color: 'white' }),
        showSorterTooltip: false,
        sorter: col._sort
          ? col._sortMethod == 'str'
            ? (a, b) => a[col.dataIndex]?.localeCompare(b[col.dataIndex], 'zh-Hans-CN')
            : (a, b) => this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex])
          : null,
        ...col
      }))
    },
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map((row) => row[colName]))).map((col) => ({
        label: col || "",
        value: col || "",
      }))
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
    toString(val) {
      if (val == null) return ''
      if (typeof val == 'string') return val
      return JSON.stringify(val)
    },
    fetchTable(isSync = false) {
      this.loading = true
      baseFetch({
        url: "/v3/checks/badmed_comments",
        params: {
          sync: isSync ? 1 : 0,
        },
      })
        .then((res) => {
          this.table = res
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
    markComment(comment = '', analysisItems = []) {
      if (analysisItems.length == 0) return comment

      let html = ''
      for (let i = 0; i < comment.length; i++) {
        for (let ana of analysisItems) {
          let [si, ei] = ana.clauseIndex.split(',')
          if (i == si) {
            html += `<mark>`
            break
          }
          if (i == ei) {
            html += `</mark>`
            break
          }
        }
        html += comment[i]
      }
      return html
    },
    appealComment(rec) {
      if (rec.platform == '饿了么') {
        baseFetch({
          url: `/v1/checks/badmed_comments/elm/${rec.shopId}/${rec.commentId}/frames/appeal`,
        })
          .then((res) => {
            this.elmFrameSrc = res.src
            this.elmFrameShow = true
          })
          .catch((err) => {
            message.error(err.message)
          })
      } else {
        baseFetch({
          url: `/v1/checks/badmed_comments/mt/${rec.shopId}/frames/comment_list`,
        })
          .then((res) => {
            this.mtFrameSrc = res.src
            this.mtFrameShow = true
          })
          .catch((err) => {
            message.error(err.message)
          })
      }
    },
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: "差评表",
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
    this.scrollY = document.body.clientHeight - 204
  },
}
</script>

<style lang="sass" scoped>
.comment-analysis
  font-size: 0.886em
  color: #ccc
  white-space: pre

.bg-yellow
  background-color: #fef08a1a

.text-gray
  color: #9ca3af

.pr-1
  padding-right: 0.5em 

.text-teal
  color: #2dd4bf

.span-btn
  display: block
  cursor: pointer
  color: #1890ff

.comment-analysis
  font-size: 0.886em
  color: #ccc
  white-space: pre

iframe
  border: none
  width: 100%
  height: 100%
  position: absolute
  top: 0
  right: 0
  left: 0
  bottom: 0
</style>

<!-- <style lang="sass">
.mt-drawer .ant-drawer-content-wrapper
  width: 800px

.elm-drawer .ant-drawer-content-wrapper
  width: 400px
</style> -->
