<template lang="pug">
s-table.ant-table-change(
  :columns="sum2_columns",
  :data-source="sum2_data.shops",
  rowKey="real_shop",
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
      :tableData="sum2_data.shops",
      @select-change="setSelectedKeys",
      @confirm="confirm()",
      @reset="clearFilters()"
    )
  template(#bodyCell="{ column, text, record }")
    template(v-if="column.dataIndex.startsWith('consume_sum_ratio_')")
      .cell(:class="{ unsatisfied: text ? toNum(text) > 4.5 : false }") {{ text }}
    template(v-else-if="column.dataIndex.startsWith('cost_sum_ratio_')")
      .cell(:class="{ unsatisfied: text ? toNum(text) > 50 : false }") {{ text }}

  //- template(#real_shop="{text, record}")
  //-   router-link.cell(:to="{ name: 'date', params: { day: 1 }, query: {real_shop: text} }" style="color: rgba(0, 0, 0, 0.65);") {{text}}
</template>

<script>
  import dayjs from "dayjs";
  import localeData from "dayjs/plugin/localeData";
  import weekday from "dayjs/plugin/weekday";
  import updateLocale from "dayjs/plugin/updateLocale";
  import { message } from "ant-design-vue";
  import Sum from "../../api/sum";
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
    name: "sum2",
    components: {
      TableSelect,
    },
    data() {
      return {
        sum2_data: {
          dates: [],
          shops: [],
        },
        spinning: false,
        scrollY: 900,
        defaultPageSize: 40,
        last_sum2_route: { path: "/sum2" },
      };
    },
    computed: {
      sum2_columns() {
        let fiexed_cols = [
          {
            title: "城市",
            dataIndex: "city",
            key: "city",
            width: 70,
            fixed: "left",
          },
          {
            title: "负责",
            dataIndex: "person",
            key: "person",
            width: 70,
            fixed: "left",
          },
          {
            title: "组长",
            dataIndex: "leader",
            key: "leader",
            width: 70,
            fixed: "left",
          },
          {
            title: "物理店",
            dataIndex: "real_shop",
            key: "real_shop",
            width: 120,
            fixed: "left",
            ellipsis: true,
            _sort: "str",
            _filter: true,
          },
        ].map(this.extendColumn);

        let dates_cols = this.sum2_data.dates.map((v) => ({
          title: v,
          children: [
            {
              title: "营业收入",
              dataIndex: `income_sum_month_${v}`,
              key: `income_sum_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "推广费用",
              dataIndex: `consume_sum_month_${v}`,
              key: `consume_sum_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "推广比例",
              dataIndex: `consume_sum_ratio_month_${v}`,
              key: `consume_sum_ratio_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "成本",
              dataIndex: `cost_sum_month_${v}`,
              key: `cost_sum_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "成本比例",
              dataIndex: `cost_sum_ratio_month_${v}`,
              key: `cost_sum_ratio_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "房租成本",
              dataIndex: `rent_cost_month_${v}`,
              key: `rent_cost_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "人工成本",
              dataIndex: `labor_cost_month_${v}`,
              key: `labor_cost_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "水电成本",
              dataIndex: `water_electr_cost_month_${v}`,
              key: `water_electr_cost_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "好评返现",
              dataIndex: `cashback_cost_month_${v}`,
              key: `cashback_cost_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "运营成本",
              dataIndex: `oper_cost_month_${v}`,
              key: `oper_cost_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
            {
              title: "利润",
              dataIndex: `profit_month_${v}`,
              key: `profit_month_${v}`,
              align: "right",
              width: 100,
              _sort: true,
            },
          ].map(this.extendColumn),
        }));

        return [...fiexed_cols, ...dates_cols];
      },
      scrollX() {
        let x = this.reduce_width(this.sum2_columns);
        return x;
      },
    },
    methods: {
      reduce_width(nodes) {
        return nodes.reduce((sw, c) => {
          if (c.width) return sw + c.width ?? 200;
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
      fetch_sum2_single() {
        this.spinning = true;
        new Sum()
          .sum2()
          .then((res) => {
            this.sum2_data = res;
            this.spinning = false;
          })
          .catch((e) => {
            console.error(e);
            message.error(e);
            this.spinning = false;
          });
      },
    },
    created() {
      this.fetch_sum2_single();
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 184;
    },
    watch: {
      $route(route) {
        if (route.name == "sum2") {
          if (route.path != this.last_sum2_route.path) {
            this.fetch_sum2_single();
          }
          this.last_sum2_route = route;
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
</style>
