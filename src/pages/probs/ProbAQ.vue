<template lang="pug">
div
  a-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="showedTable",
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
        :tableData="showedTable",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == 'handle'")
        div(:title="text")
          a-textarea.m-textarea(
            :value="text",
            @change="(e) => handleChange(e.target.value, record)", 
            size="small"
            autoSize
          )

  .left-bottom-div
    a-checkbox(v-model:checked="onlyShowHasNoActs" size="small") 仅显示无活动店铺
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
import baseFetch from "../../api/base"

export default {
  name: "ProbAQ",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  props: ["xScroll"],
  data() {
    return {
      probType: 'aq',
      columns: [
        {
          title: "责任人",
          dataIndex: "person",
          width: 80,
        },
        {
          title: "店铺id",
          dataIndex: "shop_id",
          width: 90,
        },
        {
          title: "店名",
          dataIndex: "shop_name",
          width: 250,
        },
        {
          title: "物理店",
          dataIndex: "real_shop_name",
          width: 100,
        },
        {
          title: "超级吃货红包",
          dataIndex: "超级吃货红包",
        },
        {
          title: "下单返红包",
          dataIndex: "下单返红包",
        },
        {
          title: "吃货红包",
          dataIndex: "吃货红包",
        },
        {
          title: "集点返红包",
          dataIndex: "集点返红包",
        },
        {
          title: "店铺满赠",
          dataIndex: "店铺满赠",
        },
        {
          title: "处理",
          dataIndex: "handle",
        },
      ],
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      onlyShowHasNoActs: true
    }
  },
  computed: {
    showedTable() {
      if (this.onlyShowHasNoActs) return this.table.filter(v => [v.超级吃货红包, v.下单返红包, v.吃货红包, v.集点返红包, v.店铺满赠].some(k => this.isEmpty(k)))
      return this.table
    },
    extendedColumns() {
      return this.columns.map((col) => {
        let _col = {
          ...col,
          customFilterDropdown: true,
          onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
          resizable: true
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
      if (this.xScroll) return { y: this.scrollY, x: this.scrollX }
      return { y: this.scrollY }
    },
  },
  methods: {
    isEmpty(val) {
      return val == null || val == ''
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
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 1200)
      }
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: `/v1/checks/${this.probType}`,
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
    handleChange(value, record) {
      const i = this.table.findIndex((item) => record.key == item.key)
      if (i > -1) {
        this.table[i]["handle"] = value
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
            type: this.probType,
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
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: this.probType,
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
.m-textarea
  padding: 0
  border-color: white
  color: #fa821c 
  font-weight: bold
</style>