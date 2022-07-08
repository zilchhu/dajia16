<template lang="pug">
div
  div(style="font-weight: bold;") 差评 {{ platform }} {{ shopId }} {{ shopName }}

  a-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 20, pageSizeOptions: ['20', '50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (isSameDay(rateDate, record.commentTime) ? 'bg-yellow' : null)"
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
      template(v-else-if="column.dataIndex == 'criticFoodNames'")
        div
          span(v-for="food in text" :key="food") {{ food }}
      template(v-else-if="column.dataIndex == 'praiseFoodNames'")
        div
          span(v-for="food in text" :key="food") {{ food }}
      template(v-else-if="column.dataIndex == 'status'")
        div(:class="{ 'text-teal': ['已删除', '无责差评', '申诉成功'].includes(text) }") {{ text }}

  div(style="display: flex; align-items: center; column-gap: 6px;")
    a-button(type="link", size="small", @click="fetchTable(false)") 
      span(style="margin-left: 4px") 刷新
    a-button(type="link", size="small", @click="fetchTable(true)" title="同步最近5天数据从平台") 
      span(style="margin-left: 4px") 同步
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 
      span(style="margin-left: 4px") 导出
    a(
      v-show="tableUrl",
      :href="tableUrl",
      target="_blank"
    ) 
      span 下载
</template>

<script>
import { message } from "ant-design-vue"
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import baseFetch from "../../api/base"
import dayjs from "dayjs"

export default {
  name: "RateFollowUpBadMedComms",
  components: {
    TableSelect,
  },
  props: ["platform", "shopId", "shopName", "rateDate"],
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 500,
      debounceSave: null,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    columns() {
      return [
        {
          title: "评分",
          dataIndex: "score",
          width: 80,
          _sort: true,
          _filter: true,
        },
        {
          title: "超时",
          dataIndex: "overDeliveryTime",
          width: 80,
          _sort: true,
          _filter: true,
        },
        {
          title: "评价",
          dataIndex: "comment",
          width: 200,
        },
        {
          title: "点踩商品",
          dataIndex: "criticFoodNames",
          width: 160,
        },
        {
          title: "点赞商品",
          dataIndex: "praiseFoodNames",
          width: 160,
        },
        {
          title: "详情",
          dataIndex: "commentDetail",
          width: 160,
        },
        {
          title: "状态",
          dataIndex: "status",
          width: 80,
        },
        {
          title: "订单",
          dataIndex: "orderId",
          width: 100,
        },
        {
          title: "时间",
          dataIndex: "commentTime",
          width: 100,
          sorter: (a, b) => a.commentTime?.localeCompare(b.commentTime),
        }
      ]
    },
    extendedColumns(cols) {
      return this.columns.map((col) => {
        let _col = {
          ...col,
          customFilterDropdown: true,
          onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
          showSorterTooltip: false,
        }
        if (col._sort) {
          _col.customFilterDropdown = false
          _col.sorter = (a, b) =>
            this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex])
        }
        if (col._notFilter) {
          _col.customFilterDropdown = false
        }
        if (col._filter) {
          _col.customFilterDropdown = true
        }
        return _col
      })
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
    fetchTable(isSync = false) {
      this.loading = true
      baseFetch({
        url: `/v3/checks/badmed_comments/${this.platform}/${this.shopId}`,
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
    isSameDay(a, b) {
      return (
        dayjs(a).isSame(dayjs(b), "day") ||
        dayjs(a).subtract(1, "day").isSame(dayjs(b), "day")
      )
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

    this.fetchTable()
  },
  watch: {
    shopId() {
      this.fetchTable()
    },
  },
}
</script>

<style lang="sass" scoped>
.text-gray
  color: #9ca3af

.pr-1
  padding-right: 0.5em 

.text-teal
  color: #2dd4bf

.comment-analysis
  font-size: 0.886em
  color: #ccc
  white-space: pre
</style>

<style lang="sass">
.bg-yellow
  background-color: #fef08a1a
</style>