<template lang="pug">
.tools-food-mt
  div(
    style="display: flex; align-items: center; justify-content: center; column-gap: 0.75rem"
  )
    a(:href="templateUrl", target="_blank") 下载模板
    a-upload(
      v-model:file-list="fileList",
      action="http://192.168.3.3:9005/upload",
      @change="onFileChange"
    )
      a-button(size="small")
        UploadOutlined
        span 上传表格

    a-auto-complete(
      v-model:value="auth",
      :filterOption="onFilterAuth",
      placeholder="输入Cookie",
      size="small",
      style="width: 400px"
    )
      template(#dataSource)
        a-select-option(v-for="au in auths", :key="`${au.shopId}||${au.auth}`") {{ au.shopId }} {{ au.shopName }}

    a-button(@click="run", size="small", :loading="loading") 运行
    a-time-picker(v-model:value="run_at")
    a-button(@click="delayRun", size="small", :loading="delay_run_loading") 定时运行

  a-divider

  a-table.ant-table-change(
    v-show="table.length > 0",
    :columns="columns",
    :data-source="table",
    rowKey="_i",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }",
    :rowClassName="(record, index) => (record?._res?.code == 0 ? 'row-succ' : record?._res?.code == 1 ? 'row-error' : '')"
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
      template(v-if="column.dataIndex == '门店ID'")
        a-tooltip
          template(#title)
            div(style="white-space: pre-wrap") {{ record?._res?.code == 0 ? record?._res?.data : record?._res?.err }}
          div(
            :class="[{ 'succ-text': record?._res?.code == 0 }, { 'error-text': record?._res?.code == 1 }]"
          ) {{ text }}

  .left-bottom-div(v-show="table.length > 0")
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 转换格式(满?减? -> ?-?)
    a(
      v-show="tableUrl",
      :href="`http://192.168.3.3:9005/${tableUrl}`",
      target="_blank"
    ) 下载

  //- p(style="white-space: pre-wrap") {{ results.join('\n') }}
</template>

<script>
  import { UploadOutlined } from "@ant-design/icons-vue";
  // import SockJS from "sockjs-client";
  import { message } from "ant-design-vue";
  import Shop from "../../api/shop";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";
  import moment from "moment";

  export default {
    name: "tools-full-discount",
    components: {
      UploadOutlined,
      TableSelect,
    },
    data() {
      return {
        fileList: [],
        // sock: new SockJS("http://192.168.3.3:9998/price_update"),
        results: [],
        auths: [],
        auth: "",
        jsonTable: [],
        table: [],
        scrollY: 900,
        loading: false,
        tableName: "",
        tableUrl: null,
        templateUrl: "http://192.168.3.3:9007/满减活动.xlsx",
        run_at: moment("23:00:00", "HH:mm:ss"),
        delay_run_loading: false,
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "门店ID",
            dataIndex: "门店ID",
            width: 90,
            customFilterDropdown: true,
            onFilter: (value, record) => record.门店ID == value,
          },
          {
            title: "门店名称",
            dataIndex: "门店名称",
            width: 90,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.门店名称 ?? "") == value,
          },
          {
            title: "满减",
            dataIndex: "满减",
            width: 200,
            customFilterDropdown: true,
            onFilter: (value, record) => record.满减 == value,
          },
        ];
      },
      scrollX() {
        return this.reduceWidth(this.columns);
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName]))).map(
          (col) => ({
            label: col || "",
            value: col || "",
          })
        );
      },
      reduceWidth(nodes) {
        return nodes.reduce((sw, c) => {
          if (c.width) return sw + c.width;
          if (c.children) return sw + this.reduceWidth(c.children);
          return sw;
        }, 10);
      },
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      flattenObj(obj) {
        if (obj == null) return "";
        if (typeof obj != "object") return obj;
        return Object.entries(obj)
          .map(([k, v]) => `${k} ${typeof v == "string" ? v : JSON.stringify(v)}`)
          .join("\n");
      },
      onFilterAuth(input, option) {
        console.log(input, option);
        return true;
      },
      run() {
        let file = this.fileList.find((v) => v.status == "done");

        if (!file) {
          message.error("please upload a file");
          return;
        }

        if (this.auth.length == 0) {
          message.error("please input cookie");
          return;
        }

        app.run("ws://", "update-full-discount-acts", {
          auth: this.auth.split("||")[1] || this.auth,
          platform: 1,
          jsonTable: this.jsonTable,
        });

        this.loading = true;
      },
      delayRun() {
        let file = this.fileList.find((v) => v.status == "done");

        if (!file) {
          message.error("please upload a file");
          return;
        }

        if (this.auth.length == 0) {
          message.error("please input cookie");
          return;
        }

        app.run("ws://", "update-full-discount-acts", {
          auth: this.auth.split("||")[1] || this.auth,
          platform: 1,
          at: +this.run_at,
          jsonTable: this.jsonTable,
        });

        message.success("任务添加成功");
        // this.loading = true;
      },
      onFileChange({ file }) {
        if (file.status == "done" && file?.response?.res?.filename) {
          this.tableName = file.response.res.filename;
          setTimeout(() => {
            app.run("ws://", "@upload-table", {
              table: file.response.res.filename,
            });
          }, 800);
        }
      },
      updateRow(_i, state) {
        let newTable = [...this.table];
        let targetIdx = newTable.findIndex((v) => v._i == _i);
        if (targetIdx > -1) {
          newTable[targetIdx]._res = {
            code: state.code,
            data: this.flattenObj(state.data),
            err: this.flattenObj(state.err),
          };
          this.table = newTable;
          console.log("row", newTable);
        }
      },
      fetchAuths() {
        this.loading = false;
        new Shop()
          .auths()
          .then((res) => {
            this.auths = res.filter((v) => v.platform == 1);
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      transformTable() {
        return this.table.map((row) => {
          let mj = row.满减;
          let matches = [...row.满减.matchAll(/满(\d+(\.\d+)?)减(\d+(\.\d+)?)/g)];
          if (matches?.length > 0)
            mj = matches.map((m) => [m[1], m[3]].join("-")).join(" ");

          return {
            ...row,
            满减: mj,
          };
        });
      },
      exportTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.transformTable(),
        });
      },
    },
    created() {
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });

      app.on("@upload-table", (state) => {
        console.log(state);
        this.jsonTable = state.jsonTable;
        this.table = state.jsonTable;
      });

      app.on("update-full-discount-acts-res", (state) => {
        console.log(state);
        if (state._i == -1) this.loading = false;
        this.results.push(JSON.stringify(state));
        this.updateRow(state._i, state);
        // window.scrollTo(0, document.body.scrollHeight + 20);
      });

      this.scrollY = document.body.clientHeight - 276;

      this.fetchAuths();
    },
  };
</script>

<style lang="sass" scoped>
.tools-food-mt
  padding: 0 50px
  margin: 20px auto

.succ-text
  background: rgba(0, 255, 0, .7)

.error-text
  background: rgba(255, 0, 0, .7)
</style>
