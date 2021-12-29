<template lang="pug">
div(style="padding-right: 20px")
  div(
    style="display: flex; align-items: center; justify-content: space-between; padding: 0 10px"
  )
    a-upload(
      v-model:file-list="fileList",
      action="http://192.168.3.3:9005/upload",
      @change="onShopInfoFileChange"
    )
      a-button(size="small")
        span 上传店铺账密表

    a-button(
      size="small",
      @click="batchUpdateShopInfos",
      :loading="batch_update_loading"
    ) 批量更新

  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="_i",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
    size="small",
    :scroll="{ y: scrollY, x: scrollX }",
    :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
  )
    template(
      #filterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :style="`min-width: 160px; width: ${column.filterWidth || column.width || 220}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )
</template>

<script>
  import app from "apprun";
  import dayjs from "dayjs";
  import { message } from "ant-design-vue";
  import ins from "../../api/base4";
  import TableSelect from "../TableSelect";

  export default {
    name: "tools-zps-shop-upd",
    components: {
      TableSelect,
    },
    data() {
      return {
        table: [],
        columns: [],
        loading: false,
        scrollY: 400,
        batch_modal_show: false,
        batch_update_loading: false,
        fileList: [],
      };
    },
    computed: {
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 100)
          .reduce((p, v) => p + v, 50);
      },
      account() {
        return this.$store.state.account ?? localStorage.getItem("account");
      },
      token() {
        return this.$store.state.token ?? localStorage.getItem("token");
      },
    },
    methods: {
      getColFilters(colName) {
        let distincts = Array.from(
          new Set(this.table.map((row) => row[colName] ?? ""))
        );

        return distincts.map((col) => ({
          label: col || "",
          value: col || "",
        }));
      },
      initColumns() {
        const columnNames = ["门店ID", "账号", "密码", "绑定电话"];
        let columns = columnNames.map((name) => {
          let column = {
            title: name,
            dataIndex: name,
            width: 70,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record[name] ?? "") == value,
          };
          return column;
        });
        this.columns = columns;
      },
      initTable() {
        this.table = [];
      },
      batchUpdateShopInfos() {
        let file = this.fileList.find((v) => v.status == "done");

        if (!file) {
          message.error("please upload a file");
          return;
        }

        if (!this.account) {
          message.error("请先登录");
          this.login_modal_show = true;
          return;
        }

        this.batch_update_loading = true;

        ins({
          data: {
            event: "batch-edit-zps-shops",
            shops: this.table.map((v) => ({
              shop_id: v.门店ID,
              shop_account: v.账号,
              shop_password: v.密码,
              shop_phone: v.绑定电话,
            })),
            meta: {
              account: this.account,
              token: this.token,
            },
          },
        })
          .then((res) => {
            message.success("更新成功");
          })
          .catch((err) => message.error(err))
          .finally(() => {
            this.batch_update_loading = false;
          });
      },
      onShopInfoFileChange({ file }) {
        if (file.status == "done" && file?.response?.res?.filename) {
          this.tableName = file.response.res.filename;
          console.log(this.tableName);
          setTimeout(() => {
            app.run("ws://", "@upload-table", {
              table: file.response.res.filename,
            });
          }, 800);
        }
      },
    },
    created() {
      app.on("@upload-table", (state) => {
        console.log(state);
        this.jsonTable = state.jsonTable;
        this.table = state.jsonTable;
      });
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 340;
      this.initColumns();
      this.initTable();
    },
  };
</script>
