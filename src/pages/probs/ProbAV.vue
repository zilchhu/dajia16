<template lang="pug">
div
  .header
    a-range-picker(
      v-model:value="probDates",
      :allowClear="false",
      size="small"
    )
  s-table.ant-table-change(
    :columns="extendedColumns",
    :data-source="table",
    rowKey="key",
    :loading="loading",
    :pagination="false",
    size="small",
    :scroll="{ y: scrollY }"
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
      template(v-if="column.dataIndex == 'handle'")
        a-input(
          :value="text",
          :title="text",
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
  import HandleSelect from "../../components/HandleSelect";
  import TableSelect from "../../components/TableSelect";
  import app from "apprun";
  import dayjs from "dayjs";

  export default {
    name: "ProbAV",
    components: {
      HandleSelect,
      TableSelect,
      SyncOutlined,
      ExportOutlined,
      DownloadOutlined,
    },
    data() {
      return {
        probType: "av",
        probDates: [],
        columns: [
          {
            title: "差评数",
            dataIndex: "差评数",
            width: 70,
            _sort: true,
          },
          {
            title: "申诉数",
            dataIndex: "申诉数",
            width: 70,
            _sort: true,
          },
          {
            title: "通过数",
            dataIndex: "通过数",
            width: 70,
            _sort: true,
          },
          {
            title: "申诉率",
            dataIndex: "申诉率",
            width: 70,
            _sort: true,
          },
          {
            title: "通过率",
            dataIndex: "通过率",
            width: 70,
            _sort: true,
          },
          {
            title: "评价日期",
            dataIndex: "评价日期",
            width: 100,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 150,
          },
        ],
        table: [],
        loading: false,
        scrollY: 900,
        debounce_save: null,
        exporting: false,
        tableUrl: null,
      };
    },
    computed: {
      extendedColumns() {
        return this.columns.map((col) => {
          let _col = {
            ...col,
            customFilterDropdown: true,
            onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
            showSorterTooltip: false,
          };
          if (col._sort) {
            _col.customFilterDropdown = false;
            _col.sorter = (a, b) =>
              this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]);
          }
          if (col._notFilter) {
            _col.customFilterDropdown = false;
          }
          if (col._filter) {
            _col.customFilterDropdown = true;
          }
          return _col;
        });
      },
      scrollX() {
        return this.columns
          .map((col) => col.width ?? 200)
          .reduce((p, v) => p + v, 0);
      },
      scroll() {
        // if (this.xScroll) return { y: this.scrollY, x: this.scrollX };
        return { y: this.scrollY };
      },
    },
    methods: {
      toNum(str) {
        try {
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      debounce(fn) {
        let timeout = null;
        return function () {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, arguments), 1000);
        };
      },
      fetchTable() {
        if (this.probDates.length != 2) return;

        this.loading = true;
        new Probs()
          .multiDates(
            this.probType,
            this.probDates[0].format("YYYYMMDD"),
            this.probDates[1].format("YYYYMMDD")
          )
          .then((res) => {
            this.table = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      handleChange(value, record) {
        let newTable = [...this.table];
        const i = newTable.findIndex((item) => record.key == item.key);
        if (i > -1) {
          newTable[i]["handle"] = value;
          this.table = newTable;
          this.debounce_save(record);
        }
      },
      save(record) {
        const target = this.table.filter((item) => record.key === item.key)[0];
        if (target) {
          console.log(target);

          new Probs()
            .save(this.probType, record.handle_key, target["handle"])
            .then((res) => {
              message.success(res);
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
      this.scrollY = document.body.clientHeight - 244;
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
    watch: {
      probDates() {
        this.fetchTable();
      },
    },
  };
</script>

<style lang="sass" scoped>
.ellipsis
  display: -webkit-box
  overflow: hidden
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical

.wrap
  white-space: pre-wrap
</style>