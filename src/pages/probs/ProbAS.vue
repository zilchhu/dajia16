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
        a-input(
          :value="text",
          @change="(e) => handleChange(e.target.value, record)",
        )
      template(v-else-if="column.dataIndex == '单均配送'")
        .cell(
          @click.stop="() => shippingClick(record)",
          style="cursor: pointer"
        ) {{ text }}

  a-modal(
    v-model:visible="shippingClickModal",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.86"
  )
    shop-shipping(:shop_meta="shop_meta_shipping")

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
import ShopShipping from "../../components/shop/ShopShipping"
import app from "apprun"
import dayjs from "dayjs"
import baseFetch from "../../api/base"

export default {
  name: "ProbAS",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
    ShopShipping,
  },
  data() {
    return {
      probType: "as",
      probDate: dayjs().subtract(1, "day"),
      bodyRect: { width: 900, height: 800 },
      columns: [
        {
          title: "负责人",
          dataIndex: "负责人",
          width: 80,
        },
        {
          title: "城市",
          dataIndex: "城市",
          width: 80,
        },
        {
          title: "店铺ID",
          dataIndex: "店铺ID",
          width: 90,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 250,
        },
        {
          title: "平台",
          dataIndex: "平台",
          width: 80,
        },
        {
          title: "物理店",
          dataIndex: "物理店",
          width: 100,
        },
        {
          title: "第三方配送费",
          dataIndex: "第三方配送费",
          width: 100,
          _sort: true,
        },
        {
          title: "有效单",
          dataIndex: "有效单",
          width: 80,
          _sort: true,
        },
        {
          title: "单均配送",
          dataIndex: "单均配送",
          width: 80,
          _sort: true,
        },
        {
          title: "单均配送增长",
          dataIndex: "单均配送增长",
          width: 80,
          _sort: true,
        },
        {
          title: "日期",
          dataIndex: "date",
          width: 80,
          _sort: true,
          _filter: true,
        },
        {
          title: "分析",
          dataIndex: "分析",
          width: 450,
        },
      ],
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      shop_meta_shipping: { shopId: null, shopName: "", platform: null },
      shippingClickModal: false,
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
        url: "/v1/checks/as",
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
        newTable[i]["分析"] = value
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
          url: `/v1/checks/as/${target.id}`,
          data: {
            fill_text: target.分析,
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
    shippingClick(record) {
      this.shop_meta_shipping = {
        shopId: record.店铺ID,
        shopName: record.店铺名称,
        platform: record.平台 == "美团" ? "mt" : "elm",
      }
      this.shippingClickModal = true
    },
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true

      app.run("ws://", "excel/export-excel", {
        baseName: '自配送单均配送表',
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
    this.bodyRect = document.body.getBoundingClientRect()
    this.scrollY = document.body.clientHeight - 244
  },
}
</script>
