<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
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
      template(v-if="['创建日期', '更新日期'].includes(column.dataIndex)")
        .pre-wrap {{ formatTime(text) }}
      template(v-else-if="['老板的诉求', '门店的问题'].includes(column.dataIndex)")
        .pre-line {{ text }}
      template(v-else-if="column.dataIndex == 'key'")
        .op-bar
          a-button(
            type="link",
            size="small",
            @click="() => editRecord(record)"
          ) 编辑
          a-popconfirm(
            title="确认删除？",
            okText="确定",
            cancelText="取消",
            @confirm="() => delRecord(record)"
          )
            a-button(type="link", size="small") 删除

  a-modal(
    v-model:visible="isAddModalVis",
    title="添加条目",
    :footer="null",
    centered,
    :width="600"
  )
    a-form(
      ref="addForm",
      :model="addModel",
      :label-col="{ span: 5 }",
      :wrapper-col="{ span: 16 }",
      @submit="handleAddSubmit"
    )
      a-form-item(label="物理店名")
        a-select(
          v-model:value="addModel['物理店名']",
          show-search,
          @select="(value) => onRealShopSelect(value, 'add')"
        )
          a-select-option(
            v-for="rs in realShops",
            :key="rs.real_shop_name",
            :value="rs.real_shop_name"
          ) {{ rs.real_shop_name }}
      a-form-item(label="组员")
        a-input(v-model:value="addModel['组员']")
      a-form-item(label="门店人数")
        a-input(v-model:value="addModel['门店人数']")
      a-form-item(label="老板是否好沟通")
        a-input(v-model:value="addModel['老板是否好沟通']")
      a-form-item(label="老板的诉求")
        a-textarea(v-model:value="addModel['老板的诉求']")
      a-form-item(label="门店的问题")
        a-textarea(v-model:value="addModel['门店的问题']")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  a-modal(
    v-model:visible="isEditModalVis",
    title="编辑条目",
    :footer="null",
    centered,
    :width="600"
  )
    a-form(
      ref="editForm",
      :model="editModel",
      :label-col="{ span: 5 }",
      :wrapper-col="{ span: 16 }",
      @submit="handleEditSubmit"
    )
      a-form-item(label="物理店名")
        a-select(
          v-model:value="editModel['物理店名']",
          show-search,
          @select="(value) => onRealShopSelect(value, 'edit')"
        )
          a-select-option(
            v-for="rs in realShops",
            :key="rs.real_shop_name",
            :value="rs.real_shop_name"
          ) {{ rs.real_shop_name }}
      a-form-item(label="组员")
        a-input(v-model:value="editModel['组员']")
      a-form-item(label="门店人数")
        a-input(v-model:value="editModel['门店人数']")
      a-form-item(label="老板是否好沟通")
        a-input(v-model:value="editModel['老板是否好沟通']")
      a-form-item(label="老板的诉求")
        a-textarea(v-model:value="editModel['老板的诉求']")
      a-form-item(label="门店的问题")
        a-textarea(v-model:value="editModel['门店的问题']")
      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  a-modal(
    v-model:visible="isLogModalVis",
    title="操作记录",
    :footer="null",
    centered,
    :width="800"
  )
    div
      a-table.ant-table-change(
        :columns="logColumns",
        :data-source="logTable",
        rowKey="key",
        :loading="logLoading",
        :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
        size="small",
        :scroll="{ y: 500 }",
        :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      )
        template(
          #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
        )
          table-select(
            :columnTitle="column.title",
            :columnIndex="column.dataIndex",
            :tableData="logTable",
            @select-change="setSelectedKeys",
            @confirm="confirm()",
            @reset="clearFilters()"
          )
        template(#bodyCell="{ column, text, record }")
          template(v-if="column.title == '详情'")
            .pre-wrap {{ Object.entries(text).map(([k, v]) => `${k}: ${v}`).join('\n') }}
          template(v-else-if="column.title == '时间'")
            div {{ formatTime(text) }}
      div
        a-button(type="link", size="small", @click="fetchLogTable") 刷新

  .left-bottom-div(v-show="!loading")
    a-button(type="link", size="small", @click="addRecord") 新增
    a-button(type="link", size="small", @click="openLogTable") 记录
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
import dayjs from "dayjs"
import baseFetch from "../../api/base"

export default {
  name: "ProbAN",
  components: {
    TableSelect,
  },
  data() {
    return {
      table: [],
      loading: false,
      columns: [
        {
          title: "物理店名",
          dataIndex: "物理店名",
          width: 90,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.物理店名 ?? "") == value,
          fixed: "left",
        },
        {
          title: "组员",
          dataIndex: "组员",
          width: 80,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.组员 ?? "") == value,
        },
        {
          title: "门店人数",
          dataIndex: "门店人数",
          width: 80,
          sorter: (a, b) => this.toNum(a.门店人数) - this.toNum(b.门店人数),
        },
        {
          title: "老板是否好沟通",
          dataIndex: "老板是否好沟通",
          width: 140,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.老板是否好沟通 ?? "") == value,
        },
        {
          title: "老板的诉求",
          dataIndex: "老板的诉求",
          width: 300,
        },
        {
          title: "门店的问题",
          dataIndex: "门店的问题",
          width: 400,
        },
        {
          title: "创建日期",
          dataIndex: "创建日期",
          width: 120,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.创建日期 ?? "") == value,
        },
        {
          title: "更新日期",
          dataIndex: "更新日期",
          width: 120,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.更新日期 ?? "") == value,
        },
        {
          title: "操作",
          dataIndex: "key",
          customFilterDropdown: true,
          width: 80,
        },
      ],
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      isAddModalVis: false,
      isEditModalVis: false,
      realShops: [],
      addModel: {
        物理店名: "",
        组员: "",
        门店人数: "",
        老板是否好沟通: "",
        老板的诉求: "",
        门店的问题: "",
      },
      editModel: {
        id: "",
        物理店名: "",
        组员: "",
        门店人数: "",
        老板是否好沟通: "",
        老板的诉求: "",
        门店的问题: "",
      },
      isLogModalVis: false,
      logTable: [],
      logLoading: false,
      logColumns: [
        {
          title: "类型",
          dataIndex: "type",
          width: 90,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.type ?? "") == value,
        },
        {
          title: "物理店",
          dataIndex: "物理店",
          width: 90,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.物理店 ?? "") == value,
        },
        {
          title: "详情",
          dataIndex: "detail",
          customFilterDropdown: true,
        },
        {
          title: "用户",
          dataIndex: "user_name",
          width: 120,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.user_name ?? "") == value,
        },
        {
          title: "时间",
          dataIndex: "created_at",
          width: 120,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.created_at ?? "") == value,
        },
      ],
      logTypes: {
        add: "新增",
        edit: "修改",
        del: "删除",
      },
    }
  },
  computed: {
    account() {
      return this.$store.state.account ?? localStorage.getItem("account")
    },
    token() {
      return this.$store.state.token ?? localStorage.getItem("token")
    },
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map((row) => row[colName] ?? ""))).map(
        (col) => ({
          label: col || "",
          value: col || "",
        })
      )
    },
    isEmpty(val) {
      return val == null || val == ""
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
    formatTime(t) {
      return dayjs(t).format("YYYY-MM-DD HH:mm:ss")
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: "/v1/checks/an",
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
    fetchLogTable() {
      this.logLoading = true
      baseFetch({
        url: "/v1/checks/an/logs",
      })
        .then((res) => {
          this.logTable = res.map((item) => ({
            ...item,
            type: this.logTypes[item.type],
            物理店: item.detail?.物理店名,
          }))
          this.logLoading = false
        })
        .catch((err) => {
          message.error(err)
          this.logLoading = false
        })
    },
    fetchRealShops() {
      baseFetch({
        url: "/v1/real_shops",
      })
        .then((res) => {
          this.realShops = res
        })
        .catch((err) => {
          console.error(err)
        })
    },
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    onRealShopSelect(value, mode) {
      const rs = this.realShops.find((v) => v.real_shop_name == value)
      if (!rs) return

      switch (mode) {
        case "add":
          this.addModel.组员 = rs.person
      }
    },
    addRecord() {
      this.isAddModalVis = true
    },
    delRecord(record) {
      baseFetch({
        method: "DELETE",
        url: `/v1/checks/an/${record.id}`,
        data: {
          auth: {
            account: this.account,
            token: this.token,
          },
        },
      })
        .then((res) => {
          message.success(res)
          this.fetchTable()
        })
        .catch((err) => {
          message.error(err)
        })
    },
    editRecord(record) {
      this.editModel = {
        id: record.id,
        物理店名: record.物理店名,
        组员: record.组员,
        组长: record.组长,
        门店人数: record.门店人数,
        老板是否好沟通: record.老板是否好沟通,
        老板的诉求: record.老板的诉求,
        门店的问题: record.门店的问题,
      }
      this.isEditModalVis = true
    },
    handleAddSubmit() {
      console.log(this.addModel)
      baseFetch({
        method: "POST",
        url: "/v1/checks/an",
        data: {
          ...this.addModel,
          门店人数: this.isEmpty(this.addModel.门店人数) ? null : +this.addModel.门店人数,
          auth: {
            account: this.account,
            token: this.token,
          },
        },
      })
        .then((res) => {
          message.success(res)
          this.isAddModalVis = false
          this.fetchTable()
        })
        .catch((err) => {
          message.error(err)
        })
    },
    handleEditSubmit() {
      console.log(this.editModel)
      baseFetch({
        method: "PUT",
        url: `/v1/checks/an/${this.editModel.id}`,
        data: {
          ...this.editModel,
          门店人数: this.isEmpty(this.editModel.门店人数)
            ? null
            : +this.editModel.门店人数,
          auth: {
            account: this.account,
            token: this.token,
          },
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
        baseName: "门店沟通表",
        rows: this.transformTable(),
      })
    },
    openLogTable() {
      this.fetchLogTable()
      this.isLogModalVis = true
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
    this.fetchRealShops()
    this.fetchTable()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 204
  },
}
</script>

<style lang="sass" scoped>
.op-bar
  display: flex
  align-items: center
  column-gap: 6px

.pre-line
  white-space: pre-line
</style>
