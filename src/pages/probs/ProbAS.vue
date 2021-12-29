<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 350}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#handle="{text, record}")
      a-input(:value="text" @change="e => handleChange(e.target.value, record)" size="small")

  .left-bottom-div
    a-button(type="link" size="small" @click="fetchTable") 
      SyncOutlined
      span(style="margin-left: 4px;") 刷新
    a-button(type="link" size="small" @click="exportTable" :loading="exporting") 
      ExportOutlined
      span(style="margin-left: 4px;") 导出
    a(v-show="tableUrl" :href="`http://192.168.3.3:9005/${tableUrl}`" target="_blank") 
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
    name: "ProbAS",
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
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店铺id == value,
          },
          {
            title: "店名",
            dataIndex: "店名",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店名 == value,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.物理店 == value,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.平台 ?? "") == value,
          },
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.责任人 ?? "") == value,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 140,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.分类 ?? "") == value,
          },
          {
            title: "商品",
            dataIndex: "商品",
            width: 300,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.商品 ?? "") == value,
          },
          {
            title: "原价",
            dataIndex: "原价",
            slots: { filterDropdown: "filterDropdown" },
            sorter: (a, b) =>
              this.toNum(a.原价) - this.toNum(b.原价),
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            slots: { filterDropdown: "filterDropdown" },
            sorter: (a, b) =>
              this.toNum(a.折扣价) - this.toNum(b.折扣价),
          },
          {
            title: "起购数量",
            dataIndex: "起购数量",
            slots: { filterDropdown: "filterDropdown" },
            sorter: (a, b) =>
              this.toNum(a.起购数量) - this.toNum(b.起购数量),
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
          .single("as")
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
            .save("as", record.key, target["handle"])
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
