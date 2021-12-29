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
      #filterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      //- a-row(type="flex")
      //-   a-col(flex="auto")
      //-     a-select(mode="multiple" :value="selectedKeys" @change="onSelectChange" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${column.width || 220}px;`")
      //-       a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      //-   a-col(flex="60px")
      //-     a-button(type="link" @click="confirm") confirm
      //-     br
      //-     a-button(type="link" @click="clearFilters") reset
      //- p {{selectedKeys}}
      table-select(
        :style="`min-width: 160px; width: ${column.width || 220}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )

    template(#star="{ text, record }")
      span {{ '⭐'.repeat(text) }}

    template(#handle="{ text, record }")
      a-input(
        :value="text",
        @change="(e) => handleChange(e.target.value, record)",
        size="small"
      )

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
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.平台 == value,
          },
          {
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺ID == value,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺名称 == value,
            sorter: (a, b) => a.店铺名称?.localeCompare(b.店铺名称),
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.物理店 == value,
            sorter: (a, b) => a.物理店?.localeCompare(b.物理店),
          },
          {
            title: "评分",
            dataIndex: "评分",
            width: 90,
            slots: { filterDropdown: "filterDropdown", customRender: "star"},
            onFilter: (value, record) => record.评分 == value,
            sorter: (a, b) => this.toNum(a.评分) - this.toNum(b.评分),
          },
          {
            title: "评价",
            dataIndex: "评价",
            slots: { filterDropdown: "filterDropdown" },
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
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.时间 == value,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 70,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.负责人 == value,
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
