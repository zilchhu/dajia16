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
      template(v-else-if="ruleIdx.includes(column.dataIndex)")
        .cell(:class="{ unsatisfied: isUnsatisfy(text, column.dataIndex) }") {{ text }}

  .left-bottom-div(v-show="!spinning")
    a(:href="`http://192.168.3.3:9040/绩效表${yesterday}.xlsx`", target="_blank") export
    a-checkbox(v-model:checked="djh", @change="fetch_perf") 大计划
</template>

<script>
  import dayjs from "dayjs";
  import localeData from "dayjs/plugin/localeData";
  import weekday from "dayjs/plugin/weekday";
  import updateLocale from "dayjs/plugin/updateLocale";
  import { message } from "ant-design-vue";
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
    name: "perf",
    components: {
      TableSelect,
    },
    data() {
      return {
        perfs: [],
        spinning: false,
        scrollY: 900,
        defaultPageSize: 40,
        last_perf_route: { path: "/perf/31" },
        ruleIdx: ["income_avg", "cost_sum_ratio", "consume_sum_ratio", "score"],
        djh: true,
      };
    },
    computed: {
      day() {
        return this.$route.params.day;
      },
      yesterday() {
        return dayjs().subtract(1, "day").format("YYYYMMDD");
      },
      perf_columns() {
        let fiexed_cols = [
          {
            title: "城市",
            dataIndex: "city",
            width: 75,
            fixed: "left",
          },
          {
            title: "运营",
            dataIndex: "person",
            width: 75,
            fixed: "left",
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 75,
            fixed: "left",
          },
          {
            title: "物理店",
            dataIndex: "real_shop",
            width: 100,
            fixed: "left",
            ellipse: true,
            _sort: "str",
            _filter: true,
          },
          {
            title: "收入",
            dataIndex: "income_sum",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "平均收入",
            dataIndex: "income_avg",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "收入分",
            dataIndex: "income_score",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "收入分变化",
            dataIndex: "income_score_1",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "成本",
            dataIndex: "cost_sum",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "平均成本",
            dataIndex: "cost_avg",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "成本比例",
            dataIndex: "cost_sum_ratio",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "总成本比",
            dataIndex: "cost_sum_sum_ratio",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "成本分",
            dataIndex: "cost_score",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "成本分变化",
            dataIndex: "cost_score_1",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "推广",
            dataIndex: "consume_sum",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "平均推广",
            dataIndex: "consume_avg",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "推广比例",
            dataIndex: "consume_sum_ratio",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "总推广比",
            dataIndex: "consume_sum_sum_ratio",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "推广分",
            dataIndex: "consume_score",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "推广分变化",
            dataIndex: "consume_score_1",
            align: "right",
            width: 120,
            _sort: true,
          },
          {
            title: "分数",
            dataIndex: "score",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "分数变化",
            dataIndex: "score_1",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "平均分",
            dataIndex: "score_avg",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "平均分变化",
            dataIndex: "score_avg_1",
            align: "right",
            width: 80,
            _sort: true,
          },
          {
            title: "日期",
            dataIndex: "date",
            align: "right",
            fixed: "right",
            width: 80,
          },
        ];

        return [...fiexed_cols].map(this.extendColumn);
      },
      perf_dates() {
        return [...new Set(this.perfs.map((v) => v.date))].sort();
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
          showSorterTooltip: false
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
        new Perf(this.day)
          .single(this.djh ? 1 : 0)
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
        localStorage.setItem("perf/defaultPageSize", pagination.pageSize);
      },
      isUnsatisfy(text, col) {
        if (col == "income_avg") return this.toNum(text) < 1500;
        if (col == "cost_sum_ratio") return this.toNum(text) > 50;
        if (col == "consume_sum_ratio") return this.toNum(text) > 5;
        if (col == "score") return this.toNum(text) < 50;
      },
      showChartModal(record, col) {
        let perf_realshop = this.perfs.filter(
          (v) => v.real_shop == record.real_shop
        );

        this.option = {
          ...this.chartBaseOpt,
          title: {
            text: col,
          },
          xAxis: {
            data: this.perf_dates,
          },
          series: [
            {
              name: col,
              type: "line",
              data: this.perf_dates.map(
                (d) => perf_realshop.find((v) => v.date == d)[col]
              ),
            },
          ],
        };
        this.isChartModalVis = true;
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 144;
      this.defaultPageSize = +localStorage.getItem("perf/defaultPageSize") || 40;
      this.fetch_perf();
    },
    watch: {
      $route(route) {
        if (route.name == "perf") {
          this.defaultPageSize =
            +localStorage.getItem("perf/defaultPageSize") || 40;
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
  width: 80%
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
