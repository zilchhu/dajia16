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
    name: "ProbAR",
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
            title: "收藏有礼",
            dataIndex: "收藏有礼",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.收藏有礼 ?? "") == value,
          },
          {
            title: "店内领券",
            dataIndex: "店内领券",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.店内领券 ?? "") == value,
          },
          {
            title: "超值换购",
            dataIndex: "超值换购",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.超值换购 ?? "") == value,
          },
          {
            title: "满赠活动",
            dataIndex: "满赠活动",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.满赠活动 ?? "") == value,
          },
          {
            title: "下单返券",
            dataIndex: "下单返券",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.下单返券 ?? "") == value,
          },
          {
            title: "集点返券",
            dataIndex: "集点返券",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.集点返券 ?? "") == value,
          },
          {
            title: "平台新客立减",
            dataIndex: "平台新客立减",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) =>
              (record["平台新客立减"] ?? "") == value,
          },
          {
            title: "店外发券",
            dataIndex: "店外发券",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.店外发券 ?? "") == value,
          },
          {
            title: "售卖代金券",
            dataIndex: "售卖代金券",
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.售卖代金券 ?? "") == value,
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
          .single("ar")
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
            .save("ar", record.key, target["handle"])
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
