<template lang="pug">
.tools-food
  a-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ pageSize: 50 }",
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
      template(v-if="column.dataIndex == 'diffs'")
        .field-diffs
          .field-diff(v-for="diff in text")
            .field-values
              .field-name {{ diffFieldNameMap[diff.name] }}
              span.field-value.left-value(
                :class="{ updated: diff.changeType.match(/updated|inserted/), 'food-name': diff.name == 'name' }"
              ) {{ diff.leftValue }}
              span.field-value.right-value(
                :class="{ updated: diff.changeType.match(/updated|inserted/), 'food-name': diff.name == 'name' }"
              ) {{ diff.rightValue }}
      template(v-else-if="column.dataIndex == 'unchange_res'")
        div(v-if="text", style="overflow: hidden", :title="text")
          a-tooltip
            template(#title)
              div(v-if="text == '失败'") {{ record.result.error }}
              .success-res(v-else) {{ getResultDetail(record.result) }}

            a-tag(:color="text == '失败' ? 'error' : 'success'") {{ text }}
      template(v-else-if="column.title == '操作'")
        a-button(
          type="link",
          size="small",
          @click="unchangeFood(record)",
          :loading="record.unchangeLoading"
        ) 恢复

      template(v-if="column.dataIndex == 'handle'")
        div(:title="text")
          a-textarea.m-textarea(
            :value="text",
            @change="(e) => handleChange(e.target.value, record)", 
            size="small"
            autoSize
          )

  .left-bottom-div
    a-button(type="link", size="small", @click="fetchTable") 
      SyncOutlined
      span(style="margin-left: 4px") 刷新
</template>

<script>
import app from "apprun"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import TableSelect from "../../components/TableSelect"
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
  name: "tool-food-diff",
  components: {
    TableSelect,
  },
  data() {
    return {
      bodyRect: { width: 900, height: 800 },
      columns: [
        {
          title: "平台",
          dataIndex: "platform",
          width: 100,
        },
        {
          title: "店铺id",
          dataIndex: "shop_id",
          width: 100,
        },
        {
          title: "店铺名称",
          dataIndex: "shop_name",
          width: 200,
        },
        {
          title: "负责人",
          dataIndex: "person",
          width: 100,
        },
        {
          title: "字段差异",
          dataIndex: "diffs",
        },
        {
          title: "日期",
          dataIndex: "date",
          width: 100,
        },
        {
          title: "处理",
          dataIndex: "handle",
          width: 200
        },
        // {
        //   title: "恢复结果",
        //   dataIndex: "unchange_res",
        //   width: 100,
        // },
        // {
        //   title: "操作",
        //   dataIndex: "key",
        //   width: 100,
        // },
      ],
      table: [],
      loading: false,
      throtFetchTable: () => { },
      debounce_save: null,
      diffFieldNameMap: {
        name: '名称',
        tagName: '分类名称',
        price: '价格',
        boxPrice: '餐盒费',
        actPrice: '折扣价',
        orderLimit: '折扣限购',
        minOrderCount: '最小起购',
        singleOrderNoDelivery: '单点不送',
        attrList: '属性',
        description: '描述',
        sequence: '排序',
      }
    }
  },
  computed: {
    scrollX() {
      return this.columns
        .map((col) => col.width ?? 200)
        .reduce((p, v) => p + v, 0)
    },
    scrollY() {
      return this.bodyRect.height - 204
    },
    scroll() {
      return { y: this.scrollY, x: this.scrollX }
    },
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
  },
  methods: {
    toNum(str) {
      try {
        return parseFloat(str)
      } catch (error) {
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
    getResultDetail(result) {
      if (result?.result == null) return ""
      return JSON.stringify(result.result, null, 2)
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/food_diffs/mt",
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
    unchangeFood(rec) {
      let i = this.table.findIndex((r) => r.key == rec.key)
      this.table[i].unchangeLoading = true
      app.run("ws://", "unchange-food", { id: rec.id })
    },
    cancelTask(id) {
      // app.run("ws://", "cancel-food-task", { id });
    },
    onGetFoodDiffs(state) {
      if (state.error) message.error(state.error)
      this.table = state.result.diffs
      this.loading = false
    },
    onUploadTable(state) {
      this.fileTable = state.jsonTable
    },
    onUnchangeFood(state) {
      if (this.throtFetchTable) this.throtFetchTable()
    },
    handleChange(value, record) {
      const i = this.table.findIndex((item) => record.key == item.key)
      if (i > -1) {
        this.table[i]["handle"] = value
        this.debounce_save(record)
      }

      // let newTable = [...this.table]
      // const i = newTable.findIndex((item) => record.key == item.key)
      // if (i > -1) {
      //   newTable[i]["handle"] = value
      //   this.table = newTable
      //   this.debounce_save(record)
      // }
    },
    save(record) {
      const target = this.table.filter((item) => record.key === item.key)[0]
      if (target) {
        baseFetch({
          method: "POST",
          url: "/v1/checks/handles",
          data: {
            type: 'food-diffs-mt',
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
    this.throtFetchTable = throttle(this.fetchTable, 800)
    this.debounce_save = this.debounce(this.save)
    // app.on("get-food-diffs-res", this.onGetFoodDiffs.bind(this))
    // app.on("unchange-food-res", this.onUnchangeFood.bind(this))

    this.fetchTable()
  },
  mounted() {
    this.bodyRect = document.body.getBoundingClientRect()
  },
  unmounted() {
    // app.off("get-food-diffs-res", this.onGetFoodDiffs.bind(this))
    // app.off("unchange-food-res", this.onUnchangeFood.bind(this))
  },
}
</script>


<style lang="sass" scoped>
.tools-food
  .header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 6px

    .title
      font-size: 1.1em
      font-weight: bold

    .controls
      display: flex
      align-items: center
      column-gap: 6px

.updown-table
  display: flex
  align-items: center
  column-gap: 18px

.exec-form-item
  display: flex
  align-items: center

.field-name
  min-width: 6em
  // font-weight: bold

.field-values
  display: flex

.field-value
  flex: 1

.field-value.food-name
  font-weight: bold

.field-value.left-value.updated
  background-color: #EF4444

.field-value.right-value.updated
  background-color: #10B981

.m-textarea
  padding: 0
  border-color: white
  color: #fa821c 
  font-weight: bold
</style>