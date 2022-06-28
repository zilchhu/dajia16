<template lang="pug">
div
  s-table.ant-table-change(
    :columns="columns",
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
        a-input(
          :value="text",
          @change="(e) => handleChange(e.target.value, record)", 
          size="small"
        )
      template(v-else-if="column.dataIndex == 'balances'")
        div(v-html="renderBalances(text)")

    template(#handle="{ text, record }")
      a-input(
        :value="text",
        @change="(e) => handleChange(e.target.value, record)", 
        size="small"
      )

  .left-bottom-div(v-show="!loading" style="min-width: 400px")
    div(style="display: flex; align-items: center; column-gap: 6px; margin-right: 8px; font-size: 10px;") 
      span 变化天数
      div(style="min-width: 160px")
        a-slider(v-model:value="day", :min="1", :max="10")
        
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
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import baseFetch from "../../api/base"

export default {
  name: "ProbAH",
  components: {
    TableSelect,
  },
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      debounce_fetch: null,
      day: 2,
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
          customFilterDropdown: true,
          onFilter: (value, record) => (record.person ?? "") == value,
        },
        {
          title: "店铺id",
          dataIndex: "shop_id",
          width: 110,
          customFilterDropdown: true,
          onFilter: (value, record) => record.shop_id == value,
        },
        {
          title: "店铺名称",
          dataIndex: "shop_name",
          width: 250,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.shop_name ?? "") == value,
        },
        {
          title: "平台",
          dataIndex: "platform",
          width: 70,
          customFilterDropdown: true,
          onFilter: (value, record) => record.platform == value,
        },
        {
          title: "物理店",
          dataIndex: "real_shop_name",
          width: 90,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.real_shop_name ?? "") == value,
        },
        {
          title: "余额变化",
          dataIndex: "balances",
        },
        {
          title: "处理",
          dataIndex: "handle",
        },
      ]
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
    fetchTable() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/ah",
        params: {
          day: this.day - 1,
        },
      })
        .then((res) => {
          this.table = res
          this.loading = false
        })
        .catch((err) => {
          message.error(err)
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
            type: "ah",
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
    renderBalances(text) {
      if (!text) return text
      return text
        .split("->")
        .map(parseFloat)
        .map((v, i, a) =>
          v < a[i + 1]
            ? `<span style="text-decoration: underline dotted orange;">${v}</span>`
            : i == a.length - 1 && v > 0 && v < 20
              ? `<span style="text-decoration: underline dotted red;">${v}</span>`
              : `<span>${v}</span>`
        )
        .join("<span>-></span>")
    },
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: "推广费余额表",
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
    this.debounce_fetch = this.debounce(this.fetchTable)
    this.fetchTable()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 204
  },
  watch: {
    day() {
      this.debounce_fetch()
    },
  },
}
</script>

<style lang="sass" scoped>
.pre
  white-space: pre-wrap

.day-slider
  display: flex
  align-items: center
  position: absolute
  max-height: 40px
  bottom: 0px
  left: 10px
  z-index: 100
</style>
