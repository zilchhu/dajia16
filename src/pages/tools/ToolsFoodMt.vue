<template lang="pug">
.tools-food-mt
  div(
    style="display: flex; align-items: center; justify-content: center; column-gap: 0.75rem"
  )
    a(:href="templateUrl", target="_blank") 下载模板v2
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
      placeholder="请输入Cookie",
      size="small",
      style="width: 400px"
    )
      template(#dataSource)
        a-select-option(v-for="au in auths", :key="`${au.shopId}||${au.auth}`") {{ au.shopId }} {{ au.shopName }}

    a-button(@click="run", size="small", :loading="loading") 立即运行
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
      #filterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :style="`min-width: 160px; width: ${column.width || 220}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )

    template(#tooltip="{ text, record }")
      a-tooltip
        template(#title)
          div(style="white-space: pre-wrap") {{ record?._res?.code == 0 ? record?._res?.data : record?._res?.err }}
        div {{ text }}

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
    name: "tools-food-mt",
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
        templateUrl: "http://192.168.3.3:9007/美团折扣商品涨原价表格模板v2.xlsx",
        run_at: moment("23:00:00", "HH:mm:ss"),
        delay_run_loading: false,
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺id == value,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.分类名称 == value,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
            slots: { filterDropdown: "filterDropdown", customRender: "tooltip" },
            onFilter: (value, record) => record.商品名称 == value,
          },
          {
            title: "商品id",
            dataIndex: "商品id",
            width: 90,
            slots: { filterDropdown: "filterDropdown", customRender: "tooltip" },
            onFilter: (value, record) => record.商品id == value,
          },
          {
            title: "规格名称",
            dataIndex: "规格名称",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.规格名称 == value,
          },
          {
            title: "价格",
            dataIndex: "价格",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.价格) - this.toNum(b.价格),
          },
          {
            title: "餐盒数量",
            dataIndex: "餐盒数量",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.餐盒数量) - this.toNum(b.餐盒数量),
          },
          {
            title: "餐盒价格",
            dataIndex: "餐盒价格",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.餐盒价格) - this.toNum(b.餐盒价格),
          },
          {
            title: "最小购买量",
            dataIndex: "最小购买量",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.最小购买量) - this.toNum(b.最小购买量),
          },
          {
            title: "折扣价格",
            dataIndex: "折扣价格",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.折扣价格) - this.toNum(b.折扣价格),
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.折扣限购) - this.toNum(b.折扣限购),
          },
          {
            title: "数量",
            dataIndex: "数量",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.数量) - this.toNum(b.数量),
          },
          {
            title: "数量单位",
            dataIndex: "数量单位",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.数量单位 == value,
          },
          {
            title: "图片",
            dataIndex: "图片",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.图片 == value,
          },
          {
            title: "新商品名",
            dataIndex: "新商品名",
            width: 200,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.新商品名 == value,
          },
          {
            title: "新分类名",
            dataIndex: "新分类名",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.新分类名 == value,
          },
          {
            title: "分类描述",
            dataIndex: "分类描述",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.分类描述 == value,
          },
          {
            title: "开启置顶",
            dataIndex: "开启置顶",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.开启置顶 == value,
          },
          {
            title: "关闭置顶",
            dataIndex: "关闭置顶",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.关闭置顶 == value,
          },
          {
            title: "置顶时段",
            dataIndex: "置顶时段",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.置顶时段 == value,
          },
          {
            title: "分类排序",
            dataIndex: "分类排序",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.分类排序 == value,
          },
          {
            title: "属性",
            dataIndex: "属性",
            width: 110,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.属性 == value,
          },
          {
            title: "描述",
            dataIndex: "描述",
            width: 110,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.描述 == value,
          },
          {
            title: "上架商品",
            dataIndex: "上架商品",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.上架商品 == value,
          },
          {
            title: "下架商品",
            dataIndex: "下架商品",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.下架商品 == value,
          },
          {
            title: "删除商品",
            dataIndex: "删除商品",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            ellipsis: true,
            onFilter: (value, record) => record.删除商品 == value,
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

        app.run("ws://", "@update-food", {
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

        app.run("ws://", "@update-food", {
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
      app.on("@upload-table", (state) => {
        console.log(state);
        this.jsonTable = state.jsonTable;
        this.table = state.jsonTable;
      });

      app.on("@update-food", (state) => {
        console.log(state);
        if (state._i == -1) this.loading = false;
        this.results.push(JSON.stringify(state));
        this.updateRow(state._i, state);
        // window.scrollTo(0, document.body.scrollHeight + 20);
      });
    },
    watch: {
      auth() {
        console.log(this.auth);
      },
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
