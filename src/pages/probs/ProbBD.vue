<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
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
      template(v-if="column.dataIndex == 'handle'")
        a-input(
          :value="text",
          @change="(e) => handleChange(e.target.value, record)", 
          size="small"
        )
      template(v-else-if="['规则', '昨天规则'].includes(column.dataIndex)")
        span.pre {{ text }}

  .left-bottom-div(v-show="!loading")
    a-button(type="link", size="small", @click="fetchTable") 刷新
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
import { message } from "ant-design-vue"
import dayjs from "dayjs"
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import baseFetch from "../../api/base"

export default {
  name: "ProbBD",
  components: {
    TableSelect,
  },
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    columns() {
      return [
        {
          title: "责任人",
          dataIndex: "person",
          width: 80,
        },
        {
          title: "店铺编号",
          dataIndex: "shop_id",
          width: 100,
        },
        {
          title: "店铺名称",
          dataIndex: "shop_name",
          width: 250,
        },
        {
          title: "平台",
          dataIndex: "platform",
          width: 80,
        },
        {
          title: "物理店",
          dataIndex: "real_shop_name",
          width: 80,
        },
        {
          title: "种类",
          dataIndex: "种类",
          width: 100,
        },
        {
          title: "昨天种类",
          dataIndex: "昨天种类",
          width: 100,
        },
        {
          title: "规则",
          dataIndex: "规则",
        },
        {
          title: "昨天规则",
          dataIndex: "昨天规则",
        },
        {
          title: "处理",
          dataIndex: "handle",
          width: 150,
        },
      ].map(this.extendColumn)
    },
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map((row) => row[colName] ?? "")))
        .sort()
        .map((col) => ({
          label: col,
          value: col,
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
    extendColumn(col) {
      let _col = {
        ...col,
        customFilterDropdown: true,
        onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
        showSorterTooltip: false,
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
    fetchTable() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/bd",
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
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    handleChange(value, record) {
      const target = this.table.filter((item) => record.key === item.key)[0]
      if (target) {
        target["handle"] = value
        this.debounce_save(record)
      }
    },
    save(record) {
      const target = this.table.filter((item) => record.key === item.key)[0]
      if (target) {
        baseFetch({
          method: "POST",
          url: "/v1/checks/handles",
          data: {
            type: "bd",
            key: record.key,
            handle: target["handle"],
          },
        })
          .then((res) => {
            console.log(res)
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
        baseName: "满减变化表",
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
.pre
  white-space: pre-wrap
</style>
