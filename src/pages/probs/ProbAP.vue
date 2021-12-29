<template lang="pug">
div
  a-table.ant-table-change(
    :columns="columns",
    :data-source="table",
    rowKey="key",
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
        :style="`min-width: 160px; width: ${column.width + 50 || 350}px;`",
        :filterOptions="getColFilters(column.dataIndex)",
        :selectedList="selectedKeys",
        @select-change="setSelectedKeys",
        @confirm="confirm",
        @reset="clearFilters"
      )

    template(#handle="{ text, record }")
      a-input(
        :value="text",
        @change="(e) => handleChange(e.target.value, record)",
        size="small"
      )

  .left-bottom-div
    a-button(type="link", size="small", @click="fetchTable") 
      SyncOutlined
      span(style="margin-left: 4px") 刷新
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
  import { message } from "ant-design-vue";
  import {
    SyncOutlined,
    ExportOutlined,
    DownloadOutlined,
  } from "@ant-design/icons-vue";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "ProbAP",
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
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺ID == value,
          },
          {
            title: "店铺名",
            dataIndex: "店铺名",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺名 == value,
          },
          {
            title: "城市",
            dataIndex: "城市",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.城市 == value,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
            filters: [
              { text: "美团", value: "美团" },
              { text: "饿了么", value: "饿了么" },
            ],
            filterMultiple: true,
            onFilter: (value, record) => record.平台 == value,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.物理店 == value,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.负责人 ?? "") == value,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 180,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.分类 == value,
          },
          {
            title: "商品",
            dataIndex: "商品",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.商品 == value,
          },
          {
            title: "原价",
            dataIndex: "原价",
            width: 100,
            sorter: (a, b) => this.toNum(a.原价) - this.toNum(b.原价),
          },
          {
            title: "餐盒费",
            dataIndex: "餐盒费",
            width: 100,
            sorter: (a, b) => this.toNum(a.餐盒费) - this.toNum(b.餐盒费),
          },
          {
            title: "起购量",
            dataIndex: "起购量",
            width: 100,
            sorter: (a, b) => this.toNum(a.起购量) - this.toNum(b.起购量),
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            width: 100,
            sorter: (a, b) => this.toNum(a.折扣价) - this.toNum(b.折扣价),
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            width: 100,
            sorter: (a, b) => this.toNum(a.折扣限购) - this.toNum(b.折扣限购),
          },
          {
            title: "上下架",
            dataIndex: "上下架",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.上下架 == value,
          },
          {
            title: "10以上的最小满减门槛",
            dataIndex: "10以上的最小满减门槛",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a["10以上的最小满减门槛"]) -
              this.toNum(b["10以上的最小满减门槛"]),
          },
          {
            title: "满减力度",
            dataIndex: "满减力度",
            width: 100,
            sorter: (a, b) => this.toNum(a.满减力度) - this.toNum(b.满减力度),
          },
          {
            title: "起购折扣价格",
            dataIndex: "起购折扣价格",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.起购折扣价格) - this.toNum(b.起购折扣价格),
          },
          {
            title: "起购满减价格",
            dataIndex: "起购满减价格",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.起购满减价格) - this.toNum(b.起购满减价格),
          },
          {
            title: "处理",
            dataIndex: "handle",
            filters: [
              { text: "已处理", value: "" },
              { text: "未处理", value: "1" },
            ],
            filterMultiple: true,
            slots: { customRender: "handle" },
            onFilter: (value, record) =>
              (record?.handle == null) == Boolean(value),
          },
        ];
      },
      scrollX() {
        return this.columns.reduce((sum, { width }) => sum + (width ?? 300) + 10, 50);
      },
    },
    methods: {
      getColFilters(colName) {
        return Array.from(new Set(this.table.map((row) => row[colName] ?? "")))
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
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
        new Probs()
          .single("ap")
          .then((res) => {
            this.table = res;
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
            .save("ap", record.key, target["handle"])
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              message.error(err);
            });
        }
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
