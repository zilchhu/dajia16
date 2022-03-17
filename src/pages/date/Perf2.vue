<template lang="pug">
div
  s-table.ant-table-change(
    :columns="perf_columns",
    :data-source="perfs",
    rowKey="key",
    :loading="spinning",
    :pagination="false",
    size="small",
    :scroll="{ x: scrollX, y: scrollY }",
    bordered
  )
    template(
      #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
    )
      table-select(
        :columnTitle="column.title",
        :columnIndex="column.dataIndex",
        :tableData="perfs",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex == 'person'")
        router-link(
          :to="{ name: 'user', params: { username: text || '-', date: 0 } }",
          style="color: rgba(0, 0, 0, 0.65)"
        ) {{ text }}
  .left-bottom-div(v-show="!spinning")
    a-button(type="link", size="small", @click="() => fetch_perf()") 刷新
    a-button(
      type="link",
      size="small",
      @click="exportTable",
      :loading="exporting"
    ) 导出
    a(
      v-show="tableUrl",
      :href="`http://192.168.3.3:9005/${tableUrl}`",
      target="_blank"
    ) 下载
</template>

<script>
  import { message } from "ant-design-vue";
  import dayjs from "dayjs";
  import app from "apprun";
  import localeData from "dayjs/plugin/localeData";
  import weekday from "dayjs/plugin/weekday";
  import updateLocale from "dayjs/plugin/updateLocale";
  import Perf from "../../api/perf";
  import TableSelect from "../../components/TableSelect";

  import "dayjs/locale/zh-cn";

  dayjs.extend(localeData);
  dayjs.extend(weekday);
  dayjs.extend(updateLocale);

  dayjs.locale("zh-cn");

  dayjs.updateLocale("zh-cn", {
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  });

  export default {
    name: "perf2",
    components: {
      TableSelect,
    },
    data() {
      return {
        perfs: [],
        spinning: false,
        scrollY: 900,
        defaultPageSize: 40,
        last_perf_route: { path: "/perf2" },
        exporting: false,
        tableUrl: null,
      };
    },
    computed: {
      perf_columns() {
        let fiexed_cols = [
          // {
          //   title: "级别",
          //   dataIndex: "级别",
          //   width: 80,
          // },
          {
            title: "运营",
            dataIndex: "运营",
            width: 80,
          },
          {
            title: "收入",
            dataIndex: "收入",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "推广比例",
            dataIndex: "推广比例",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "成本比例",
            dataIndex: "成本比例",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "利润",
            dataIndex: "利润",
            align: "right",
            width: 120,
            _sort: true,
          },
          {
            title: "提成",
            dataIndex: "提成",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "店均提成",
            dataIndex: "店均提成",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "月累计提成",
            dataIndex: "月累计提成",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "日期",
            dataIndex: "日期",
            align: "right",
            fixed: "right",
            width: 100,
          },
        ];
        return [...fiexed_cols].map(this.extendColumn);
      },
      scrollX() {
        let x = this.reduce_width(this.perf_columns);
        return x;
      },
    },
    methods: {
      reduce_width(nodes) {
        return nodes.reduce((sw, c) => {
          if (c.width) return sw + c.width;
          if (c.children) return sw + this.reduce_width(c.children);
          return sw;
        }, 10);
      },
      toNum(str) {
        try {
          if (str == null || str == "") return 0;
          return parseFloat(str);
        } catch (error) {
          return 0;
        }
      },
      extendColumn(col) {
        let _col = {
          ...col,
          customFilterDropdown: true,
          onFilter: (value, record) => (record[col.dataIndex] ?? "") == value,
          showSorterTooltip: false,
        };
        if (col._sort) {
          _col.customFilterDropdown = false;
          let sortByNum = (a, b) => {
            if (a == null) return b == null ? 0 : -1;
            return this.toNum(a[col.dataIndex]) - this.toNum(b[col.dataIndex]);
          };
          let sortByStr = (a, b) => {
            if (a == null) return b == null ? 0 : -1;
            return a[col.dataIndex].localeCompare(b[col.dataIndex]);
          };
          _col.sorter = col._sort == "str" ? sortByStr : sortByNum;
        }
        if (col._notFilter) {
          _col.customFilterDropdown = false;
        }
        if (col._filter) {
          _col.customFilterDropdown = true;
        }
        return _col;
      },
      fetch_perf() {
        this.spinning = true;
        new Perf()
          .single2(2)
          .then((res) => {
            this.perfs = res;
            this.spinning = false;
          })
          .catch((e) => {
            console.error(e);
            message.error(e);
            this.spinning = false;
          });
      },
      table_change(pagination) {
        localStorage.setItem("perf2/defaultPageSize", pagination.pageSize);
      },
      transformTable() {
        return this.perfs.map((row) =>
          this.perf_columns.reduce(
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
      app.on("@export-table", (state) => {
        console.log(state);
        this.exporting = false;
        this.tableUrl = state.path;
      });

      this.fetch_perf();
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 144;
    },
    watch: {
      $route(route) {
        if (route.name == "perf2") {
          this.defaultPageSize =
            +localStorage.getItem("perf2/defaultPageSize") || 40;
          if (route.path != this.last_perf_route.path) {
            this.fetch_perf();
          }
          this.last_perf_route = route;
        }
      },
    },
  };
</script>

<style lang="sass" scoped>
.cell
  display: inline-block
  width: 100%
  text-align: right

.unsatisfied
  color: #fa541c

.expo
  display: block
  position: absolute
  bottom: 10px
  left: 10px
  z-index: 100

.djh
  display: block
  position: absolute
  bottom: 10px
  left: 80px
  z-index: 100
</style>
