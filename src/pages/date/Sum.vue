<template lang="pug">
.op-sum
  .indice-filter
    a-checkbox(
      v-model:checked="indiceAllChecked",
      :indeterminate="indiceCheckAllIndeter",
      @change="onCheckAllIndice"
    ) 全选
    a-checkbox-group(v-model:value="checkedIndice")
      span.check-option(v-for="opt in indiceOptions", :key="opt.value")
        a-checkbox(:value="opt.value") {{ opt.label }}

  s-table.ant-table-change(
    :columns="sum_columns",
    :data-source="sum_data.shops",
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
        :tableData="sum_data.shops",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )
    template(#headerCell="{ title, column }")
      .header-cell {{ title }}
    template(#bodyCell="{ column, text, record }")
      template(v-if="column.dataIndex.startsWith('consume_sum_ratio_')")
        .cell(:class="{ unsatisfied: text ? toNum(text) > 4.5 : false }") {{ text }}
      template(v-else-if="column.dataIndex.startsWith('cost_sum_ratio_')")
        .cell(:class="{ unsatisfied: text ? toNum(text) > 50 : false }") {{ text }}
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
    name: "sum",
    components: {
      TableSelect,
    },
    data() {
      return {
        sum_data: {
          dates: [],
          months: [],
          shops: [],
        },
        indice: [
          "营业收入",
          "推广费用",
          "推广比例",
          "成本",
          "成本比例",
          "房租成本",
          "人工成本",
          "水电成本",
          "好评返现",
          "运营成本",
          "利润",
          "月均利润",
          "比上月",
        ],
        checkedIndice: [
          "营业收入",
          "推广费用",
          "推广比例",
          "成本",
          "成本比例",
          "房租成本",
          "人工成本",
          "水电成本",
          "好评返现",
          "运营成本",
          "利润",
          "月均利润",
          "比上月",
        ],
        indiceAllChecked: true,
        indiceCheckAllIndeter: false,
        spinning: false,
        scrollY: 900,
        last_sum_route: { path: "/sum/7" },
      };
    },
    computed: {
      day() {
        return this.$route.params.day || 7;
      },
      indiceOptions() {
        return this.indice.map((v) => ({ label: v, value: v }));
      },
      sum_columns() {
        let fiexed_cols = [
          {
            title: "城市",
            dataIndex: "city",
            key: "city",
            width: 50,
            fixed: "left",
          },
          {
            title: "负责",
            dataIndex: "person",
            key: "person",
            width: 60,
            fixed: "left",
          },
          // {
          //   title: "组长",
          //   dataIndex: "leader",
          //   key: "leader",
          //   width: 60,
          //   fixed: "left",
          // },
          {
            title: "物理店",
            dataIndex: "real_shop",
            key: "real_shop",
            width: 90,
            fixed: "left",
            _sort: "str",
            _filter: true,
          },
        ].map(this.extendColumn);

        let dates_cols = this.sum_data.dates.map((v) => {
          let title =
            this.checkedIndice.length == 1
              ? String(v)?.slice(4)
              : `${v} ${dayjs.weekdays()[dayjs(v + "", "YYYYMMDD").day()]}`;

          let children = [
            {
              title: "营业收入",
              dataIndex: `income_sum_${v}`,
              key: `income_sum_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "推广费用",
              dataIndex: `consume_sum_${v}`,
              key: `consume_sum_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "推广比例",
              dataIndex: `consume_sum_ratio_${v}`,
              key: `consume_sum_ratio_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "成本",
              dataIndex: `cost_sum_${v}`,
              key: `cost_sum_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "成本比例",
              dataIndex: `cost_sum_ratio_${v}`,
              key: `cost_sum_ratio_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "房租成本",
              dataIndex: `rent_cost_${v}`,
              key: `rent_cost_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "人工成本",
              dataIndex: `labor_cost_${v}`,
              key: `labor_cost_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "水电成本",
              dataIndex: `water_electr_cost_${v}`,
              key: `water_electr_cost_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "好评返现",
              dataIndex: `cashback_cost_${v}`,
              key: `cashback_cost_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "运营成本",
              dataIndex: `oper_cost_${v}`,
              key: `oper_cost_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "利润",
              dataIndex: `profit_${v}`,
              key: `profit_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "月均利润",
              dataIndex: `before_30_profit_${v}`,
              key: `before_30_profit_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "比上月",
              dataIndex: `month_on_month_ratio_profit_${v}`,
              key: `month_on_month_ratio_profit_${v}`,
              align: "right",
              width: 80,
              _sort: true,
            },
          ]
            .filter((c) => this.checkedIndice.includes(c.title))
            .map(this.extendColumn);

          return { title, children };
        });

        if (this.checkedIndice.length == 0) return fiexed_cols;
        return [...fiexed_cols, ...dates_cols];
      },
      scrollX() {
        let x = this.reduce_width(this.sum_columns);
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
      fetch_sum_single() {
        this.spinning = true;
        new Sum(this.day)
          .single()
          .then((res) => {
            this.sum_data = res;
            this.spinning = false;
          })
          .catch((e) => {
            console.error(e);
            message.error(e);
            this.spinning = false;
          });
      },
      onCheckAllIndice(e) {
        this.checkedIndice = e.target.checked ? [...this.indice] : [];
        this.indiceCheckAllIndeter = false;
      },
    },
    created() {
      this.fetch_sum_single();
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 192;
    },
    watch: {
      $route(route) {
        if (route.name == "sum") {
          if (route.path != this.last_sum_route.path) {
            this.fetch_sum_single();
          }
          this.last_sum_route = route;
        }
      },
      checkedIndice(val) {
        this.indiceCheckAllIndeter =
          !!val.length && val.length < this.indice.length;
        this.indiceAllChecked = val.length === this.indice.length;
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

.indice-filter
  padding: 8px

.check-option
  padding: 0 2px

.header-cell
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  font-size: 0.886em
</style>
