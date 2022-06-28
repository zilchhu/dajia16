<template lang="pug">
s-table(
  :columns="columns",
  :data-source="table",
  rowKey="date",
  :expandRowByClick="true",
  :expandIconAsCell="false",
  :expandIconColumnIndex="-1",
  :pagination="false",
  size="small",
  :scroll="{ x: scrollX, y: 400 }"
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
    template(v-if="column.dataIndex == 'income'")
      .cell(:class="{ unsatisfied: isIncome(text, record) }") {{ text }}
    template(v-else-if="column.dataIndex == 'consume_ratio'")
      .cell(:class="{ unsatisfied: isConsumeRatio(text, record) }") {{ text }}
    template(v-else-if="column.dataIndex == 'settlea_30'")
      .cell(:class="{ unsatisfied: isSettlea30(text) }") {{ text }}

  template(#expandedRowRender="{ record }")
    a-tabs(size="small")
      a-tab-pane(:key="`${record.id}-1`", tab="详情", size="small")
        a-card(size="small")
          a-tooltip(
            v-for="key in Object.keys(record).filter((v) => !['a', 'comments'].includes(v))",
            :key="key"
          )
            template(#title)
              .tip {{ `${record[key]}` }}
            a-card-grid(style="width: 100px; padding: 4px")
              a-statistic(
                :title="en2zh.get(key)",
                :value="record[key]",
                valueStyle="font-size: 1em;"
              )
                template(v-if="key == 'income'", #formatter="{ value }")
                  .ellipsis(:class="{ unsatisfied: isIncome(value, record) }") {{ emptyVal(value) }}
                template(
                  v-else-if="key == 'consume_ratio'",
                  #formatter="{ value }"
                )
                  .ellipsis(
                    :class="{ unsatisfied: isConsumeRatio(value, record) }"
                  ) {{ emptyVal(value) }}
                template(
                  v-else-if="key == 'settlea_30'",
                  #formatter="{ value }"
                )
                  .ellipsis(:class="{ unsatisfied: isSettlea30(value) }") {{ emptyVal(value) }}
                template(v-else, #formatter="{ value }")
                  .ellipsis {{ emptyVal(value) }}
      a-tab-pane(:key="`${record.id}-2`", tab="优化", size="small")
        hello-form2(:record="record")
</template>

<script>
import { message } from "ant-design-vue";
import TableSelect from "../TableSelect";
import HelloForm2 from "../HelloForm2";
import baseFetch from "../../api/base";

export default {
  name: "shop-history",
  components: {
    TableSelect,
    HelloForm2,
  },
  props: ["shopid"],
  data() {
    return {
      columns: [
        {
          title: "总收入",
          dataIndex: "income_sum",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "平均收入",
          dataIndex: "income_avg",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "三方配送",
          dataIndex: "third_send",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "订单",
          dataIndex: "orders",
          align: "right",
          width: 80,
          _sort: true,
        },
        {
          title: "收入",
          dataIndex: "income",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "成本比例",
          dataIndex: "cost_ratio",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "推广",
          dataIndex: "consume",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "推广比例",
          dataIndex: "consume_ratio",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "比30日",
          dataIndex: "settlea_30",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "比昨日",
          dataIndex: "settlea_1",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "比上周",
          dataIndex: "settlea_7",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "总分",
          dataIndex: "score",
          align: "right",
          width: 100,
          _sort: true,
        },
        {
          title: "日期",
          dataIndex: "date",
          align: "left",
          width: 100,
          fixed: "right",
          _sort: true,
          _filter: true,
        },
      ].map(this.extendColumn),
      table: [],
    };
  },
  computed: {
    scrollX() {
      return this.table.reduce((sum, { width }) => sum + width ?? 200, 50);
    },
    en2zh() {
      const map = new Map();
      map.set("id", "id");
      map.set("city", "城市");
      map.set("person", "负责");
      map.set("leader", "组长");
      map.set("real_shop", "物理店");
      map.set("shop_id", "门店id");
      map.set("shop_name", "店名");
      map.set("platform", "平台");
      map.set("rating", "评分");
      map.set("rating_last", "上次评分");
      map.set("third_send", "三方配送");
      map.set("ship_fee_avg", "单均配送");
      map.set("platform_fee_avg", "单均扣点");
      map.set("ship_fee_min", "起送价");
      map.set("unit_price", "单价");
      map.set("orders", "订单");
      map.set("income", "收入");
      map.set("income_avg", "平均收入");
      map.set("income_sum", "总收入");
      map.set("cost", "成本");
      map.set("cost_avg", "平均成本");
      map.set("cost_sum", "总成本");
      map.set("cost_ratio", "成本比例");
      map.set("cost_sum_ratio", "总成本比例");
      map.set("wait_for_improve_cost", "待优化成本"), map.set("consume", "推广");
      map.set("consume_avg", "平均推广");
      map.set("consume_sum", "总推广");
      map.set("consume_ratio", "推广比例");
      map.set("consume_sum_ratio", "总推广比例");
      map.set("settlea_30", "比30日");
      map.set("settlea_1", "比昨日");
      map.set("settlea_7", "比上周");
      map.set("settlea_7_3", "比上周(3日)");
      map.set("income_score", "收入分");
      map.set("consume_score", "推广分");
      map.set("cost_score", "成本分");
      map.set("score", "总分");
      map.set("date", "日期");
      return map;
    },
  },
  methods: {
    emptyVal(val) {
      return val == null || val == undefined ? "-" : val;
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
    isIncome(text, record) {
      if (record.platform == "美团") return this.toNum(text) < 900;
      else if (record.platform == "饿了么") return this.toNum(text) < 700;
      return false;
    },
    isConsumeRatio(text, record) {
      return this.toNum(text) > 8 && record.income > 500;
    },
    isSettlea30(text) {
      return this.toNum(text) < 80;
    },
    fetchTable() {
      baseFetch({
        url: `/v1/shops/${this.shopid}/operatings`,
      })
        .then((res) => {
          this.table = res;
        })
        .catch((err) => {
          message.error(err.message);
        });
    },
  },
  created() {
    this.fetchTable();
  },
  watch: {
    shopid() {
      this.fetchTable();
    },
  },
};
</script>

<style lang="sass" scoped>
.cell
  display: inline-block
  width: 100%
  text-align: right

.ellipsis
  max-width: 100px
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
</style>
