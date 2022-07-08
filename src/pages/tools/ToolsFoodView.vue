<template lang="pug">
.tool-food-view
  .header(v-if="viewType && viewType != 'plain'")
    div {{ viewType == 'inputs' ? '文件' : `结果-${taskId}` }}

  s-table.ant-table-change(
    size="small",
    :columns="columns",
    :data-source="table",
    :loading="loading"
    row-key="_i",
    :pagination="false",
    :row-selection="viewType != 'plain' ? { selectedRowKeys: selectedRowKeys, onChange: onRowSelect } : null",
    :scroll="{ y: scrollY, x: scrollX }"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :column-title="column.title",
        :column-index="column.dataIndex",
        :table-data="table",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.title == '序号'")
        div {{ +text + 1 }}
      template(v-else-if="column.dataIndex == '商品名称'")
        .cursor-pointer(@click="viewFoodDetail(record._i)") {{ text }}
      template(v-else-if="column.dataIndex == 'resultStatus'")
        a-tooltip
          template(#title)
            div(v-if="text == '失败'") {{ record.error }}
            .success-res(v-else) {{ JSON.stringify(record.result, null, 2) }}
          a-tag(v-if="text", :color="text == '失败' ? 'error' : 'success'") {{ text }}

      template(v-if="column.title == '操作' && taskType == '替换美团外卖商品'")
        div(title="恢复商品为替换前状态")
          a-button(type="link", size="small", @click="restoreSub(record)") 恢复

  a-modal(
    v-model:visible="foodDetailModalShow",
    :title="`商品-${taskId ?? ''}-${foodDetailI ? foodDetailI + 1 : ''}`",
    :footer="null",
    centered,
    :width="800"
  )
    tools-food-detail(:taskId="taskId", :i="foodDetailI")

  .footer(v-if="viewType && viewType != 'plain'")
    .controls
      a-button(type="link", @click="fetchTable") 刷新
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
      a-button(
        v-if="hasRowSelected && !['替换美团外卖商品'].includes(taskType)",
        type="link",
        size="small",
        @click="retryTasks"
      ) 重试
      a-button(
        v-if="hasRowSelected && taskType == '替换美团外卖商品'",
        type="link",
        size="small",
        @click="restoreSubs"
      ) 恢复
</template>

<script>
import app from "apprun"
import { message } from "ant-design-vue"
import TableSelect from "../../components/TableSelect"
import ToolsFoodDetail from "./ToolsFoodDetail"
import baseFetch from "../../api/base"

function throttle(fn, wait) {
  let timer = null
  return function () {
    let context = this
    let args = arguments

    if (!timer) {
      timer = setTimeout(function () {
        fn.apply(context, args)
        timer = null
      }, wait)
    }
  }
}

export default {
  name: "tools-food-view",
  components: {
    TableSelect,
    ToolsFoodDetail,
  },
  props: ["plainTable", "viewType", "taskId", "taskType", "scrollY"],
  data() {
    return {
      columns: [],
      table: [],
      loading: false,
      selectedRowKeys: [],
      shops: [],
      resultBufs: [],
      throtUpdateTableRes: () => { },
      exporting: false,
      tableUrl: null,
      foodDetailModalShow: false,
      foodDetailI: null,
    }
  },
  computed: {
    scrollX() {
      return this.columns.map((col) => col.width ?? 200).reduce((p, v) => p + v, 0)
    },
    hasRowSelected() {
      return this.selectedRowKeys.length > 0
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
    buildElmTagColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "新分类名",
          dataIndex: "新分类名",
          width: 140,
        },
        {
          title: "分类描述",
          dataIndex: "分类描述",
          width: 200,
        },
        {
          title: "开关置顶",
          dataIndex: "开关置顶",
          width: 100,
        },
        {
          title: "置顶时段",
          dataIndex: "置顶时段",
          width: 200,
        },
        {
          title: "分类排序",
          dataIndex: "分类排序",
          width: 100,
          _sort: true,
        },
      ]
    },
    buildMtTagColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "分类id",
          dataIndex: "分类id",
          width: 140,
        },
        {
          title: "新分类名",
          dataIndex: "新分类名",
          width: 140,
        },
        {
          title: "分类描述",
          dataIndex: "分类描述",
          width: 200,
        },
        {
          title: "开关置顶",
          dataIndex: "开关置顶",
          width: 100,
        },
        {
          title: "置顶时段",
          dataIndex: "置顶时段",
          width: 200,
        },
        {
          title: "分类排序",
          dataIndex: "分类排序",
          width: 100,
          _sort: true,
        },
      ]
    },
    buildElmFoodColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
        },
        {
          title: "价格",
          dataIndex: "价格",
          width: 100,
          _sort: true,
        },
        {
          title: "餐盒价格",
          dataIndex: "餐盒价格",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣价格",
          dataIndex: "折扣价格",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣限购",
          dataIndex: "折扣限购",
          width: 100,
          _sort: true,
        },
        {
          title: "最小购买量",
          dataIndex: "最小购买量",
          width: 100,
          _sort: true,
        },
        {
          title: "描述",
          dataIndex: "描述",
          width: 200,
        },
        {
          title: "主料",
          dataIndex: "主料",
          width: 100,
        },
        {
          title: "单点不送",
          dataIndex: "单点不送",
          width: 100,
        },
        {
          title: "排序",
          dataIndex: "排序",
          width: 100,
        },
        {
          title: "上下架商品",
          dataIndex: "上下架商品",
          width: 100,
        },
        {
          title: "新商品名",
          dataIndex: "新商品名",
          width: 200,
        },
        {
          title: "删除折扣",
          dataIndex: "删除折扣",
          width: 100,
        },
        {
          title: "删除商品",
          dataIndex: "删除商品",
          width: 100,
        },
      ]
    },
    buildMtFoodColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
        },
        {
          title: "商品id",
          dataIndex: "商品id",
          width: 140,
        },
        {
          title: "数量",
          dataIndex: "数量",
          width: 100,
        },
        {
          title: "数量单位",
          dataIndex: "数量单位",
          width: 100,
        },
        {
          title: "价格",
          dataIndex: "价格",
          width: 100,
          _sort: true,
        },
        {
          title: "餐盒数量",
          dataIndex: "餐盒数量",
          width: 100,
          _sort: true,
        },
        {
          title: "餐盒价格",
          dataIndex: "餐盒价格",
          width: 100,
          _sort: true,
        },
        {
          title: "最小购买量",
          dataIndex: "最小购买量",
          width: 100,
          _sort: true,
        },
        {
          title: "单点不送",
          dataIndex: "单点不送",
          width: 100,
        },
        {
          title: "折扣价格",
          dataIndex: "折扣价格",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣限购",
          dataIndex: "折扣限购",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣流量助手",
          dataIndex: "折扣流量助手",
          width: 100,
        },
        {
          title: "删除折扣",
          dataIndex: "删除折扣",
          width: 100,
        },
        {
          title: "图片",
          dataIndex: "图片",
          width: 140,
          ellipsis: true,
        },
        {
          title: "属性",
          dataIndex: "属性",
          width: 140,
          ellipsis: true,
        },
        {
          title: "描述",
          dataIndex: "描述",
          width: 140,
          ellipsis: true,
        },
        {
          title: "排序",
          dataIndex: "排序",
          width: 100,
        },
        {
          title: "上下架商品",
          dataIndex: "上下架商品",
          width: 140,
        },
        {
          title: "新商品名",
          dataIndex: "新商品名",
          width: 200,
        },
        {
          title: "删除商品",
          dataIndex: "删除商品",
          width: 100,
        },
      ]
    },
    buildMtTestFoodColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "删除测试商品",
          dataIndex: "删除测试商品",
          width: 140,
        },
        {
          title: "创建测试商品",
          dataIndex: "创建测试商品",
          width: 140,
        },
      ]
    },
    buildMtFoodSubColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
        },
        {
          title: "替换后分类名称",
          dataIndex: "替换后分类名称",
          width: 140,
        },
        {
          title: "替换后商品名称",
          dataIndex: "替换后商品名称",
          width: 200,
        },
      ]
    },
    buildMtFoodRestoreSubColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "替换任务id",
          dataIndex: "替换任务id",
          width: 100,
        },
        {
          title: "替换i",
          dataIndex: "替换i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 100,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
        },
        {
          title: "替换后分类名称",
          dataIndex: "替换后分类名称",
          width: 140,
        },
        {
          title: "替换后商品名称",
          dataIndex: "替换后商品名称",
          width: 200,
        },
      ]
    },
    buildMtRetailColumns() {
      return [
        {
          title: "序号",
          dataIndex: "_i",
          width: 70,
        },
        {
          title: "店铺id",
          dataIndex: "店铺id",
          width: 140,
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          width: 200,
        },
        {
          title: "分类名称",
          dataIndex: "分类名称",
          width: 140,
        },
        {
          title: "分类id",
          dataIndex: "分类id",
          width: 140,
        },
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
        },
        {
          title: "商品id",
          dataIndex: "商品id",
          width: 140,
        },
        {
          title: "规格id",
          dataIndex: "规格id",
          width: 140,
        },
        {
          title: "价格",
          dataIndex: "价格",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣方式",
          dataIndex: "折扣方式",
          width: 100,
        },
        {
          title: "折扣价格",
          dataIndex: "折扣价格",
          width: 100,
          _sort: true,
        },
        {
          title: "折扣限购",
          dataIndex: "折扣限购",
          width: 100,
          _sort: true,
        },
        {
          title: "删除折扣",
          dataIndex: "删除折扣",
          width: 100,
        },
      ]
    },
    buildMtCollectCouponColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "使用门槛",
          dataIndex: "使用门槛",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "优惠券金额",
          dataIndex: "优惠券金额",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "使用有效期",
          dataIndex: "使用有效期",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "删除活动",
          dataIndex: "删除活动",
          width: 100,
        },
      ]
    },
    buildMtPoiInnerCouponColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "使用门槛",
          dataIndex: "使用门槛",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "优惠券金额",
          dataIndex: "优惠券金额",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "使用有效期",
          dataIndex: "使用有效期",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "删除活动",
          dataIndex: "删除活动",
          width: 100,
        },
      ]
    },
    buildMtSealFDCouponColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "删除活动",
          dataIndex: "删除活动",
          width: 100,
        },
      ]
    },
    buildMtOrderCouponColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "满?元可用",
          dataIndex: "满?元可用",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "订单满?元返券",
          dataIndex: "订单满?元返券",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "优惠券金额",
          dataIndex: "优惠券金额",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "使用有效期",
          dataIndex: "使用有效期",
          width: 140,
          _sort: true,
          _filter: true,
        },
        {
          title: "删除活动",
          dataIndex: "删除活动",
          width: 100,
        },
      ]
    },
    buildMtDeliveryDiscountColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "减配送费",
          dataIndex: "减配送费",
          width: 260,
          _sort: true,
          _filter: true,
        },
      ]
    },
    buildMtFullDiscountColumns() {
      return [
        {
          title: "门店ID",
          dataIndex: "门店ID",
          width: 140,
        },
        {
          title: "门店名称",
          dataIndex: "门店名称",
          width: 220,
        },
        {
          title: "满减",
          dataIndex: "满减",
          width: 260,
          _sort: true,
          _filter: true,
        },
        {
          title: "删除活动",
          dataIndex: "删除活动",
          width: 100,
        },
      ]
    },
    buildColumns() {
      let cols = []
      if (this.taskType == "修改饿了么外卖分类") cols = this.buildElmTagColumns()
      else if (this.taskType == "修改美团外卖分类")
        cols = this.buildMtTagColumns()
      else if (this.taskType == "修改饿了么外卖商品")
        cols = this.buildElmFoodColumns()
      else if (this.taskType == "修改美团外卖商品")
        cols = this.buildMtFoodColumns()
      else if (this.taskType == "增删美团外卖测试商品")
        cols = this.buildMtTestFoodColumns()
      else if (this.taskType == "替换美团外卖商品")
        cols = this.buildMtFoodSubColumns()
      else if (this.taskType == "恢复已替换美团外卖商品")
        cols = this.buildMtFoodRestoreSubColumns()
      else if (this.taskType == "修改美团零售商品")
        cols = this.buildMtRetailColumns()
      else if (this.taskType == "修改美团收藏有礼")
        cols = this.buildMtCollectCouponColumns()
      else if (this.taskType == "修改美团店内领券")
        cols = this.buildMtPoiInnerCouponColumns()
      else if (this.taskType == "删除美团售卖代金券")
        cols = this.buildMtSealFDCouponColumns()
      else if (this.taskType == "修改美团下单返券")
        cols = this.buildMtOrderCouponColumns()
      else if (this.taskType == "修改美团满减活动")
        cols = this.buildMtFullDiscountColumns()
      else if (this.taskType == "修改美团减配送费")
        cols = this.buildMtDeliveryDiscountColumns()

      if (this.viewType == "results") {
        cols.push({
          title: "结果",
          dataIndex: "resultStatus",
          width: 100,
          fixed: "right",
        })
      }

      this.columns = cols.map(this.extendColumn)
    },
    fetchShops() {
      baseFetch({
        url: "/v1/shops",
      })
        .then((res) => {
          this.shops = res
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    fetchTable() {
      if (this.taskId == null) {
        this.table = this.plainTable?.map((v) => {
          let shop = this.shops.find((s) => s.shop_id == v.店铺id)
          return { ...v, 店铺名称: v.店铺名称 || shop?.shop_name }
        })
        return
      }

      if (this.viewType == "inputs") {
        this.loading = true
        baseFetch({
          url: `/v1/tools/update-foods/tasks/${this.taskId}/inputs`,
        })
          .then((res) => {
            this.resetData()
            this.table = res.inputs.map((v) => {
              let shop = this.shops.find((s) => s.shop_id == v.店铺id)
              return { ...v, 店铺名称: v.店铺名称 || shop?.shop_name }
            })
            this.loading = false
          })
          .catch((err) => {
            message.error(err.message)
            this.loading = false
          })
      } else if (this.viewType == "results") {
        this.loading = true
        baseFetch({
          url: `/v1/tools/update-foods/tasks/${this.taskId}/results`,
        })
          .then((res) => {
            this.table = res.results.map((v) => {
              let shop = this.shops.find((s) => s.shop_id == v.店铺id)
              return { ...v, 店铺名称: v.店铺名称 || shop?.shop_name }
            })

            this.resetData()

            this.selectedRowKeys = this.table
              .filter((row) => row.resultStatus == '失败')
              .map((row) => row._i)

            this.loading = false
          })
          .catch((err) => {
            message.error(err.message)
            this.loading = false
          })
      }
    },
    onRowSelect(selects) {
      this.selectedRowKeys = selects
    },
    restoreSub(rec) {
      this.$emit("restoreSubs", [{ ...rec, 替换任务id: this.taskId }])
    },
    restoreSubs() {
      this.$emit(
        "restoreSubs",
        this.table
          .filter((rec) => this.selectedRowKeys.includes(rec._i))
          .map((rec) => ({ ...rec, 替换任务id: this.taskId }))
      )
    },
    retryTasks() {
      this.$emit(
        "retryTasks",
        this.table
          .filter((rec) => this.selectedRowKeys.includes(rec._i))
          .map((rec) => ({
            ...rec,
            重试任务id: this.taskId,
            重试任务类型: this.taskType,
          }))
      )
    },
    viewFoodDetail(i) {
      this.foodDetailI = i
      this.foodDetailModalShow = true
    },
    updateTableResult(json) {
      const updTableRow = (state, newTable) => {
        let i = newTable.findIndex((v) => v._i == state._i)
        if (i < 0) return

        let resultStatus = state.error ? "失败" : "成功"
        newTable[i] = { ...newTable[i], resultStatus, result: state.result, error: state.error }
      }

      if (json.id != this.taskId) return

      let newTable = [...this.table]
      for (let buf of this.resultBufs) {
        updTableRow(buf, newTable)
      }
      this.table = newTable

      console.log("更新", this.resultBufs)
      this.resultBufs = []
    },
    resetData() {
      this.selectedRowKeys = []
      this.exporting = false
      this.tableUrl = null
      this.foodDetailModalShow = false
    },
    onExecTask(json) {
      console.log("res -->", json, 'task', this.taskId, this.viewType)
      this.resultBufs.push(json)
      this.throtUpdateTableRes(json)
    },
    transformTable() {
      return this.table.map((row) => {
        return {
          ...this.columns.reduce(
            (p, c) => ({ ...p, [c.title]: row[c.dataIndex] ?? "" }),
            {}
          ),
          失败原因: row.error ?? "",
        }
      })
    },
    exportTable() {
      this.exporting = true
      this.tableUrl = null
      app.run("ws://", "excel/export-excel", {
        baseName: `任务-${this.taskId}`,
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
    this.throtUpdateTableRes = throttle(this.updateTableResult, 800)

    app.on("excel/export-excel-res", json => this.onExportTable(json))
    app.on("update-foods/v1/task-row-result-change", json => this.onExecTask(json))

    this.buildColumns()
    this.fetchShops()
    this.fetchTable()
  },
  watch: {
    taskType() {
      this.buildColumns()
    },
    taskId() {
      this.resultBufs = []
      this.fetchTable()
    },
    viewType() {
      this.buildColumns()
      this.fetchTable()
    },
    plainTable() {
      this.fetchTable()
    },
  },
}
</script>

<style lang="sass" scoped>
.cursor-pointer
  cursor: pointer

.tools-food-view
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
