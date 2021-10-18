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
    name: "ProbAQ",
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
            dataIndex: "shop_id",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_id == value,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_name == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 100,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.real_shop_name == value,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.person ?? "") == value,
          },
          {
            title: "超级吃货红包",
            dataIndex: "超级吃货红包",      
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.超级吃货红包 ?? '') == value,
          },
          {
            title: "下单返红包",
            dataIndex: "下单返红包",      
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.下单返红包 ?? "")== value,
          },
          {
            title: "吃货红包",
            dataIndex: "吃货红包",     
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.吃货红包 ?? '') == value,
          },
          {
            title: "集点返红包",
            dataIndex: "集点返红包",      
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.集点返红包 ?? '') == value,
          },
          {
            title: "店铺满赠",
            dataIndex: "店铺满赠",      
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.店铺满赠 ?? '') == value,
          },
          {
            title: "进店领红包",
            dataIndex: "进店领红包",     
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.进店领红包 ?? '') == value,
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
          .single("aq")
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
            .save("aq", record.key, target["handle"])
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
