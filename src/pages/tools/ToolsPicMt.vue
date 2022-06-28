<template lang="pug">
.tools-food-mt
  div(
    style="display: flex; flex-direction: column; height: 100%; align-items: flex-start; justify-content: flex-start; row-gap: 0.75rem"
  )
    a-auto-complete(
      v-model:value="auth",
      :options="authOpts",
      placeholder="选择或输入cookie"
      size="small"
      style="width: 300px"
    )
      template(#option="{ value, label }")
        div {{ label }}

    a-upload(
      v-model:file-list="fileList",
      :action="uploadUrl"
    )
      a-button(style="width: 300px")
        UploadOutlined
        span 上传图片

    a-upload(
      v-model:file-list="fileListDir",
      :action="uploadUrl",
      :directory="true"
    )
      a-button(style="width: 300px")
        UploadOutlined
        span 上传图集

    a-button(type="primary" :loading="loading" @click="run" style="width: 300px") 开始上传

  div(style="flex-grow: 1")
    div(v-if="table.length > 0")
      a-button(
        type="link",
        size="small",
        @click="exportPicTable",
        :loading="exporting",
        style="color: black"
      ) 导出
      a(
        v-show="picTableUrl",
        :href="picTableUrl",
        target="_blank"
      ) 下载

    a-table.ant-table-change(
      v-show="table.length > 0",
      :columns="columns",
      :data-source="table",
      rowKey="_i",
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
        template(v-if="column.dataIndex == '商品名称'")
          a-tooltip
            template(#title)
              div(style="white-space: pre-wrap") {{ record.result?.code == 0 ? JSON.stringify(record.result.data) : record.result?.message }}
            div(
              :class="[{ 'succ-text': record.result?.code == 0 }, { 'error-text': record.result?.code == 1 }]"
            ) {{ text }}
        template(v-else-if="column.title == '图片'")
          a-image(:width="100", :src="record.图片链接")

</template>

<script>
import { UploadOutlined } from "@ant-design/icons-vue"
import { message } from "ant-design-vue"
import TableSelect from "../../components/TableSelect"
import app from "apprun"
import baseFetch, { HOST } from "../../api/base"

export default {
  name: "tools-pic-mt",
  components: {
    UploadOutlined,
    TableSelect,
  },
  data() {
    return {
      uploadUrl: `${HOST}/api/common/v1/upload`,
      fileList: [],
      fileListDir: [],
      results: [],
      auths: [],
      auth: "",
      jsonTable: [],
      table: [],
      scrollY: 900,
      loading: false,
      exporting: false,
      picTableUrl: null,
      tableName: "",
    }
  },
  computed: {
    columns() {
      return [
        {
          title: "商品名称",
          dataIndex: "商品名称",
          width: 200,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.商品名称 ?? "") == value,
        },
        {
          title: "图片",
          dataIndex: "图片链接",
          width: 120,
        },
        {
          title: "图片链接",
          dataIndex: "图片链接",
          width: 300,
          customFilterDropdown: true,
          onFilter: (value, record) => (record.图片链接 ?? "") == value,
        },
      ]
    },
    allFileList() {
      return this.fileList.concat(this.fileListDir)
    },
    authOpts() {
      return this.auths.map((s) => ({
        key: s.shopId,
        value: s.auth,
        label: `${s.platform == 1 ? "*美团*" : "*饿了么*"} ${s.shopName}`
      }))
    },
  },
  methods: {
    getColFilters(colName) {
      return Array.from(new Set(this.table.map((row) => row[colName]))).map((col) => ({
        label: col || "",
        value: col || "",
      }))
    },
    toNum(str) {
      try {
        return parseFloat(str)
      } catch (error) {
        return 0
      }
    },
    fetchAuths() {
      this.loading = false
      baseFetch({
        url: "/v1/shops/cookies",
      })
        .then((res) => {
          this.auths = res.filter((v) => v.platform == 1)
          this.loading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.loading = false
        })
    },
    flattenObj(obj) {
      if (obj == null) return ""
      if (typeof obj != "object") return obj
      return Object.entries(obj)
        .map(([k, v]) => `${k} ${typeof v == "string" ? v : JSON.stringify(v)}`)
        .join("\n")
    },
    run() {
      if (this.auth.length == 0) {
        message.error("please input cookie")
        return
      }

      this.loading = true
      baseFetch({
        method: "POST",
        url: '/v1/tools/upload-imgs/mt',
        data: {
          cookie: this.auth,
          images: this.allFileList.map((f) => ({
            _i: f.uid,
            filename: f?.response?.data?.filename,
          })),
        }
      })
        .then(res => {
          this.table = this.table.map(v => {
            let resRow = res.find(k => k._i == v._i)
            return {
              ...v,
              result: resRow?.result,
              图片链接: resRow?.result?.code == 0 ? resRow.result.data.picUrl : ''
            }
          })
          this.loading = false
        })
        .catch((err) => {
          message.error(err.message)
          this.loading = false
        })
    },
    exportPicTable() {
      this.exporting = true
      app.run("ws://", "excel/export-excel", {
        baseName: "上传图片表",
        rows: this.table,
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
      this.picTableUrl = json.data
    })

    this.fetchAuths()
  },
  mounted() {
    this.scrollY = document.body.clientHeight - 276
  },
  watch: {
    allFileList(n) {
      this.table = n.map((v) => ({
        _i: v.uid,
        商品名称: v.name.slice(0, v.name.lastIndexOf(".")),
        图片链接: "",
      }))
    },
  },
}
</script>

<style lang="sass" scoped>
.tools-food-mt
  display: flex
  column-gap: 0.75rem
  width: 100%
  height: 100%
  padding: 10px

.succ-text
  background: rgba(0, 255, 0, .7)

.error-text
  background: rgba(255, 0, 0, .7)
</style>
