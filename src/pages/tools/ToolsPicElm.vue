<template lang="pug">
.tools-food-mt
  div(
    style="display: flex; flex-direction: column; height: 100%; align-items: flex-start; justify-content: flex-start; row-gap: 0.75rem"
  )
    a-auto-complete(
      v-model:value="auth",
      :filterOption="onFilterAuth",
      placeholder="请输入Cookie",
      size="small",
      style="width: 300px"
    )
      template(#dataSource)
        a-select-option(v-for="au in auths", :key="`${au.shopId}||${au.auth}`") {{ au.shopId }} {{ au.shopName }}

    a-button(@click="run", size="small", :loading="loading") 开始上传

    a-upload(
      v-model:file-list="fileList",
      action="http://192.168.3.3:9005/upload"
    )
      a-button(size="small")
        UploadOutlined
        span 上传图片

    a-upload(
      v-model:file-list="fileListDir",
      action="http://192.168.3.3:9005/upload",
      :directory="true"
    )
      a-button(size="small")
        UploadOutlined
        span 上传图片文件夹

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
        :href="`http://192.168.3.3:9005/${picTableUrl}`",
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
              div(style="white-space: pre-wrap") {{ record?._res?.code == 0 ? record?._res?.data : record?._res?.err }}
            div(
              :class="[{ 'succ-text': record?._res?.code == 0 }, { 'error-text': record?._res?.code == 1 }]"
            ) {{ text }}
        template(v-else-if="column.title == '图片'")
          a-image(:width="100", :src="record.图片链接")
</template>

<script>
  import { UploadOutlined } from "@ant-design/icons-vue";
  // import SockJS from "sockjs-client";
  import { message } from "ant-design-vue";
  import Shop from "../../api/shop";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "tools-pic-elm",
    components: {
      UploadOutlined,
      TableSelect,
    },
    data() {
      return {
        fileList: [],
        fileListDir: [],
        // sock: new SockJS("http://192.168.3.3:9998/price_update"),
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
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.商品名称 ?? '') == value,
          },
          {
            title: "图片",
            dataIndex: "图片链接",
            width: 120
          },
          {
            title: "图片链接",
            dataIndex: "图片链接",
            width: 300,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.图片链接 ?? '') == value,
          },
        ];
      },
      allFileList() {
        return this.fileList.concat(this.fileListDir);
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
        if (this.auth.length == 0) {
          message.error("please input cookie");
          return;
        }

        app.run("ws://", "@upload-pic", {
          auth: this.auth.split("||")[1],
          platform: 2,
          shopId: this.auth.split("||")[0],
          pics: this.allFileList.map((f) => ({
            uid: f.uid,
            filename: f?.response?.res?.filename,
          })),
        });

        this.loading = true;
      },
      fetchAuths() {
        this.loading = false;
        new Shop()
          .auths()
          .then((res) => {
            this.auths = res.filter((v) => v.platform == 2);
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
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
          newTable[targetIdx]["图片链接"] = state.data.imageUrl;
          this.table = newTable;
          console.log("row", newTable);
        }
      },
      exportPicTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.table,
        });
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 276;

      // this.sock.onopen = function () {
      //   console.log("open");
      // };

      // this.sock.onclose = function () {
      //   console.log("close");
      // };

      this.fetchAuths();
    },
    mounted() {
      app.on("@upload-pic", (state) => {
        console.log(state);
        if (state._i == -1) this.loading = false;
        this.results.push(JSON.stringify(state));
        this.updateRow(state._i, state);
        // window.scrollTo(0, document.body.scrollHeight + 20);
      });

      app.on("@upload-pic-end", () => {
        this.loading = false;
      });

      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.picTableUrl = state.path;
      });
    },
    watch: {
      auth() {
        console.log(this.auth);
      },
      allFileList(n) {
        console.log(n);
        this.table = n.map((v) => ({
          商品名称: v.name.slice(0, v.name.lastIndexOf('.')),
          图片链接: "",
          _i: v.uid,
        }));
        console.log("table", this.table);
      },
    },
  };
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
