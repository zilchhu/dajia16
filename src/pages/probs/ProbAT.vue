<template lang="pug">
div
  .header
    a-date-picker(
      v-model:value="probDate",
      @change="onSelectDate",
      :allowClear="false",
      size="small"
    )
  s-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="false",
    size="small",
    :scroll="{ y: scrollY }"
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
      template(v-if="column.dataIndex == '分析'")
        a-input.m-input(
          :value="text",
          :title="text",
          @change="(e) => handleAnalysisChange(e.target.value, record)"
        )
      template(v-else-if="column.dataIndex == '责任判定'")
        a-select.m-select(:value="text" size="small" @change="(value) => handleCompensateChange(value, record)")
          a-select-option(value="商家") 商家
          a-select-option(value="顾客") 顾客
          a-select-option(value="骑手") 骑手
      template(
        v-else-if="['派单日志', '退款原因', '提交原因'].includes(column.dataIndex)"
      )
        //- a-tooltip
        //-   template(#title)
        //-     .wrap {{ text }}
        a-tooltip(:overlayStyle="{ maxHeight: '1200px', maxWidth: '800px', width: '800px', overflow: 'auto' }")
          .ellipsis {{ text }}
          template(#title)
            .wrap {{ text }}

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
</template>

<script>
import { message } from "ant-design-vue"
import { SyncOutlined, ExportOutlined, DownloadOutlined } from "@ant-design/icons-vue"
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import dayjs from "dayjs"
import baseFetch from "../../api/base"

export default {
  name: "ProbAT",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      probType: "at",
      probDate: dayjs().subtract(1, "day"),
      columns: [
        {
          title: "负责人",
          dataIndex: "负责人",
          width: 80,
        },
        {
          title: "店铺ID",
          dataIndex: "店铺ID",
          width: 80,
          _filter: true,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 150,
          _filter: true,
          _sortStr: true,
        },
        {
          title: "平台",
          dataIndex: "平台",
          width: 70,
        },
        {
          title: "城市",
          dataIndex: "city",
          width: 70,
        },
        {
          title: "物理店",
          dataIndex: "物理店",
          width: 80,
          _filter: true,
          _sortStr: true,
        },
        {
          title: "订单序号",
          dataIndex: "订单序号",
          width: 80,
        },
        {
          title: "订单ID",
          dataIndex: "订单ID",
          width: 150,
        },
        {
          title: "派单日志",
          dataIndex: "派单日志",
          width: 300,
        },
        {
          title: "退款原因",
          dataIndex: "退款原因",
          width: 150,
        },
        {
          title: "提交原因",
          dataIndex: "提交原因",
          width: 150,
        },
        {
          title: "责任判定",
          dataIndex: "责任判定",
          width: 150,
        },
        {
          title: "分析",
          dataIndex: "分析",
          width: 200,
        },
      ],
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    extendedColumns() {
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
        if (col._sortStr) {
          _col.customFilterDropdown = false
          _col.sorter = (a, b) =>
            a[col.dataIndex]?.localeCompare((b[col.dataIndex]))
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
    scrollX() {
      return this.columns.map((col) => col.width ?? 200).reduce((p, v) => p + v, 0)
    },
    scroll() {
      // if (this.xScroll) return { y: this.scrollY, x: this.scrollX };
      return { y: this.scrollY }
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
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/at",
        params: {
          date: this.probDate.format("YYYYMMDD"),
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
    onSelectDate() {
      this.fetchTable()
    },
    handleAnalysisChange(value, record) {
      let newTable = [...this.table]
      const i = newTable.findIndex((item) => record.key == item.key)
      if (i > -1) {
        newTable[i]["分析"] = value
        this.table = newTable
        this.debounce_save(record)
      }
    },
    handleCompensateChange(value, record) {
      let newTable = [...this.table]
      const i = newTable.findIndex((item) => record.key == item.key)
      if (i > -1) {
        newTable[i]["责任判定"] = value
        this.table = newTable
        this.debounce_save(record)
      }
    },
    save(record) {
      const target = this.table.filter((item) => record.key === item.key)[0]
      if (target) {
        console.log(target)

        baseFetch({
          method: "PUT",
          url: `/v1/checks/at/${target.id}`,
          data: {
            fill_text: target.分析,
            compensate: target.责任判定
          },
        })
          .then((res) => {
            message.success(res)
          })
          .catch((err) => {
            message.error(err.message)
          })
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
        baseName: '自配送取消订单表',
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
    this.scrollY = document.body.clientHeight - 244
  },
}
</script>

<style lang="sass" scoped>
.ellipsis
  display: -webkit-box
  overflow: hidden
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical

.wrap
  white-space: pre-wrap

.m-input 
  padding: 0
  border-color: white
  font-size: 12px !important
  font-weight: bold

.m-select
  width: 100%
</style>
