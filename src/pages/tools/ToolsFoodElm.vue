<template lang="pug">
.tools-food-elm
  div(style="display: flex; align-items: center; column-gap: 0.75rem")
    a(href="/美团折扣商品涨原价表格模板.xlsx", target="_blank") 下载模板
    a-upload(
      v-model:file-list="fileList",
      action="http://192.168.3.3:9005/upload",
      @change="onFileChange"
    )
      a-button(size="small")
        UploadOutlined
        span 上传表格
    a-button(@click="run", size="small", :disabled="false") 运行

    a-auto-complete(
      v-model:value="auth",
      placeholder="请输入Cookie",
      :filter-option="authFilter",
      size="small",
      style="width: 400px"
    )
      template(#dataSource)
        a-select-option(v-for="au in auths", :key="`${au.shopId}||${au.auth}`") {{ au.shopId }} {{ au.shopName }} {{ au.auth }}
  //- p {{ fileList }}

  a-divider

  a-table.ant-table-change(v-show="table.length > 0" :columns="columns" :data-source="table" rowKey="_i" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#tooltip="{text, record}")
      a-tooltip
        template(#title)
          div(style="white-space: pre-wrap;") {{record?._res?.code == 0 ? record?._res?.data : record?._res?.err}}
        div(:class="[{'succ-text': record?._res?.code == 0}, {'error-text': record?._res?.code == 1}]" ) {{text}}
  //- p(style="white-space: pre-wrap") {{ results.join('\n') }}
</template>

<script>
  import { UploadOutlined } from "@ant-design/icons-vue";
  // import SockJS from "sockjs-client";
  import { message } from "ant-design-vue";
  import Shop from "../../api/shop";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "tools-food-elm",
    components: {
      UploadOutlined,
      TableSelect
    },
    data() {
      return {
        fileList: [],
        // sock: new SockJS("http://192.168.3.3:9997/price_update3"),
        results: [],
        auths: [],
        auth: "",
        jsonTable: [],
        table: [],
        scrollY: 900,
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
        ];
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
        console.log({
          table: file.response.res.filename,
          auth: this.auth.split("||")[1] || this.auth,
        });
        // this.sock.send(JSON.stringify({ table: file.response.res.filename, auth: this.auth.split('||')[1]  || this.auth}));
        // this.sock.onmessage = (e) => {
        //   console.log("message", e.data);
        //   this.results.push(e.data);
        //   window.scrollTo(0, document.body.scrollHeight + 20);
        // };
        app.run("ws://", "@update-food", {
          auth: this.auth.split("||")[1] || this.auth,
          platform: 2,
          jsonTable: this.jsonTable,
        });
      },
      onFileChange({ file }) {
        if (file.status == "done" && file?.response?.res?.filename) {
          setTimeout(() => {
            app.run("ws://", "@upload-table", {
              table: file.response.res.filename,
            });
          }, 800);
        }
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
            data: JSON.stringify(state.data),
            err: JSON.stringify(state.err),
          };
          this.table = newTable;
          console.log("row", newTable);
        }
      },
      authFilter(input, opt) {
        return opt.shopName.includes(input);
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
        this.results.push(JSON.stringify(state));
        this.updateRow(state._i, state);
      });
    },
  };
</script>

<style lang="sass" scoped>
.tools-food-elm
  width: 960px
  margin: 20px auto

.succ-text
  background: rgba(0, 255, 0, .7)

.error-text
  background: rgba(255, 0, 0, .7)
</style>
