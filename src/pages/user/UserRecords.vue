<template lang="pug">
div.user-records
  div.range
    .range-label 选择日期
    a-range-picker(v-model:value="selected_dates" :allowClear="false" size="small")
  a-table(:columns="records_columns" :data-source="records_data" rowKey="key" :loading="spinning" 
    :pagination="false" 
    size="small" :scroll="{x: scrollX, y: scrollY}" bordered)
    template(#filterDropdown="{confirm, clearFilters, column, selectedKeys, setSelectedKeys}")
      //- a-row(type="flex")
      //-   a-col(flex="auto")
      //-     a-select(mode="multiple" :value="selectedKeys" @change="setSelectedKeys" :placeholder="`filter ${column.title}`" :style="`min-width: 160px; width: ${column.width}px;`")
      //-       a-select-option(v-for="option in getColFilters(column.dataIndex)" :key="option.value") {{option.value}} 
      //-   a-col(flex="60px")
      //-     a-button(type="link" @click="confirm") confirm
      //-     br
      //-     a-button(type="link" @click="clearFilters") reset
      table-select(:style="`min-width: 160px; width: ${column.width + 50 || 220}px;`" :filterOptions="getColFilters(column.dataIndex)" 
        :selectedList="selectedKeys" @select-change="setSelectedKeys" @confirm="confirm" @reset="clearFilters")

    template(#consume_sum_ratio="{text, record}")
      .cell(:class="{unsatisfied: text ? toNum(text) > 4.5 : false}") {{text}}

    template(#cost_sum_ratio="{text, record}")
      .cell(:class="{unsatisfied: text ? toNum(text) > 50 : false}") {{text}}

    //- template(#real_shop="{text, record}")
    //-   router-link.cell(:to="{ name: 'date', params: { day: 1 }, query: {real_shop: text} }" style="color: rgba(0, 0, 0, 0.65);") {{text}}
</template>

<script>
  import { message } from "ant-design-vue";
  import User from "../../api/user";
  // import moment from "moment";
  import TableSelect from "../../components/TableSelect";

  export default {
    name: "user-records",
    components: {
      TableSelect,
    },
    data() {
      return {
        records_data: [],
        spinning: false,
        scrollY: 900,
        defaultPageSize: 40,
        last_records_route: { path: "/records" },
        selected_dates: [],
      };
    },
    computed: {
      records_columns() {
        let left_fiexed_cols = [
          {
            title: "运营",
            dataIndex: "运营",
            width: 70,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.运营 == value,
          },
        ];

        let high_cost_cols = {
          title: "高成本",
          children: [
            {
              title: "问题",
              dataIndex: `高成本问题`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高成本问题`]) - this.toNum(b[`高成本问题`]),
            },
            {
              title: "优化",
              dataIndex: `高成本优化`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高成本优化`]) - this.toNum(b[`高成本优化`]),
            },
            {
              title: "解决",
              dataIndex: `高成本解决`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高成本解决`]) - this.toNum(b[`高成本解决`]),
            },
          ],
        };

        let high_consume_cols = {
          title: "高推广",
          children: [
            {
              title: "问题",
              dataIndex: `高推广问题`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高推广问题`]) - this.toNum(b[`高推广问题`]),
            },
            {
              title: "优化",
              dataIndex: `高推广优化`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高推广优化`]) - this.toNum(b[`高推广优化`]),
            },
            {
              title: "解决",
              dataIndex: `高推广解决`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`高推广解决`]) - this.toNum(b[`高推广解决`]),
            },
          ],
        };

        let slump_cols = {
          title: "超跌",
          children: [
            {
              title: "问题",
              dataIndex: `超跌问题`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`超跌问题`]) - this.toNum(b[`超跌问题`]),
            },
            {
              title: "优化",
              dataIndex: `超跌优化`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`超跌优化`]) - this.toNum(b[`超跌优化`]),
            },
            {
              title: "解决",
              dataIndex: `超跌解决`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`超跌解决`]) - this.toNum(b[`超跌解决`]),
            },
          ],
        };

        let low_income_cols = {
          title: "低业绩",
          children: [
            {
              title: "问题",
              dataIndex: `低业绩问题`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`低业绩问题`]) - this.toNum(b[`低业绩问题`]),
            },
            {
              title: "优化",
              dataIndex: `低业绩优化`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`低业绩优化`]) - this.toNum(b[`低业绩优化`]),
            },
            {
              title: "解决",
              dataIndex: `低业绩解决`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`低业绩解决`]) - this.toNum(b[`低业绩解决`]),
            },
          ],
        };

        let right_fixed_cols = [
          {
            title: "问题总数",
            dataIndex: `问题总数`,
            align: "right",
            width: 90,
            sorter: (a, b) =>
              this.toNum(a[`问题总数`]) - this.toNum(b[`问题总数`]),
          },
          {
            title: "优化总数",
            dataIndex: `优化总数`,
            align: "right",
            width: 90,
            sorter: (a, b) =>
              this.toNum(a[`优化总数`]) - this.toNum(b[`优化总数`]),
          },
          {
            title: "解决总数",
            dataIndex: `解决总数`,
            align: "right",
            width: 90,
            sorter: (a, b) =>
              this.toNum(a[`解决总数`]) - this.toNum(b[`解决总数`]),
          },
          {
            title: "优化率",
            dataIndex: `优化率`,
            align: "right",
            width: 80,
            fixed: "right",
            sorter: (a, b) => this.toNum(a[`优化率`]) - this.toNum(b[`优化率`]),
          },
          {
            title: "解决率",
            dataIndex: `解决率`,
            align: "right",
            width: 80,
            fixed: "right",
            sorter: (a, b) => this.toNum(a[`解决率`]) - this.toNum(b[`解决率`]),
          },
        ];

        return [
          ...left_fiexed_cols,
          high_cost_cols,
          high_consume_cols,
          slump_cols,
          low_income_cols,
          ...right_fixed_cols,
        ];
      },
      scrollX() {
        let x = this.reduce_width(this.records_columns);
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
        return Array.from(
          new Set(this.records_data.map((row) => row[colName] || ""))
        )
          .sort()
          .map((col) => ({ label: col, value: col }));
      },
      fetch_records_indices() {
        if (this.selected_dates.length != 2) return;
        this.spinning = true;
        console.log(this.selected_dates);
        new User(null)
          .record_indices(
            this.selected_dates[0].format("YYYYMMDD"),
            this.selected_dates[1].format("YYYYMMDD")
          )
          .then((res) => {
            this.records_data = res;
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
      this.scrollY = document.body.clientHeight - 184;
      this.defaultPageSize = 40;
      this.fetch_records_indices();
    },
    watch: {
      $route(route) {
        if (route.name == "records") {
          this.defaultPageSize = 40;
          if (route.path != this.last_records_route.path) {
            this.fetch_records_indices();
          }
          this.last_records_route = route;
        }
      },
      selected_dates() {
        this.fetch_records_indices();
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

.user-records
  padding: 50px 10px

.range
  display: flex
  padding: 10px 0

.range-label
  width: 70px
</style>
