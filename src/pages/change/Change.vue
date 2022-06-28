<template lang="pug">
div
  a-table.ant-table-change(
    :columns="changes_cols",
    :data-source="changes",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)",
    size="small",
    :scroll="{ y: scrollY }"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="changes",
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
      template(v-else-if="column.dataIndex == 'shop_id'")
        router-link.small(
          :to="{ name: 'shop', params: { shopid: text }, query: { name: record.shop_name } }"
        ) {{ text }}
      template(v-else-if="column.dataIndex == 'person'")
        router-link.small(
          :to="{ name: 'user', params: { username: text || '-', date: 0 } }"
        ) {{ text }}
      template(
        v-else-if="column.dataIndex == 'before_rule' || column.dataIndex == 'after_rule'"
      )
        a-tooltip(v-if="text.length < 3")
          template(#title)
            div(v-for="item in text")
              .rule {{ item.rule }}
              .rule {{ item.date }}
              .mini {{ item.insert_date }}
          .rule(
            :class="{ 'after-rule': record.after_rule.length == 0, 'before-rule': record.before_rule.length == 0 }"
          ) {{ text.map((v) => v.rule).join('\n\n') }}
        .rule(
          v-else,
          :class="{ 'after-rule': record.after_rule.length == 0, 'before-rule': record.before_rule.length == 0 }"
        ) {{ text.map((v) => v.rule).join('\n\n') }}

  .left-bottom-div(v-show="!loading")
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
import app from "apprun"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { LoadingOutlined } from "@ant-design/icons-vue"
import TableSelect from "../../components/TableSelect"
import baseFetch from "../../api/base"

function extendColumn(col) {
  let _col = {
    ...col,
    customFilterDropdown: true,
    onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
    showSorterTooltip: false,
  }
  if (col._sort) {
    _col.customFilterDropdown = false
    _col.sorter = (a, b) => this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex])
  }
  if (col._notFilter) {
    _col.customFilterDropdown = false
  }
  if (col._filter) {
    _col.customFilterDropdown = true
  }
  return _col
}

export default {
  name: "change",
  components: {
    LoadingOutlined,
    TableSelect,
  },
  data() {
    return {
      loading: false,
      changes: [],
      changes_cols: [
        {
          title: "门店id",
          dataIndex: "shop_id",
          width: 90,
        },
        {
          title: "店名",
          dataIndex: "shop_name",
          width: 250,
        },
        {
          title: "平台",
          dataIndex: "platform",
          width: 70,
        },
        {
          title: "物理店",
          dataIndex: "real_shop_name",
          width: 80,
        },
        {
          title: "负责",
          dataIndex: "person",
          width: 70,
        },
        {
          title: "组长",
          dataIndex: "leader",
          width: 70,
        },
        {
          title: "活动",
          dataIndex: "title",
          width: 110,
          ellipsis: true,
        },
        {
          title: "变化前",
          dataIndex: "before_rule",
          _notFilter: true,
        },
        {
          title: "变化后",
          dataIndex: "after_rule",
          _notFilter: true,
        },
        {
          title: "处理",
          dataIndex: "handle",
        },
        {
          title: "变化日期",
          dataIndex: "change_date",
          width: 100,
        },
      ].map(extendColumn),
      scrollY: 900,
      debounce_save: null,
      defaultPageSize: 100,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    distinct_titles() {
      let titles = Array.from(new Set(this.changes.map((v) => v.title)))
      console.log(titles)
      return titles
    },
  },
  methods: {
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    fetch_changes() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/shop_acts_diffs",
      })
        .then((res) => {
          this.changes = res
          this.loading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.loading = false
        })
    },
    handleChange(value, record) {
      const target = this.changes.filter((item) => record.key === item.key)[0]
      if (target) {
        target["handle"] = value
        this.debounce_save(record)
      }
    },
    save(record) {
      const target = this.changes.filter((item) => record.key === item.key)[0]
      if (target) {
        target["saving"] = true
        baseFetch({
          method: "PUT",
          url: `/v1/checks/shop_acts_diffs/${record.key}`,
          data: {
            handle: target["handle"],
          },
        })
          .then((res) => {
            console.log(res)
            target["saving"] = false
          })
          .catch((err) => {
            message.error(err.message)
            target["saving"] = true
          })
        // console.log(this.changes)
      }
    },
    transformTable() {
      return this.changes.map((row) =>
        this.changes_cols.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: '变化表',
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
    this.fetch_changes()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 154
  },
}
</script>

<style lang="sass">
.rule
  white-space: pre-wrap

.after-rule, .ant-table-change td:has(> .after-rule)
  background: #b5efdb

.before-rule, .ant-table-change td:has(> .before-rule)
  background: #ffc4c1

.mini
  font-size: 11px
  color: gray

.truncate
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.ant-table-change .ant-table-thead > tr > th
  background: white
  border-bottom: 1px solid rgba(180,247,255,.2)

.ant-table-change span.ant-table-column-title, .ant-table-change td, .ant-table-change .ant-input, .ant-table-change .ant-table-thead > tr > th, .small
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"
  font-size: 0.886em
  color: #2c363c

.ant-table-change .surely-table-cell-content
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"
  font-size: 0.886em
  color: #2c363c

.ant-table-change .ant-select-item .ant-select-item-option, .ant-table-change .ant-select-selection-item
  font-size: 0.886em

.ant-table-change svg[data-icon="filter"]
  width: 10px
  height: 10px

.ant-table-change .table-striped
  background-color: #fafafa

.ant-table-change .row-error
  background-color: rgba(255, 0, 0, .6)

.ant-table-change .row-succ
  background-color: rgba(0, 255, 0, .6)

.ant-table-change .ant-input-sm
  border-color: white
  padding: 0

.ant-table-change .ant-input-sm:hover
  border-color: #40a9ff

// .ant-table-change .ant-input-affix-wrapper > input.ant-input, .ant-table-change .ant-input-sm
//   color: #fa821c

.left-bottom-div
  display: flex
  align-items: center
  column-gap: 12px
  position: fixed
  max-height: 40px
  bottom: 15px
  left: 4px
  z-index: 100

.left-bottom-div button, .left-bottom-div a
  font-size: 12px
</style>
