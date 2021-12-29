<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#handle="{text, record}")
      a-input(:value="text" @change="e => handleChange(e.target.value, record)" size="small")

  .left-bottom-div(v-show="!loading")
    a-button(type="link" size="small" @click="fetchTable") 刷新
    a-button(type="link" size="small" @click="exportTable" :loading="exporting") 导出
    a(v-show="tableUrl" :href="`http://192.168.3.3:9005/${tableUrl}`" target="_blank") 下载
</template>

<script>
  import Probs from "../../api/probs";
  import { message } from "ant-design-vue";
  // import dayjs from "dayjs";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "ProbAC",
    components: {
      TableSelect,
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
            title: "门店编号",
            dataIndex: "门店编号",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.门店编号 == value,
          },
          {
            title: "店名",
            dataIndex: "店铺",
            width: 200,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.店名 == value,
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
            title: "责任人",
            dataIndex: "组员",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.组员 ?? "") == value,
          },
          {
            title: "生效时段",
            dataIndex: "生效时段",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.生效时段 ?? "") == value,
          },
          {
            title: "到期时间",
            dataIndex: "到期时间",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.到期时间 ?? "") == value,
          },
          {
            title: "起送价",
            dataIndex: "起送价",
            align: "right",
            width: 90,
            sorter: (a, b) => this.toNum(a.起送价) - this.toNum(b.起送价),
          },
          {
            title: "基础配送",
            dataIndex: "基础配送",
            align: "right",
            width: 90,
            sorter: (a, b) => this.toNum(a.基础配送) - this.toNum(b.基础配送),
          },
          {
            title: "实际减配",
            dataIndex: "实际减配",
            align: "right",
            width: 90,
            sorter: (a, b) => this.toNum(a.实际减配) - this.toNum(b.实际减配),
          },
          {
            title: "商家出资",
            dataIndex: "商家出资",
            align: "right",
            width: 90,
            sorter: (a, b) => this.toNum(a.商家出资) - this.toNum(b.商家出资),
          },
          {
            title: "平台出资",
            dataIndex: "平台出资",
            align: "right",
            width: 90,
            sorter: (a, b) => this.toNum(a.平台出资) - this.toNum(b.平台出资),
          },
          {
            title: "适配标品",
            dataIndex: "适配标品",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.适配标品 ?? "") == value,
          },
          {
            title: "配送方式",
            dataIndex: "配送方式",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.配送方式 ?? "") == value,
          },
          {
            title: "问题",
            dataIndex: "问题",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.问题 ?? "") == value,
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
          .single("ac")
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
            .save("ac", record.key, target["handle"])
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
