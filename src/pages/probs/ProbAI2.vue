<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="{ showSizeChanger: true, defaultPageSize: 50, pageSizeOptions: ['50', '100', '200', '400'], size: 'small' }",
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
      template(v-if="column.dataIndex == '评分'")
        span {{ '⭐'.repeat(text) }}

  .left-bottom-div
    a-button(type="link", size="small", @click="fetchTable") 
      SyncOutlined
      span(style="margin-left: 4px") 软刷新
    a-button(type="link", size="small", @click="forceRefreshTable") 
      SyncOutlined
      span(style="margin-left: 4px") 硬刷新
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 
      ExportOutlined
      span(style="margin-left: 4px") 导出
    a(
      v-show="tableUrl",
      :href="`http://192.168.3.3:9005/${tableUrl}`",
      target="_blank"
    ) 
      DownloadOutlined
      span 下载
</template>

<script>
  import Probs from "../../api/probs";
  import ins from "../../api/base4";
  import { message } from "ant-design-vue";
  import TableSelect from "../../components/TableSelect";
  import {
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  } from "@ant-design/icons-vue";
  import app from "apprun";

  export default {
    name: "ProbAI2",
    components: {
      TableSelect,
      SyncOutlined,
      ExportOutlined,
      DownloadOutlined,
    },
    data() {
      return {
        table: [],
        loading: false,
        scrollY: 900,
        debounce_save: null,
        exporting: false,
        tableUrl: null,
      };
    },
    computed: {
      columns() {
        return [
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
            customFilterDropdown: true,
            onFilter: (value, record) => record.平台 == value,
          },
          {
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
            customFilterDropdown: true,
            onFilter: (value, record) => record.店铺ID == value,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
            customFilterDropdown: true,
            onFilter: (value, record) => record.店铺名称 == value,
            sorter: (a, b) => a.店铺名称?.localeCompare(b.店铺名称),
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
            customFilterDropdown: true,
            onFilter: (value, record) => record.物理店 == value,
            sorter: (a, b) => a.物理店?.localeCompare(b.物理店),
          },
          {
            title: "评分",
            dataIndex: "评分",
            width: 90,
            customFilterDropdown: true,
            onFilter: (value, record) => record.评分 == value,
            sorter: (a, b) => this.toNum(a.评分) - this.toNum(b.评分),
          },
          {
            title: "评价",
            dataIndex: "评价",
            customFilterDropdown: true,
          },
          {
            title: "订单",
            dataIndex: "订单",
            width: 200,
          },
          {
            title: "时间",
            dataIndex: "时间",
            width: 200,
            customFilterDropdown: true,
            onFilter: (value, record) => record.时间 == value,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 70,
            customFilterDropdown: true,
            onFilter: (value, record) => (record.负责人 ?? "") == value,
          },
          // {
          //   title: "处理",
          //   dataIndex: "handle",
          //   filters: [
          //     { text: "已处理", value: "" },
          //     { text: "未处理", value: "1" },
          //   ],
          //   filterMultiple: true,
          //   slots: { customRender: "handle" },
          //   width: 200,
          //   onFilter: (value, record) =>
          //     (record?.handle == null) == Boolean(value),
          // },
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
      fetchTable() {
        this.loading = true;
        ins({
          data: {
            event: "get-bad-rates",
          },
        })
          .then((res) => {
            this.table = res.rates;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
        // new Probs()
        //   .single("ai")
      },
      forceRefreshTable() {
        this.loading = true;
        ins({
          data: {
            event: "get-bad-rates",
            forceRefresh: true,
          },
        })
          .then((res) => {
            this.table = res.rates;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 800);
        };
      },
      handleChange(value, record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          target["handle"] = value;
          this.debounce_save(record);
        }
      },
      save(record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          new Probs()
            .save("ai", record.key, target["handle"])
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              message.error(err);
            });
        }
      },
      onSelectChange(checks) {
        console.log(checks);
      },
      transformTable() {
        return this.table.map((row) =>
          this.columns.reduce(
            (p, c) => ({ ...p, [c.title]: row[c.dataIndex] }),
            {}
          )
        );
      },
      exportTable() {
        this.exporting = true;
        app.run("ws://", "@export-table", {
          json: this.transformTable(),
        });
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 204;
      this.debounce_save = this.debounce(this.save);
      this.fetchTable();
    },
    mounted() {
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });
    },
  };
</script>
