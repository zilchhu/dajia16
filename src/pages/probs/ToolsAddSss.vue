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
      template(v-if="column.dataIndex == 'key'")
        div
          a-button(type="link", size="small", @click="() => editRecord(record)") 编辑

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
      a-form-item(label="闪时送名称")
        a-input(v-model:value="addModel.sss_name")

      a-form-item(label="店铺ID")
        a-auto-complete(
          v-model:value="addModel.shop_id",
          :options="add_shop_options"
        )
          template(#options="{ value, label }")
            div {{ label }}

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
      a-form-item(label="闪时送名称")
        a-input(v-model:value="editModel.sss_name")

      a-form-item(label="店铺ID")
        a-auto-complete(
          v-model:value="editModel.shop_id",
          :options="shop_options"
        )
          template(#options="{ value, label }")
            div {{ label }}

      a-form-item(:wrapper-col="{ span: 12, offset: 5 }")
        a-button(type="primary", html-type="submit") 提交

  .left-bottom-div(v-show="!loading", style="bottom: 10px")
    a-button(type="link", size="small", @click="addRecord") 新增
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
  name: "tools-add-sss",
  components: {
    TableSelect,
  },
  data() {
    return {
      table: [],
      loading: false,
      scrollY: 900,
      debounce_save: null,
      exporting: false,
      tableUrl: null,
      isAddModalVis: false,
      isEditModalVis: false,
      shops: [],
      addModel: {
        shop_id: "",
        sss_name: "",
      },
      editModel: {
        shop_id: "",
        sss_name: "",
      },
    }
  },
  computed: {
    columns() {
      return [
        {
          title: "闪时送名称",
          dataIndex: "闪时送名称",
          customFilterDropdown: true,
          onFilter: (value, record) => (record.闪时送名称 ?? "") == value,
          width: 220
        },
        {
          title: "店铺ID",
          dataIndex: "店铺ID",
          customFilterDropdown: true,
          onFilter: (value, record) => (record.店铺ID ?? "") == value,
          width: 100
        },
        {
          title: "店铺名称",
          dataIndex: "店铺名称",
          customFilterDropdown: true,
          onFilter: (value, record) => (record.店铺名称 ?? "") == value,
          width: 220
        },
        {
          title: "平台",
          dataIndex: "平台",
          customFilterDropdown: true,
          onFilter: (value, record) => (record.平台 ?? "") == value,
          width: 100
        },
        {
          title: "操作",
          dataIndex: "key",
          width: 100
        },
      ]
    },
    shop_options() {
      let options = this.shops
        .map((s) => ({
          value: String(s.shop_id),
          label: `${s.shop_name} ${s.platform == 1 ? "美团" : "饿了么"}`,
          id_name: `${s.shop_id} ${s.shop_name}`,
        }))
        .filter((s) => s.id_name.includes(this.editModel.shop_id))
      // console.log(options)
      return options
    },
    add_shop_options() {
      let options = this.shops
        .map((s) => ({
          value: String(s.shop_id),
          label: `${s.shop_name} ${s.platform == 1 ? "美团" : "饿了么"}`,
          id_name: `${s.shop_id} ${s.shop_name}`,
        }))
        .filter((s) => s.id_name.includes(this.addModel.shop_id))
      // console.log(options)
      return options
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
        url: "/v1/sss_relations",
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
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    addRecord() {
      this.isAddModalVis = true
    },
    editRecord(rec) {
      console.log(rec)
      this.editModel = {
        shop_id: rec.店铺ID ? String(rec.店铺ID) : "",
        sss_name: rec.闪时送名称,
      }
      this.isEditModalVis = true
    },
    handleAddSubmit() {
      console.log(this.addModel)
      baseFetch({
        method: "POST",
        url: "/v1/sss_relations",
        data: {
          ...this.addModel,
        },
      })
        .then((res) => {
          message.success(res)
          this.isAddModalVis = false
          this.fetchTable()
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    onShopFilter(inp, opt) {
      return Boolean(
        opt.xshop.shop_name?.includes(inp) || `${opt.xshop.shop_id}`.includes(inp)
      )
    },
    // onShopSelect(value, mode) {
    //   const s = this.shops.find((v) => v.shop_id == value);
    //   if (!s) return;
    //   switch (mode) {
    //     case "add":
    //       this.addModel.b = s.shop_name;
    //   }
    // },
    handleEditSubmit() {
      console.log(this.editModel)
      baseFetch({
        method: "PUT",
        url: `/v1/sss_relations/${this.editModel.shop_id}`,
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
    onSelectChange(checks) {
      console.log(checks)
    },
    transformTable() {
      return this.table.map((row) =>
        this.columns.reduce((p, c) => ({ ...p, [c.title]: row[c.dataIndex] }), {})
      )
    },
    exportTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: "闪时送关系表",
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
    this.fetchShops()
    this.fetchTable()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 200
  },
}
</script>
