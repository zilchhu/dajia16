<template lang="pug">
div
  a-table.ant-table-change(
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
      template(v-if="column.dataIndex == 'key'")
        div
          a-button(type="link", size="small", @click="() => editRecord(record)") 编辑

  a-modal(
    v-model:visible="isEditModalVis",
    title="编辑条目",
    :footer="null",
    centered,
    :width="600"
  )
    a-form(
      :model="editModel",
      :label-col="{ span: 5 }",
      :wrapper-col="{ span: 16 }",
      @submit="handleEditSubmit"
    )
      a-form-item(label="物理店")
        a-input(v-model:value="editModel.real_shop" disabled)
      a-form-item(label="老板姓名")
        a-input(v-model:value="editModel.boss_name")
      a-form-item(label="老板电话")
        a-input(v-model:value="editModel.boss_phone")
      a-form-item(label="店长姓名")
        a-input(v-model:value="editModel.manager_name")
      a-form-item(label="店长电话")
        a-input(v-model:value="editModel.manager_phone")
      a-form-item(label="求助沟通人")
        a-input(v-model:value="editModel.communicator")
      a-form-item(label="一起出餐?")
        a-input(v-model:value="editModel.is_both_meal")
      a-form-item(label="煮面桶?")
        a-input(v-model:value="editModel.use_noodle_bucket")
      a-form-item(label="云打印机?")
        a-input(v-model:value="editModel.use_cloud_printer")
      a-form-item(label="营业时间")
        a-input(v-model:value="editModel.busi_time")
      a-form-item(label="人数")
        a-input(v-model:value="editModel.staff_cnt")
      a-form-item(label="上了新品?")
        a-input(v-model:value="editModel.is_new_product")
      a-form-item(label="门店问题")
        a-input(v-model:value="editModel.shop_problem")
      a-form-item(label="重开跟进")
        a-input(v-model:value="editModel.reopen_progress")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

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
import dayjs from "dayjs"
import baseFetch from "../../api/base"

export default {
  name: "ProbBH",
  components: {
    TableSelect,
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  },
  data() {
    return {
      probType: "bh",
      columns: [
        {
          title: "城市",
          dataIndex: "城市",
          width: 100,
        },
        {
          title: "物理店",
          dataIndex: "物理店",
          width: 100,
        },
        {
          title: "负责人",
          dataIndex: "负责人",
          width: 100,
        },
        {
          title: "老板姓名",
          dataIndex: "老板姓名",
          width: 100,
        },
        {
          title: "老板电话",
          dataIndex: "老板电话",
          width: 150,
        },
        {
          title: "店长姓名",
          dataIndex: "店长姓名",
          width: 100,
        },
        {
          title: "店长电话",
          dataIndex: "店长电话",
          width: 150,
        },
        {
          title: "求助沟通人",
          dataIndex: "求助沟通人",
          width: 150,
        },
        {
          title: "一起出餐？",
          dataIndex: "一起出餐？",
          width: 100,
        },
        {
          title: "煮面桶？",
          dataIndex: "煮面桶？",
          width: 100,
        },
        {
          title: "云打印机？",
          dataIndex: "云打印机？",
          width: 100,
        },
        {
          title: "营业时间",
          dataIndex: "营业时间",
          width: 100,
        },
        {
          title: "人数",
          dataIndex: "人数",
          width: 100,
        },
        {
          title: "上了新品？",
          dataIndex: "上了新品？",
          width: 100,
        },
        {
          title: "门店问题",
          dataIndex: "门店问题",
          width: 100,
        },
        {
          title: "重开跟进",
          dataIndex: "重开跟进",
          width: 100,
        },
        {
          title: "操作",
          dataIndex: "key",
          fixed: "right",
          width: 100,
        },
      ],
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      editModel: {
        id: 0,
        real_shop: null,
        boss_name: null,
        boss_phone: null,
        manager_name: null,
        manager_phone: null,
        communicator: null,
        is_both_meal: null,
        use_noodle_bucket: null,
        use_cloud_printer: null,
        busi_time: null,
        staff_cnt: null,
        is_new_product: null,
        shop_problem: null,
        reopen_progress: null,
      },
      isEditModalVis: false,
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
    intToBoolHm(val) {
      if (val == null) return null
      if (val == 1) return "是"
      if (val == 0) return "否"
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
        url: "/v1/checks/bh",
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
    editRecord(rec) {
      console.log(rec)
      this.editModel = {
        id: rec.id,
        real_shop: rec.物理店,
        boss_name: rec.老板姓名,
        boss_phone: rec.老板电话,
        manager_name: rec.店长姓名,
        manager_phone: rec.店长电话,
        communicator: rec["求助沟通人"],
        is_both_meal: rec["一起出餐？"],
        use_noodle_bucket: rec["煮面桶？"],
        use_cloud_printer: rec["云打印机？"],
        busi_time: rec.营业时间,
        staff_cnt: rec.人数,
        is_new_product: rec["上了新品？"],
        shop_problem: rec.门店问题,
        reopen_progress: rec.重开跟进,
      }
      this.isEditModalVis = true
    },
    handleEditSubmit() {
      console.log(this.editModel)
      baseFetch({
        method: "PUT",
        url: `/v1/checks/bh/${this.editModel.id}`,
        data: {
          ...this.editModel,
        },
      })
        .then((res) => {
          message.success(res)
          this.isEditModalVis = false
          this.fetchTable()
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
        baseName: "门店通讯表",
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
    this.scrollY = document.body.clientHeight - 244
  },
}
</script>

<style lang="sass" scoped>
.ellipsis
  display: -webkit-box
  overflow: hidden
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical

.wrap
  white-space: pre-wrap
</style>
