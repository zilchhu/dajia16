<template lang="pug">
.user-records
  .range
    .range-label 选择日期
    a-range-picker(
      v-model:value="selected_dates",
      :allowClear="false",
      size="small"
    )
  s-table(
    :columns="records_columns",
    :data-source="records_data",
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
        :tableData="records_data",
        @select-change="setSelectedKeys",
        @confirm="confirm()",
        @reset="clearFilters()"
      )

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
            fixed: "left",
          },
        ].map(this.extendColumn);

        let high_cost_cols = {
          title: "高成本",
          children: [
            {
              title: "问题",
              dataIndex: `高成本问题`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "优化",
              dataIndex: `高成本优化`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "解决",
              dataIndex: `高成本解决`,
              align: "right",
              width: 80,
              _sort: true,
            },
          ].map(this.extendColumn),
        };

        let high_consume_cols = {
          title: "高推广",
          children: [
            {
              title: "问题",
              dataIndex: `高推广问题`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "优化",
              dataIndex: `高推广优化`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "解决",
              dataIndex: `高推广解决`,
              align: "right",
              width: 80,
              _sort: true,
            },
          ].map(this.extendColumn),
        };

        let slump_cols = {
          title: "超跌",
          children: [
            {
              title: "问题",
              dataIndex: `超跌问题`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "优化",
              dataIndex: `超跌优化`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "解决",
              dataIndex: `超跌解决`,
              align: "right",
              width: 80,
              _sort: true,
            },
          ].map(this.extendColumn),
        };

        let low_income_cols = {
          title: "低业绩",
          children: [
            {
              title: "问题",
              dataIndex: `低业绩问题`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "优化",
              dataIndex: `低业绩优化`,
              align: "right",
              width: 80,
              _sort: true,
            },
            {
              title: "解决",
              dataIndex: `低业绩解决`,
              align: "right",
              width: 80,
              _sort: true,
            },
          ].map(this.extendColumn),
        };

        let right_fixed_cols = [
          {
            title: "问题总数",
            dataIndex: `问题总数`,
            align: "right",
            width: 90,
            _sort: true,
          },
          {
            title: "优化总数",
            dataIndex: `优化总数`,
            align: "right",
            width: 90,
            _sort: true,
          },
          {
            title: "解决总数",
            dataIndex: `解决总数`,
            align: "right",
            width: 90,
            _sort: true,
          },
          {
            title: "优化率",
            dataIndex: `优化率`,
            align: "right",
            width: 80,
            fixed: "right",
            _sort: true,
          },
          {
            title: "解决率",
            dataIndex: `解决率`,
            align: "right",
            width: 80,
            fixed: "right",
            _sort: true,
          },
        ].map(this.extendColumn);

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
      this.defaultPageSize = 40;
      this.fetch_records_indices();
    },
    mounted() {
      this.scrollY = document.body.clientHeight - 184;
    },
    watch: {
      $route(route) {
        if (route.name == "records") {
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
