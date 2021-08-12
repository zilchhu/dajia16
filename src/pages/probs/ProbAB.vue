<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 250}px;`" :filterOptions="getColFilters(column.dataIndex)" 
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
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";

  export default {
    name: "ProbAB",
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
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_id == value,
          },
          {
            title: "门店",
            dataIndex: "shop_name",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.shop_name == value,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 70,
            filters: [
              { text: "美团", value: "美团" },
              { text: "饿了么", value: "饿了么" },
            ],
            filterMultiple: true,
            onFilter: (value, record) => record.platform == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.real_shop_name == value,
          },
          {
            title: "负责",
            dataIndex: "person",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.person ?? "") == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            onFilter: (value, record) => (record.leader ?? "") == value,
          },
          {
            title: "新店责任人",
            dataIndex: "new_person",
            width: 110,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.new_person ?? "") == value,
          },
          {
            title: "品名",
            dataIndex: "food_name",
            width: 300,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.food_name == value,
          },
          {
            title: "活动价",
            dataIndex: "activi_price",
            width: 100,
            align: "right",
            sorter: (a, b) =>
              this.toNum(a.activi_price) - this.toNum(b.activi_price),
          },
          {
            title: "活动状态",
            dataIndex: "activi_status",
            width: 200,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => record.activi_status == value,
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
          .single("ab")
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
            .save("ab", record.key, target["handle"])
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
      this.scrollY = document.body.clientHeight - 176;
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
