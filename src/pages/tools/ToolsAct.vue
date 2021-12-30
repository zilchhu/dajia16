<template lang="pug">
.tools-act
  .header
    div
    .controls
      a-button(size="small", @click="fetchTable") 刷新列表
      a-button(size="small", @click="addTask") 新增任务

  s-table.ant-table-change(
    :columns="columns",
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
      template(v-if="column.dataIndex == '文件'")
        div(style="overflow: hidden", :title="text")
          a-button(type="link", size="small", @click="viewTaskInputs(record)") {{ text }}
      template(v-else-if="column.dataIndex == '状态'")
        div(style="cursor: pointer")
          a-tag(
            :color="getStatusTagColor(text)",
            @click="viewTaskResults(record)"
          ) {{ text }}
      template(v-else-if="column.dataIndex == '结果'")
        a-button(type="link", @click="viewTaskResults(record)") {{ text }}
      template(v-else-if="column.dataIndex == '操作'")
        a-button(
          v-if="record.状态 == '待执行'",
          type="link",
          size="small",
          @click="cancelTask(record.id)"
        ) 取消

  a-modal(
    v-model:visible="modalShow",
    title="新增任务",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.8"
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
            action="http://192.168.3.3:9007/upload",
            @change="onFileChange"
          )
            a-button(size="small")
              UploadOutlined
              span 上传表格
          a(
            v-show="form.type",
            :href="`http://192.168.3.3:9007/${taskModels[form.type]}`",
            download
          ) 下载模板
      ToolsActView(
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
      a-button(type="primary", @click="submitTask") 提交

  a-modal(
    v-model:visible="viewModalShow",
    :footer="null",
    centered,
    :width="bodyRect.width * 0.8"
  )
    .view-modal
      .header
    ToolsActView(
      :viewType="viewType",
      :taskType="viewedTask.type",
      :taskId="viewedTask.id",
      :scrollY="bodyRect.height * 0.7"
    ) 
</template>

<script>
  import app from "apprun";
  import moment from "moment";
  import { message } from "ant-design-vue";
  import { UploadOutlined } from "@ant-design/icons-vue";
  import TableSelect from "../../components/TableSelect";
  import ToolsActView from "./ToolsActView.vue";
  import Shop from "../../api/shop";

  function throttle(fn, wait) {
    let timer = null;
    return function () {
      let context = this;
      let args = arguments;

      if (!timer) {
        timer = setTimeout(function () {
          fn.apply(context, args);
          timer = null;
        }, wait);
      }
    };
  }

  export default {
    name: "tool-act",
    components: {
      TableSelect,
      ToolsActView,
      UploadOutlined,
    },
    data() {
      return {
        bodyRect: { width: 900, height: 800 },
        columns: [
          {
            title: "名称",
            dataIndex: "名称",
            width: 260,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.名称 ?? "") == value,
          },
          {
            title: "类型",
            dataIndex: "类型",
            width: 160,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.类型 ?? "") == value,
          },
          {
            title: "文件",
            dataIndex: "文件",
            width: 260,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.文件 ?? "") == value,
          },
          {
            title: "状态",
            dataIndex: "状态",
            width: 140,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.状态 ?? "") == value,
          },
          {
            title: "结果",
            dataIndex: "结果",
            width: 140,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.结果 ?? "") == value,
          },
          {
            title: "执行时间",
            dataIndex: "执行时间",
            width: 180,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.执行时间 ?? "") == value,
          },
          {
            title: "结束时间",
            dataIndex: "结束时间",
            width: 180,
          },
          {
            title: "操作",
            dataIndex: "操作",
            width: 100,
          },
        ],
        table: [],
        fileTable: [],
        loading: false,
        // form
        taskTypes: [
          "修改美团收藏有礼",
          "修改美团店内领券",
          "删除美团售卖代金券",
          "修改美团下单返券",
          "修改美团满减活动",
          "修改美团减配送费",
        ],
        taskModels: {
          修改美团收藏有礼: '美团外卖修改收藏有礼模板.xlsx',
          修改美团店内领券: '美团外卖修改店内领券模板.xlsx',
          删除美团售卖代金券: '美团外卖删除售卖代金券模板.xlsx',
          修改美团下单返券: '美团外卖修改下单返券模板.xlsx',
          修改美团满减活动: '美团外卖修改满减活动模板.xlsx',
          修改美团减配送费: '美团外卖修改减配送费模板.xlsx',
        },
        cookies: [],
        form: {
          name: "",
          type: "",
          cookie: "",
          filename: "",
          filepath: "",
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
        throtFetchTable: () => {},
      };
    },
    computed: {
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 200)
          .reduce((p, v) => p + v, 0);
      },
      scrollY() {
        return this.bodyRect.height - 204;
      },
      scroll() {
        return { y: this.scrollY, x: this.scrollX };
      },
      taskTypeOpts() {
        return this.taskTypes.map((v) => ({ label: v, value: v }));
      },
      cookieOpts() {
        let options = this.cookies.map((s) => ({
          key: `${s.shopId} ${s.shopName}`,
          value: s.auth,
          label: `${s.shopName} ${s.platform == 1 ? "美团" : "饿了么"}`,
          id_name: `${s.shopId} ${s.shopName}`,
        }));
        return options;
      },
    },
    methods: {
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      getStatusTagColor(status) {
        if (status == "全部成功") return "success";
        if (status.match(/部分成功|全部失败|异常/)) return "error";
        if (status == "进行中") return "processing";
        return "default";
      },
      fetchTable() {
        this.loading = true;
        app.run("ws2://", "get-act-tasks");
      },
      fetchCookies() {
        new Shop()
          .auths()
          .then((res) => {
            this.cookies = res;
          })
          .catch((err) => {
            message.error(err);
          });
      },
      onFileChange({ file }) {
        console.log(file);

        if (file.status == "done") {
          this.form.filename = file.response.result.filename;
          this.form.filepath = file.response.result.path;

          console.log(this.form);

          setTimeout(() => {
            app.run("ws2://", "upload-table", {
              table: file.response.result.filename,
            });
          }, 800);
        }
      },
      onCookieFilter(input, option) {
        return option.id_name.includes(input);
      },
      addTask() {
        this.modalShow = true;
      },
      submitTask() {
        const getExecutedAt = () => {
          if (this.form.execType == "立即") return ":now";
          if (this.form.execAt.isBefore(moment(), "hour")) {
            return this.form.execAt.add(1, "day").format("YYYY-MM-DD HH:mm:ss");
          }
          return this.form.execAt.format("YYYY-MM-DD HH:mm:ss");
        };

        if (
          [
            this.form.name,
            this.form.type,
            this.form.cookie,
            this.form.filename,
          ].some((v) => v == "")
        ) {
          message.error("表单填写不完整");
          return;
        }

        app.run("ws2://", "add-act-task", {
          name: this.form.name,
          type: this.form.type,
          input: {
            name: this.form.filename,
            path: this.form.filepath,
            cookie: this.form.cookie,
          },
          executedAt: getExecutedAt(),
        });

        this.modalShow = false;
      },
      cancelTask(id) {
        app.run("ws2://", "cancel-act-task", { id });
      },
      viewTaskInputs(rec) {
        this.viewType = "inputs";
        this.viewedTask = { type: rec.类型, id: rec.id };
        this.viewModalShow = true;
      },
      viewTaskResults(rec) {
        this.viewType = "results";
        this.viewedTask = { type: rec.类型, id: rec.id };
        this.viewModalShow = true;
      },
      onGetActTasks(state) {
        if (state.error) message.error(state.error);
        this.table = state.result.tasks;
        this.loading = false;
      },
      onUploadTable(state) {
        if (state.error) message.error(state.error);
        this.fileTable = state.result.jsonTable;
      },
      onAddActTask(state) {
        if (state.error) message.error(state.error);
      },
      onCancelActTask(state) {
        if (state.error) message.error(state.error);
      },
      onActTaskStatus(state) {
        this.throtFetchTable();
      },
    },
    created() {
      this.throtFetchTable = throttle(this.fetchTable, 800);
      app.on("get-act-tasks-res", this.onGetActTasks);
      app.on("upload-table-res", this.onUploadTable);
      app.on("add-act-task-res", this.onAddActTask);
      app.on("cancel-act-task-res", this.onCancelActTask);
      app.on("act-task-status", this.onActTaskStatus);

      this.fetchCookies();
      setTimeout(() => {
        this.fetchTable();
      }, 600);
    },
    mounted() {
      this.bodyRect = document.body.getBoundingClientRect();
    },
    unmounted() {
      app.off("get-act-tasks-res", this.onGetActTasks);
      app.off("upload-table-res", this.onUploadTable);
      app.off("add-act-task-res", this.onAddActTask);
      app.off("cancel-act-task-res", this.onCancelActTask);
      app.off("act-task-status", this.onActTaskStatus);
    },
  };
</script>


<style lang="sass" scoped>
.tools-act
  padding: 20px
  margin: 0 auto

  .header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 6px

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
</style>