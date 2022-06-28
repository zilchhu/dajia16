<template lang="pug">
.tools-food-temp-view
  .header
    a-select(v-model:value="selectedPoiId" showSearch :filterOption="onPoiSearch" :options="poiSelectOptions" @select="onPoiSelect" size="small" style="width: 280px;")

  s-table.ant-table-change(
    size="small",
    :columns="foodColumns",
    :data-source="foodRows",
    :loading="loading",
    row-key="规格id",
    :pagination="false",
    :row-selection="null",
    :scroll="{ y: 500, x: scrollX }"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :column-title="column.title",
        :column-index="column.dataIndex",
        :table-data="foodRows",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )

  .footer
    .controls
      a-button(type="link", @click="fetchFoodRows") 刷新
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
import { message } from "ant-design-vue"
import TableSelect from "../../components/TableSelect"
import ToolsFoodDetail from "./ToolsFoodDetail"
import baseFetch from "../../api/base"

export default {
  name: "tools-food-temp-view",
  components: {
    TableSelect,
    ToolsFoodDetail,
  },
  props: ["cookie"],
  data() {
    return {
      pois: [],
      selectedPoiId: "",
      foodRows: [],
      foodColumns: [
        { title: "店铺id", dataIndex: "店铺id", width: 80 },
        { title: "店铺名称", dataIndex: "店铺名称", width: 140 },
        { title: "分类id", dataIndex: "分类id", width: 80 },
        { title: "分类名称", dataIndex: "分类名称", width: 160 },
        { title: "商品id", dataIndex: "商品id", width: 80 },
        { title: "商品名称", dataIndex: "商品名称", width: 200 },
        { title: "规格id", dataIndex: "规格id", width: 80 },
        { title: "规格名称", dataIndex: "规格名称", width: 80 },
        { title: "价格", dataIndex: "价格", width: 80 },
        { title: "餐盒费", dataIndex: "餐盒费", width: 80 },
        { title: "折扣价", dataIndex: "折扣价", width: 80 },
        { title: "折扣限购", dataIndex: "折扣限购", width: 80 },
        { title: "多规格", dataIndex: "多规格", width: 80 },
        { title: "属性加价", dataIndex: "属性加价", width: 80 },
      ],
      loading: false,
      exporting: false,
      tableUrl: null,
    }
  },
  computed: {
    scrollX() {
      return this.foodColumns.map((col) => col.width ?? 200).reduce((p, v) => p + v, 0)
    },
    extendedFoodColumns() {
      return this.extendColumn(this.foodColumns)
    },
    poiSelectOptions() {
      return this.pois.map((p) => ({ label: p.poiName, value: p.id }))
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
    extendColumn(col) {
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
    },
    fetchPois() {
      baseFetch({
        url: "/v1/tools/pois",
      })
        .then((res) => {
          this.pois = res
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    fetchFoodRows() {
      this.loading = true
      baseFetch({
        url: "/v1/tools/update-multi-skus-foods/foods",
        params: {
          cookie: this.cookie,
          poi_id: this.selectedPoiId,
        },
      })
        .then((res) => {
          this.foodRows = res
          this.loading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.loading = false
        })
    },
    onPoiSelect(value) {
      this.fetchFoodRows()
    },
    onPoiSearch(value, opt) {
      return opt.label?.includes(value)
    },
    transformTable() {
      return this.foodRows.map((row) => {
        return {
          ...this.foodColumns.reduce(
            (p, c) => ({ ...p, [c.title]: row[c.dataIndex] ?? "" }),
            {}
          ),
        }
      })
    },
    exportTable() {
      this.exporting = true
      this.tableUrl = null

      app.run("ws://", "excel/export-excel", {
        baseName: `店铺商品-${this.selectedPoiId}`,
        rows: this.transformTable(),
      })
    },
    onExportTable(json) {
      if (json.code != 0) {
        message.error(json.message)
        return
      }

      this.exporting = false
      this.tableUrl = json.data
    },
  },
  created() {
    app.on("excel/export-excel-res", this.onExportTable)

    this.fetchPois()
  },
  unmounted() {
    app.off("excel/export-excel-res", this.onExportTable)
  },
}
</script>

<style lang="sass" scoped>
.cursor-pointer
  cursor: pointer

.tools-food-temp-view
  padding: 8px

.header
  display: flex
  justify-content: space-between
  align-items: center
  height: 40px

.controls
  display: flex
  align-items: center
  column-gap: 6px

.success-res
  max-width: 300px
  max-height: 200px
  overflow: auto
  white-space: pre-wrap

.footer
  margin-top: 12px
</style>
