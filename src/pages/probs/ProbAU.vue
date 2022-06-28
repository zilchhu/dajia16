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
      template(v-if="column.dataIndex == '申诉内容'")
        a-input(
          :value="text",
          :title="text",
          @change="(e) => handleChange(e.target.value, record)", 
          size="small"
        )
      template(v-if="column.dataIndex == '申诉结果'")
        a-select(
          :value="text",
          :options="appealResultOptions",
          :placeholder="text",
          size="small",
          @select="(value) => handleSelect(value, record)", 
          style="width: 90px"
        )
      template(
        v-else-if="['评价内容'].includes(column.dataIndex)"
      )
        .ellipsis(:title="text") {{ text }}

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
  name: "ProbAU",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      probType: "au",
      probDate: dayjs().subtract(1, "day"),
      columns: [
        {
          title: "负责人",
          dataIndex: "负责人",
          width: 70,
        },
        {
          title: "店铺ID",
          dataIndex: "店铺ID",
          width: 70,
          _filter: true,
          _sort: true,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 150,
        },
        {
          title: "平台",
          dataIndex: "平台",
          width: 70,
        },
        {
          title: "物理店",
          dataIndex: "物理店",
          width: 70,
        },
        {
          title: "评分",
          dataIndex: "评分",
          width: 70,
        },
        {
          title: "评价内容",
          dataIndex: "评价内容",
          width: 250,
        },
        {
          title: "申诉内容",
          dataIndex: "申诉内容",
          width: 250,
        },
        {
          title: "申诉结果",
          dataIndex: "申诉结果",
          width: 70,
        },
        {
          title: "评价日期",
          dataIndex: "评价日期",
          width: 100,
        },
      ],
      table: [],
      applealResultsMap: {
        未记录: 0,
        失败: 1,
        成功: 2,
      },
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    appealResultOptions() {
      return Object.keys(this.applealResultsMap).map((k) => ({ value: k }))
    },
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
        timeout = setTimeout(() => fn.apply(this, arguments), 1000)
      }
    },
    fetchTable() {
      this.loading = true

      baseFetch({
        url: "/v1/checks/au",
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
    handleChange(value, record) {
      let newTable = [...this.table]
      const i = newTable.findIndex((item) => record.key == item.key)
      if (i > -1) {
        newTable[i]["申诉内容"] = value
        this.table = newTable
        this.debounce_save(record)
      }
    },
    handleSelect(value, record) {
      let newTable = [...this.table]
      const i = newTable.findIndex((item) => record.key == item.key)
      if (i > -1) {
        newTable[i]["申诉结果"] = value
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
          url: `/v1/checks/au/${target.id}`,
          data: {
            appeal_info: target.申诉内容,
            appeal_result: this.applealResultsMap[target.申诉结果],
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
        baseName: '差评申诉详情表',
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
</style>
