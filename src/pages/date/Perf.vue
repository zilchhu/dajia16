<template lang="pug">
div
  a-table(:columns="perf_columns" :data-source="perfs" rowKey="key" :loading="spinning" 
    :pagination="{showSizeChanger: true, defaultPageSize, pageSizeOptions: ['40', '80', '160', '320'], size: 'small'}" 
    @change="table_change"
    size="small" :scroll="{x: scrollX, y: scrollY}" bordered)
    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      //- a-row(type="flex")
      //-   a-col(flex="auto")
      //-     a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${240}px;`")
      //-       a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      //-   a-col(flex="60px")
      //-     a-button(type="link" @click="confirm") confirm
      //-     br
      //-     a-button(type="link" @click="clearFilters") reset
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#person="{text, record}")
        router-link(:to="{ name: 'user', params: { username: text || '-', date: 0 }}" style="color: rgba(0, 0, 0, 0.65);") {{text}}

    template(v-for="col in cellIdx" #cell="{text, record}")
      .cell(@click="() => showChartModal(record, col)") {{text}}

    template(v-for="col in ruleIdx" #[col]="{text, record}")
      .cell(:class="{unsatisfied: isUnsatisfy(text, col)}") {{text}}

  a-modal(v-model:visible="isChartModalVis" :footer="null" centered :width="800")
    v-chart(class="chart" :option="option")

  a.expo(:href="`http://192.168.3.3:9040/绩效表${yesterday}.xlsx`" target="_blank") export
  a-checkbox.djh(v-model:checked="djh" @change="fetch_perf") 大计划
</template>

<script>
  import { message } from "ant-design-vue";
  import Perf from "../../api/perf";
  import dayjs from "dayjs";
  import localeData from "dayjs/plugin/localeData";
  import weekday from "dayjs/plugin/weekday";
  import updateLocale from "dayjs/plugin/updateLocale";
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
        cellIdx: ["income_sum"],
        djh: true,
        isChartModalVis: false,
        chartBaseOpt: {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
          },
          calculable: true,
          yAxis: {
            type: "value",
            splitNumber: 10,
          },
        },
        option: {},
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
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.city == value,
          },
          {
            title: "运营",
            dataIndex: "person",
            width: 75,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.person == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            width: 75,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.leader == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop",
            width: 120,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.real_shop == value,
            sorter: (a, b) => (a.real_shop < b.real_shop ? -1 : 1),
          },
          {
            title: "收入",
            dataIndex: "income_sum",
            align: "right",
            width: 100,
            slots: { customRender: "cell" },
            sorter: (a, b) => this.toNum(a.income_sum) - this.toNum(b.income_sum),
          },
          {
            title: "平均收入",
            dataIndex: "income_avg",
            align: "right",
            width: 100,
            slots: { customRender: "income_avg" },
            sorter: (a, b) => this.toNum(a.income_avg) - this.toNum(b.income_avg),
          },
          {
            title: "收入分",
            dataIndex: "income_score",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.income_score) - this.toNum(b.income_score),
          },
          {
            title: "收入分变化",
            dataIndex: "income_score_1",
            align: "right",
            width: 120,
            sorter: (a, b) =>
              this.toNum(a.income_score_1) - this.toNum(b.income_score_1),
          },
          {
            title: "成本",
            dataIndex: "cost_sum",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.cost_sum) - this.toNum(b.cost_sum),
          },
          {
            title: "平均成本",
            dataIndex: "cost_avg",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.cost_avg) - this.toNum(b.cost_avg),
          },
          {
            title: "成本比例",
            dataIndex: "cost_sum_ratio",
            align: "right",
            width: 100,
            slots: { customRender: "cost_sum_ratio" },
            sorter: (a, b) =>
              this.toNum(a.cost_sum_ratio) - this.toNum(b.cost_sum_ratio),
          },
          {
            title: "总成本比",
            dataIndex: "cost_sum_sum_ratio",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.cost_sum_sum_ratio) - this.toNum(b.cost_sum_sum_ratio),
          },
          {
            title: "成本分",
            dataIndex: "cost_score",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.cost_score) - this.toNum(b.cost_score),
          },
          {
            title: "成本分变化",
            dataIndex: "cost_score_1",
            align: "right",
            width: 120,
            sorter: (a, b) =>
              this.toNum(a.cost_score_1) - this.toNum(b.cost_score_1),
          },
          {
            title: "推广",
            dataIndex: "consume_sum",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.consume_sum) - this.toNum(b.consume_sum),
          },
          {
            title: "平均推广",
            dataIndex: "consume_avg",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.consume_avg) - this.toNum(b.consume_avg),
          },
          {
            title: "推广比例",
            dataIndex: "consume_sum_ratio",
            align: "right",
            width: 100,
            slots: { customRender: "consume_sum_ratio" },
            sorter: (a, b) =>
              this.toNum(a.consume_sum_ratio) - this.toNum(b.consume_sum_ratio),
          },
          {
            title: "总推广比",
            dataIndex: "consume_sum_sum_ratio",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.consume_sum_sum_ratio) -
              this.toNum(b.consume_sum_sum_ratio),
          },
          {
            title: "推广分",
            dataIndex: "consume_score",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.consume_score) - this.toNum(b.consume_score),
          },
          {
            title: "推广分变化",
            dataIndex: "consume_score_1",
            align: "right",
            width: 120,
            sorter: (a, b) =>
              this.toNum(a.consume_score_1) - this.toNum(b.consume_score_1),
          },
          {
            title: "分数",
            dataIndex: "score",
            align: "right",
            width: 100,
            slots: { customRender: "score" },
            sorter: (a, b) => this.toNum(a.score) - this.toNum(b.score),
          },
          {
            title: "分数变化",
            dataIndex: "score_1",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.score_1) - this.toNum(b.score_1),
          },
          {
            title: "平均分",
            dataIndex: "score_avg",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.score_avg) - this.toNum(b.score_avg),
          },
          {
            title: "平均分变化",
            dataIndex: "score_avg_1",
            align: "right",
            width: 110,
            sorter: (a, b) =>
              this.toNum(a.score_avg_1) - this.toNum(b.score_avg_1),
          },
          {
            title: "日期",
            dataIndex: "date",
            align: "right",
            fixed: "right",
            slots: { filterDropdown: "filterDropdown" },
            defaultFilteredValue: [
              +dayjs().subtract(1, "day").format("YYYYMMDD"),
            ],
            width: 100,
            onFilter: (value, record) => record.date == value,
          },
        ];
        return [...fiexed_cols];
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
      getColFilters(colName) {
        return Array.from(new Set(this.perfs.map((row) => row[colName] || "")))
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
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
