<template lang="pug">
.tools-food
  .header
    .title 商品任务
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
        div(style="cursor: pointer", title="点此查看实时结果")
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
            action="http://192.168.3.3:9005/upload",
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
    v-model:visible="viewModalShow",
    :footer="null",
    :destroyOnClose="false",
    centered,
    :width="bodyRect.width * 0.8"
  )
    .view-modal
      .header
    ToolsFoodView(
      :viewType="viewType",
      :taskType="viewedTask.type",
      :taskId="viewedTask.id",
      :scrollY="bodyRect.height * 0.7"
    ) 
</template>

<script>
  import app from "apprun";
  import moment from "moment";
  import dayjs from "dayjs";
  import { message } from "ant-design-vue";
  import { UploadOutlined } from "@ant-design/icons-vue";
  import TableSelect from "../../components/TableSelect";
  import ToolsFoodView from "./ToolsFoodView.vue";
  import Login from "../../components/user/Login";
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
    name: "tool-food",
    components: {
      TableSelect,
      ToolsFoodView,
      UploadOutlined,
      Login,
    },
    data() {
      return {
        bodyRect: { width: 900, height: 800 },
        columns: [
          {
            title: "id",
            dataIndex: "id",
            width: 80,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.id ?? "") == value,
          },
          {
            title: "名称",
            dataIndex: "名称",
            width: 240,
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
            title: "操作人",
            dataIndex: "操作人",
            width: 80,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.操作人 ?? "") == value,
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
          "修改美团外卖商品",
          "修改饿了么外卖商品",
          "修改美团外卖分类",
          "修改饿了么外卖分类",
          "替换美团外卖商品",
          "修改美团零售商品",
          "增删美团外卖测试商品",
        ],
        taskModels: {
          修改美团外卖商品: "美团外卖修改商品模板.xlsx",
          修改饿了么外卖商品: "饿了么外卖修改商品模板.xlsx",
          修改美团外卖分类: "美团外卖修改分类模板.xlsx",
          修改饿了么外卖分类: "饿了么外卖修改分类模板.xlsx",
          替换美团外卖商品: "美团外卖替换商品模板.xlsx",
          修改美团零售商品: "美团零售修改商品模板.xlsx",
          增删美团外卖测试商品: "美团外卖增删测试商品模板.xlsx",
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
        loginModalShow: false,
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
          label: `${
            s.platform == 1 ? "**美团*美团*美团**" : "**饿了么*饿了么*饿了么**"
          } ${s.shopName}`,
          id_name: `${s.shopId} ${s.shopName}`,
        }));
        return options;
      },
      account() {
        return this.$store.state.account ?? localStorage.getItem("account");
      },
      token() {
        return this.$store.state.token ?? localStorage.getItem("token");
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
        app.run("ws://", "get-food-tasks");
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
        if (file.status == "done" && file?.response?.res?.filename) {
          this.form.filename = file.response.res.filename;
          this.form.filepath = file.response.res.path;

          setTimeout(() => {
            app.run("ws://", "@upload-table", {
              table: file.response.res.filename,
            });
          }, 800);
        }
      },
      onCookieFilter(input, option) {
        return option.id_name.includes(input);
      },
      onLoginSuccess() {
        this.loginModalShow = false;
      },
      addTask() {
        // message.error("有BUG不要用");
        // return;
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

        if (this.form.name.length > 100) {
          message.error("任务名称过长");
          return;
        }

        if (!this.account) {
          message.error("请先登录");
          this.loginModalShow = true;
          return;
        }

        app.run("ws://", "add-food-task", {
          name: this.form.name,
          type: this.form.type,
          input: {
            name: this.form.filename,
            path: this.form.filepath,
            cookie: this.form.cookie,
          },
          executedAt: getExecutedAt(),
          meta: {
            account: this.account,
            token: this.token,
          },
        });

        this.modalShow = false;
      },
      cancelTask(id) {
        app.run("ws://", "cancel-food-task", { id });
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
      onGetFoodTasks(state) {
        if (state.error) message.error(state.error);
        this.table = state.result.tasks;
        this.loading = false;
      },
      onUploadTable(state) {
        this.fileTable = state.jsonTable;
      },
      onAddFoodTask(state) {
        if (state.error) message.error(state.error);
      },
      onCancelFoodTask(state) {
        if (state.error) message.error(state.error);
      },
      onFoodTaskStatus(state) {
        this.throtFetchTable();
      },
    },
    created() {
      console.log("tool-food created!");
      this.throtFetchTable = throttle(this.fetchTable, 800);
      app.on("get-food-tasks-res", this.onGetFoodTasks);
      app.on("@upload-table", this.onUploadTable);
      app.on("add-food-task-res", this.onAddFoodTask);
      app.on("cancel-food-task-res", this.onCancelFoodTask);
      app.on("food-task-status", this.onFoodTaskStatus);

      this.fetchCookies();
      setTimeout(() => {
        this.fetchTable();
      }, 600);
    },
    mounted() {
      this.bodyRect = document.body.getBoundingClientRect();
    },
    unmounted() {
      console.log("tool-food unmounted!");
      app.off("get-food-tasks-res", this.onGetFoodTasks);
      app.off("@upload-table", this.onUploadTable);
      app.off("add-food-task-res", this.onAddFoodTask);
      app.off("cancel-food-task-res", this.onCancelFoodTask);
      app.off("food-task-status", this.onFoodTaskStatus);
    },
  };
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
      column-gap: 6px

.updown-table
  display: flex
  align-items: center
  column-gap: 18px

.exec-form-item
  display: flex
  align-items: center
</style>