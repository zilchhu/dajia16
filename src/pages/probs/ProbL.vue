<template lang="pug">
div
  a-table.ant-table-change(:columns="columns" :data-source="table" rowKey="key" :loading="loading" 
    :pagination="{showSizeChanger: true, defaultPageSize: 100, pageSizeOptions: ['50', '100', '200', '400'], size: 'small'}" 
    size="small" :scroll="{y: scrollY}" :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)")

    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 300}px;`" :filterOptions="getColFilters(column.dataIndex)" 
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
    name: "ProbL",
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
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.shop_name ?? "") == value,
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
            onFilter: (value, record) => (record.real_shop_name ?? "") == value,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
            onFilter: (value, record) => (record.person ?? "") == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
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
            title: "订单数",
            dataIndex: "订单数",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.订单数) - this.toNum(b.订单数),
          },
          {
            title: "实收",
            dataIndex: "实收",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.实收) - this.toNum(b.实收),
          },
          {
            title: "联盟津贴",
            dataIndex: "联盟津贴",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.联盟津贴) - this.toNum(b.联盟津贴),
          },
          {
            title: "减配送费",
            dataIndex: "减配送费",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.减配送费) - this.toNum(b.减配送费),
          },
          {
            title: "商家代金券",
            dataIndex: "商家代金券",
            align: "right",
            width: 120,
            sorter: (a, b) => this.toNum(a.商家代金券) - this.toNum(b.商家代金券),
          },
          {
            title: "超值联盟",
            dataIndex: "超值联盟",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.超值联盟) - this.toNum(b.超值联盟),
          },
          {
            title: "新客立减",
            dataIndex: "新客立减",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.新客立减) - this.toNum(b.新客立减),
          },
          {
            title: "会员红包",
            dataIndex: "会员红包",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.会员红包) - this.toNum(b.会员红包),
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
          .single("l")
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
            .save("l", record.key, target["handle"])
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
