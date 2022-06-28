<template lang="pug">
div
  a-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="shop_id",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 50, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="scroll"
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
      template(v-if="column._tag == 'date'")
        div(v-if="text")
          div.m-labor-cnt  
            span.label 人数: 
            .m-labor-content(v-if="text.is_old_day") {{ text.labor_count }}
            a-input.m-input(
              v-else
              type="number"
              placeholder="人数"
              :value="text.labor_count"
              @change="(e) => handleLaborCountChange(e.target.value, record.real_shop_name, column.dataIndex, text.id)"
            )
          .m-content(v-if="text.is_old_day") {{ text.content }}
          a-textarea.m-textarea(
            v-else
            :value="text.content"
            placeholder="跟进处理"
            @change="(e) => handleContentChange(e.target.value, record.real_shop_name, column.dataIndex, text.id)"
            autosize
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
</template>

<script>
import { message } from "ant-design-vue"
import { SyncOutlined, ExportOutlined, DownloadOutlined } from "@ant-design/icons-vue"
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import baseFetch from "../../api/base"

export default {
  name: "LaborEffiencyFollowUp",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      columns: [],
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
      return { y: this.scrollY, x: this.scrollX }
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
        timeout = setTimeout(() => fn.apply(this, arguments), 1500)
      }
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: `/v1/checks/labor_effiency_follow_ups`,
      })
        .then((res) => {
          this.columns = [
            { title: "物理店", dataIndex: "real_shop_name", width: 80, fixed: "left" },
            { title: "负责人", dataIndex: "person", width: 70, fixed: "left" },
            { title: "城市", dataIndex: "city", width: 60 },
            ...res.dates.map((date) => ({
              title: date,
              dataIndex: date,
              width: 180,
              _tag: "date",
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
    handleLaborCountChange(value, real_shop_name, col, id) {
      if (value == null || !value.match(/^\d+$/)) return
      const i = this.table.findIndex((item) => item.real_shop_name == real_shop_name)
      if (i > -1) {
        this.table[i][col].labor_count = parseInt(value)
        this.debounce_save(id, parseInt(value), this.table[i][col].content)
      }
    },
    handleContentChange(value, real_shop_name, col, id) {
      const i = this.table.findIndex((item) => item.real_shop_name == real_shop_name)
      if (i > -1) {
        this.table[i][col].content = value
        this.debounce_save(id, this.table[i][col].labor_count, value)
      }
    },
    save(id, laborCount, content) {
      baseFetch({
        method: "PUT",
        url: `/v1/checks/labor_effiency_follow_ups/${id}`,
        data: {
          labor_count: laborCount,
          content,
        },
      })
        .then((res) => {
          message.success(res)
        })
        .catch((err) => {
          message.error(err.message)
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
        baseName: "人效跟进表",
        json: this.transformTable(),
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
  font-size: 12px !important
  font-weight: bold

.m-input
  padding: 0
  max-width: 140px
  border-color: white
  font-weight: bold

.m-content
  padding: 0
  font-size: 12px !important
  font-weight: bold

.m-labor-cnt
  display: flex
  align-items: center
  column-gap: 4px
  margin-bottom: 4px

  .label
    flex-shrink: 0

  .m-labor-content
    padding: 0
    max-width: 140px
    font-weight: bold

</style>
