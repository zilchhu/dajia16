<template lang="pug">
div
  s-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="false",
    size="small",
    :scroll="{ y: scrollY }",
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
        a-input.m-input(
          :value="text",
          @change="(e) => handleChange(e.target.value, record)", 
          size="small"
        )
      template(v-else-if="column.dataIndex == 'op'")
        a-button(type="link" title="同步最近3天数据" size="small" @click="fetchTable(true, record.shopId)") 同步

  .left-bottom-div
    a-button(type="link", size="small", @click="fetchTable(false)") 
      span(style="margin-left: 4px") 刷新
    a-button(type="link", title="同步最近3天数据" size="small", @click="fetchTable(true, -1)") 
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

export default {
  name: "AppealCounts",
  components: {
    TableSelect,
  },
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 900,
      debounceSave: null,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    columns() {
      return [
        {
          title: "店铺id",
          dataIndex: "shopId",
          width: 100,
          _sort: true,
          _filter: true,
        },
        {
          title: "店铺名称",
          dataIndex: "shop_name",
          width: 240,
          _sort: true,
          _filter: true,
        },
        {
          title: "平台",
          dataIndex: "platform",
          width: 100,
        },
        {
          title: "物理店",
          dataIndex: "real_shop_name",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "负责人",
          dataIndex: "person",
          width: 120,
        },
        {
          title: "剩余次数",
          dataIndex: "remaining_cnt",
          width: 140,
          _sort: true,
          _filter: true
        },
        {
          title: "操作",
          dataIndex: "op",
          width: 140
        },
        {
          title: "处理",
          dataIndex: "handle",
        },
      ]
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
    fetchTable(isSync = false, shopId = 0) {
      this.loading = true
      baseFetch({
        url: `/v1/checks/appeal_cnts`,
        params: {
          sync: isSync ? 1 : 0,
          shop_id: shopId
        }
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
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: "申诉剩余次数表",
        rows: this.transformTable(),
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
      let newTable = [...this.table]
      const i = newTable.findIndex((item) => record.key == item.key)
      if (i > -1) {
        newTable[i]["handle"] = value
        this.table = newTable
        this.debounceSave(record)
      }
    },
    save(record) {
      const target = this.table.filter((item) => record.key === item.key)[0]
      if (target) {
        baseFetch({
          method: "POST",
          url: "/v1/checks/handles",
          data: {
            type: 'appeal-cnt',
            key: record.handle_key ?? record.key,
            handle: target["handle"],
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

    this.debounceSave = this.debounce(this.save)
    this.fetchTable()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 204
  },
}
</script>

<style lang="sass" scoped>
.m-input
  padding: 0
  border-color: white
  color: #fa821c 
  font-weight: bold
</style>