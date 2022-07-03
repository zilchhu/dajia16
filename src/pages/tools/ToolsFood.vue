<template lang="pug">
.tools-food
  .header
    .title 商品任务
    .controls
      a-button(size="small", @click="fetchTable") 刷新列表
      a-button(type="primary", size="small", @click="addTask") 新增任务

  s-table.ant-table-change(
    rowKey="key",
    :loading="loading",
    :columns="extendedCols",
    :data-source="table",
    :pagination="false",
    :scroll="{ y: scrollY }"
    size="small",
    @change="onTableChange"
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      column-filter(
        :column="column"
        :table="table"
        :tableFilters="tableFilters"
        :filterPanes="column._filterPanes"
        :customFilterOption="column._customFilterOption",
        :selectedKeys="selectedKeys"
        :setSelectedKeys="setSelectedKeys"
        :confirm="confirm"
        :clearFilters="clearFilters"
      )
      //- table-select(
      //-   :columnTitle="column.title",
      //-   :columnIndex="column.dataIndex",
      //-   :tableData="table",
      //-   @select-change="values => setSelectedKeys(values)",
      //-   @confirm="confirm()",
      //-   @reset="clearFilters()"
      //- )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == 'fileName'")
        div(style="overflow: hidden", :title="text")
          a-button(type="link", size="small", @click="viewTaskInputs(record)") {{ text }}
      template(v-else-if="column.dataIndex == 'status'")
        div(style="cursor: pointer", title="点此查看实时结果")
          a-tag(
            :color="getStatusTagColor(text)",
            @click="viewTaskResults(record)"
          ) {{ text }}
      template(v-else-if="column.dataIndex == 'resultTitle'")
        a-button(type="link", @click="viewTaskResults(record)") {{ text }}
      template(v-else-if="column.dataIndex == 'op'")
        a-button(
          v-if="record.status?.match(/待执行|进行中/)",
          type="link",
          size="small",
          @click="cancelTask(record.id)"
        ) 取消

  a-modal(
    v-model:visible="loginModalShow",
    :title="null",
    :footer="null",
    centered,
    :width="650"
  )
    Login(@login-success="onLoginSuccess")

  a-modal(
    v-model:visible="modalShow",
    title="新增任务",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.86"
    :destroyOnClose="true",
  )
    .add-modal
      a-form-item(label="任务名称", :labelCol="{ span: 2 }")
        a-input(v-model:value="form.name")
      a-form-item(label="任务类型", :labelCol="{ span: 2 }")
        a-select(v-model:value="form.type", :options="taskTypeOpts")
      a-form-item(label="cookie", :labelCol="{ span: 2 }")
        a-auto-complete(
          v-model:value="form.cookie",
          :options="cookieOpts",
          :filter-option="onCookieFilter"
        )
          template(#option="{ value, label }")
            div {{ label }}
      a-form-item(label="文件", :labelCol="{ span: 2 }")
        .updown-table
          a-upload(
            :action="uploadUrl",
            @change="onFileChange"
          )
            a-button(size="small")
              UploadOutlined
              span 上传表格
          a(
            v-show="form.type",
            :href="`${HOST}/templates/${taskTemplateNames[form.type]}`",
            download
          ) 下载模板

          a-button(v-show="form.type" type="link" @click="downloadPoiFoodsTemp") 下载单店商品
      ToolsFoodView(
        viewType="plain",
        :taskType="form.type",
        :plainTable="fileTable",
        :scrollY="400"
      ) 
    a-form-item(label="执行时间", :labelCol="{ span: 2 }")
      .exec-form-item
        a-radio-group(v-model:value="form.execType", name="exec")
          a-radio(value="立即") 立即执行
          a-radio(value="定时") 定时执行
        a-time-picker(
          v-if="form.execType == '定时'",
          v-model:value="form.execAt"
        )
    a-form-item(:labelCol="{ offset: 2 }")
      a-popconfirm(
        title="提交前请确保已仔细检查过表单，确定提交？",
        okText="确定",
        cancelText="取消",
        @confirm="submitTask"
      )
        a-button(type="primary") 提交

  a-modal(
    v-model:visible="foodsTempModalShow"
    title="单店模板",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.8"
  )
    ToolsFoodTempView(:cookie="form.cookie")

  a-modal(
    v-model:visible="viewModalShow",
    :footer="null",
    :destroyOnClose="true",
    centered,
    :width="bodyRect.width * 0.8"
  )
    .view-modal
      .header
    ToolsFoodView(
      :viewType="viewType",
      :taskType="viewedTask.type",
      :taskId="viewedTask.id",
      :scrollY="bodyRect.height * 0.7",
      @retryTasks="submitRetryTasks"
      @restoreSubs="submitRestoreSubTasks"
    ) 
</template>

<script>
import app from "apprun"
import moment from "moment"
import dayjs from "dayjs"
import { message } from "ant-design-vue"
import { UploadOutlined } from "@ant-design/icons-vue"
import TableSelect from "../../components/TableSelect"
import ColumnFilter from "../../components/ColumnFilter"
import ToolsFoodView from "./ToolsFoodView.vue"
import ToolsFoodTempView from "./ToolsFoodTempView.vue"
import Login from "../../components/user/Login"
import baseFetch, { HOST } from "../../api/base"

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
  name: "tool-food",
  components: {
    TableSelect,
    ColumnFilter,
    ToolsFoodView,
    ToolsFoodTempView,
    UploadOutlined,
    Login,
  },
  data() {
    return {
      HOST,
      bodyRect: { width: 900, height: 800 },
      v: 1,
      columns: [
        {
          key: "id",
          title: "id",
          dataIndex: "id",
          width: 80,
          _filter: true,
        },
        {
          key: 'name',
          title: "名称",
          dataIndex: "name",
          width: 240,
          _filter: true,
        },
        {
          key: "type",
          title: "类型",
          dataIndex: "type",
          width: 160,
          _filter: true,
        },
        {
          key: 'fileName',
          title: "文件",
          dataIndex: "fileName",
          width: 260,
          _filter: true,
        },
        {
          key: 'status',
          title: "状态",
          dataIndex: "status",
          width: 140,
          _filter: true,
        },
        {
          key: "resultTitle",
          title: "结果",
          dataIndex: "resultTitle",
          width: 140,
          _filter: true,
        },
        {
          key: "executedAt",
          title: "执行时间",
          dataIndex: "executedAt",
          _filterPanes: [{ key: 'date', label: '日期' }, { key: 'text', label: '时间' }],
          _customFilterOption: (row, col) => ({
            value: row[col.dataIndex],
            text: this.toString(row[col.dataIndex]),
            date: this.toYYYYMMDD(row[col.dataIndex]),
            color: 'white'
          }),
          width: 180,
          _filter: true,
        },
        {
          key: "doneAt",
          title: "结束时间",
          dataIndex: "doneAt",
          _filterPanes: [{ key: 'date', label: '日期' }, { key: 'text', label: '时间' }],
          _customFilterOption: (row, col) => ({
            value: row[col.dataIndex],
            text: this.toString(row[col.dataIndex]),
            date: this.toYYYYMMDD(row[col.dataIndex]),
            color: 'white'
          }),
          width: 180,
          _filter: true,
        },
        {
          key: "operator",
          title: "操作人",
          dataIndex: "operator",
          width: 80,
          _filter: true,
        },
        {
          key: 'op',
          title: "操作",
          dataIndex: "op",
          width: 100,
        },
      ],
      table: [],
      tableFilters: {},
      loading: false,
      uploadUrl: `${HOST}/api/common/v1/upload`,
      fileTable: [],
      // form
      taskTypes: [
        "修改美团外卖商品",
        "修改美团外卖分类",
        "替换美团外卖商品",
        "恢复已替换美团外卖商品",
        "修改美团零售商品",
        "增删美团外卖测试商品",
        "修改饿了么外卖商品",
        "修改饿了么外卖分类",
        "修改美团收藏有礼",
        "修改美团店内领券",
        "删除美团售卖代金券",
        "修改美团下单返券",
        "修改美团满减活动",
        "修改美团减配送费",
      ],
      taskTemplateNames: {
        修改美团外卖商品: "美团外卖修改商品模板.xlsx",
        修改饿了么外卖商品: "饿了么外卖修改商品模板.xlsx",
        修改美团外卖分类: "美团外卖修改分类模板.xlsx",
        修改饿了么外卖分类: "饿了么外卖修改分类模板.xlsx",
        替换美团外卖商品: "美团外卖替换商品模板.xlsx",
        修改美团零售商品: "美团零售修改商品模板.xlsx",
        增删美团外卖测试商品: "美团外卖增删测试商品模板.xlsx",
        修改美团收藏有礼: "美团外卖修改收藏有礼模板.xlsx",
        修改美团店内领券: "美团外卖修改店内领券模板.xlsx",
        删除美团售卖代金券: "美团外卖删除售卖代金券模板.xlsx",
        修改美团下单返券: "美团外卖修改下单返券模板.xlsx",
        修改美团满减活动: "美团外卖修改满减活动模板.xlsx",
        修改美团减配送费: "美团外卖修改减配送费模板.xlsx",
      },
      cookies: [],
      form: {
        name: "",
        type: "",
        cookie: "",
        filename: "",
        filepath: "",
        table: null,
        execType: "立即",
        execAt: moment("23:00:00", "HH:mm:ss"),
      },
      // modal
      viewType: null,
      viewedTask: {
        type: null,
        id: null,
      },
      modalShow: false,
      viewModalShow: false,
      loginModalShow: false,
      foodsTempModalShow: false,
      throtFetchTable: () => { },
    }
  },
  computed: {
    account() {
      return this.$store.state.account ?? localStorage.getItem("account")
    },
    token() {
      return this.$store.state.token ?? localStorage.getItem("token")
    },
    extendedCols() {
      return this.columns.map(col => ({
        customFilterDropdown: col._filter,
        onFilter: (value, record) => record[col.dataIndex] == value,
        _filterPanes: [{ key: 'text', label: '内容' }],
        _customFilterOption: (row, col) => ({ value: row[col.dataIndex], text: this.toString(row[col.dataIndex]), color: 'white' }),
        showSorterTooltip: false,
        sorter: col._sort ? (a, b) => this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]) : null,
        ...col
      }))
    },
    scrollX() {
      return this.columns.map((col) => col.width ?? 200).reduce((p, v) => p + v, 0)
    },
    scrollY() {
      return this.bodyRect.height - 204
    },
    scroll() {
      return { y: this.scrollY, x: this.scrollX }
    },
    taskTypeOpts() {
      return this.taskTypes.map((v) => ({ label: v, value: v }))
    },
    cookieOpts() {
      return this.cookies.map((s) => ({
        key: `${s.shopId} ${s.shopName}`,
        value: s.auth,
        label: `${s.platform == 1 ? "**美团*美团*美团**" : "**饿了么*饿了么*饿了么**"} ${s.shopName
          }`,
        id_name: `${s.shopId} ${s.shopName}`,
      }))
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
    toNum(str) {
      try {
        let f = parseFloat(str)
        if (isNaN(f)) return 0
        return f
      } catch (err) {
        return 0
      }
    },
    toString(val) {
      if (val == null) return ''
      if (typeof val == 'string') return val
      return JSON.stringify(val)
    },
    toYYYYMMDD(val) {
      return dayjs(val).format('YYYYMMDD')
    },
    getStatusTagColor(status) {
      if (status == "全部成功") return "success"
      if (status.match(/部分成功|全部失败|异常/)) return "error"
      if (status == "进行中") return "processing"
      return "default"
    },
    fetchTable() {
      this.loading = true
      baseFetch({
        url: `/v1/tools/update-foods/tasks`
      })
        .then((res) => {
          this.table = res.tasks
          this.loading = false
        })
        .catch((e) => {
          message.error(e.message)
          this.loading = false
        })
    },
    onTableChange(pagination, filters, sorter, { currentDataSource }) {
      console.log('filters', filters)
      this.tableFilters = filters
      // console.log('tools-food-ct', this.currentTable)
      // console.log('tools-food-cds', currentDataSource)
    },
    onColFilterVisChange(visible, key) {
      let i = this.columns.findIndex(col => col.key == key)
      if (i != -1) this.v += 1
    },
    fetchCookies() {
      baseFetch({
        url: "/v1/shops/cookies",
      })
        .then((res) => {
          this.cookies = res
        })
        .catch((err) => {
          message.error(err.message)
        })
    },
    onCookieFilter(input, option) {
      return option.id_name.includes(input)
    },
    onFileChange({ file }) {
      if (file.status == "done" && file?.response?.code == 0) {
        console.log(file)
        this.form.filename = file.response.data.filename
        this.form.filepath = file.response.data.path

        baseFetch({
          baseURL: `${HOST}/api/common`,
          url: '/v1/excel',
          params: {
            path: file.response.data.path
          }
        })
          .then(res => {
            this.fileTable = res.filter(v => Object.values(v).join("") != "").map((v, i) => ({ ...v, _i: i }))
          })
          .catch(err => {
            message.error(err.message)
          })
      }
    },
    addTask() {
      this.fetchCookies()
      this.modalShow = true
    },
    submitTask() {
      const getExecutedAt = () => {
        if (this.form.execType == "立即") return ":now"
        if (this.form.execAt.isBefore(moment(), "hour")) {
          return this.form.execAt.add(1, "day").format("YYYY-MM-DD HH:mm:ss")
        }
        return this.form.execAt.format("YYYY-MM-DD HH:mm:ss")
      }

      if (
        [this.form.name, this.form.type, this.form.cookie, this.form.filename].some(
          (v) => v == ""
        )
      ) {
        message.error("表单填写不完整")
        return
      }

      if (this.form.name.length > 100) {
        message.error("任务名称过长")
        return
      }

      if (!this.account) {
        message.error("请先登录")
        this.loginModalShow = true
        return
      }

      app.run("ws://", "update-foods/v1/add-task", {
        name: this.form.name,
        type: this.form.type,
        input: {
          name: this.form.filename,
          cookie: this.form.cookie,
          table: this.form.table,
        },
        executedAt: getExecutedAt(),
        meta: {
          account: this.account,
          token: this.token,
        },
      })

      this.modalShow = false
    },
    cancelTask(id) {
      app.run("ws://", "update-foods/v1/cancel-task", { id })
    },
    submitRestoreSubTasks(recs) {
      if (recs.length == 0) return

      this.form.name = `恢复已替换美团外卖商品-${recs[0].替换任务id}`
      this.form.type = "恢复已替换美团外卖商品"
      this.form.filename = `恢复已替换美团外卖商品-${recs[0].替换任务id}.x-${+dayjs()}.xlsx`

      this.form.table = recs.map((rec, i) => ({
        _i: i,
        店铺id: rec.店铺id,
        店铺名称: rec.店铺名称,
        分类名称: rec.分类名称,
        商品名称: rec.商品名称,
        替换后分类名称: rec.替换后分类名称,
        替换后商品名称: rec.替换后商品名称,
        替换任务id: rec.替换任务id,
        替换i: rec._i,
      }))
      this.fileTable = this.form.table

      this.viewModalShow = false
      this.addTask()
    },
    submitRetryTasks(recs) {
      if (recs.length == 0) return

      this.form.name = `重试-${recs[0].重试任务类型}-${recs[0].重试任务id}`
      this.form.type = recs[0].重试任务类型
      this.form.filename = `重试-${recs[0].重试任务类型}-${recs[0].重试任务id}.x-${+dayjs()}.xlsx`

      this.form.table = recs.map((rec, i) => ({
        ...rec,
        _i: i,
        result: null,
      }))
      this.fileTable = this.form.table

      this.viewModalShow = false
      this.addTask()
    },
    downloadPoiFoodsTemp() {
      this.foodsTempModalShow = true
    },
    onLoginSuccess() {
      this.loginModalShow = false
    },
    onAddFoodTask(json) {
      if (json.code != 0) {
        message.error(json.message)
        return
      }
    },
    onCancelFoodTask(json) {
      if (json.code != 0) {
        message.error(json.message)
        return
      }
    },
    onFoodTaskStatus() {
      this.throtFetchTable()
    },
    viewTaskInputs(rec) {
      this.viewType = "inputs"
      this.viewedTask = { type: rec.type, id: rec.id }
      this.viewModalShow = true
    },
    viewTaskResults(rec) {
      this.viewType = "results"
      this.viewedTask = { type: rec.type, id: rec.id }
      this.viewModalShow = true
    },
  },
  created() {
    this.throtFetchTable = throttle(this.fetchTable, 800)

    app.on("update-foods/v1/add-task-res", this.onAddFoodTask.bind(this))
    app.on("update-foods/v1/cancel-task-res", this.onCancelFoodTask.bind(this))
    app.on("update-foods/v1/task-status-change", this.onFoodTaskStatus.bind(this))

    this.fetchTable()
  },
  mounted() {
    this.bodyRect = document.body.getBoundingClientRect()
  },
  unmounted() {
    app.off("update-foods/v1/add-task-res", this.onAddFoodTask.bind(this))
    app.off("update-foods/v1/cancel-task-res", this.onCancelFoodTask.bind(this))
    app.off("update-foods/v1/task-status-change", this.onFoodTaskStatus.bind(this))
  },
}
</script>

<style lang="sass" scoped>
.tools-food
  padding: 20px
  margin: 0 auto

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
      column-gap: 12px

  .exec-form-item
    display: flex
    align-items: center

.updown-table
  display: flex
  align-items: center
  column-gap: 18px
</style>
