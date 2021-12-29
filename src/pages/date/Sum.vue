<template lang="pug">
a-table(:columns="sum_columns" :data-source="sum_data.shops" rowKey="real_shop" :loading="spinning" 
  :pagination="{showSizeChanger: true, defaultPageSize, pageSizeOptions: ['20', '40', '80', '160'], size: 'small'}" 
  @change="table_change"
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
</template>

<script>
  import { message } from "ant-design-vue";
  import Sum from "../../api/sum";
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
        spinning: false,
        scrollY: 900,
        defaultPageSize: 40,
        last_sum_route: { path: "/sum/7" },
      };
    },
    computed: {
      day() {
        return this.$route.params.day;
      },
      sum_columns() {
        let fiexed_cols = [
          {
            title: "城市",
            dataIndex: "city",
            key: "city",
            width: 50,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => record.city == value,
          },
          {
            title: "负责",
            dataIndex: "person",
            key: "person",
            width: 60,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => (record.person ?? '') == value,
          },
          {
            title: "组长",
            dataIndex: "leader",
            key: "leader",
            width: 60,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            fixed: "left",
            onFilter: (value, record) => (record.leader ?? '') == value,
          },
          {
            title: "物理店",
            dataIndex: "real_shop",
            key: "real_shop",
            width: 90,
            slots: { filterDropdown: "filterDropdown" },
            fixed: "left",
            onFilter: (value, record) => record.real_shop == value,
            sorter: (a, b) => (a.real_shop < b.real_shop ? -1 : 1),
          },
        ];
        let dates_cols = this.sum_data.dates.map((v) => ({
          title: `${v} ${dayjs.weekdays()[dayjs(v + "", "YYYYMMDD").day()]}`,
          children: [
            {
              title: "营业收入",
              dataIndex: `income_sum_${v}`,
              key: `income_sum_${v}`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`income_sum_${v}`]) -
                this.toNum(b[`income_sum_${v}`]),
            },
            {
              title: "推广费用",
              dataIndex: `consume_sum_${v}`,
              key: `consume_sum_${v}`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`consume_sum_${v}`]) -
                this.toNum(b[`consume_sum_${v}`]),
            },
            {
              title: "推广比例",
              dataIndex: `consume_sum_ratio_${v}`,
              key: `consume_sum_ratio_${v}`,
              align: "right",
              width: 70,
              slots: { customRender: "consume_sum_ratio" },
              sorter: (a, b) =>
                this.toNum(a[`consume_sum_ratio_${v}`]) -
                this.toNum(b[`consume_sum_ratio_${v}`]),
            },
            {
              title: "成本",
              dataIndex: `cost_sum_${v}`,
              key: `cost_sum_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`cost_sum_${v}`]) - this.toNum(b[`cost_sum_${v}`]),
            },
            {
              title: "成本比例",
              dataIndex: `cost_sum_ratio_${v}`,
              key: `cost_sum_ratio_${v}`,
              align: "right",
              width: 70,
              slots: { customRender: "cost_sum_ratio" },
              sorter: (a, b) =>
                this.toNum(a[`cost_sum_ratio_${v}`]) -
                this.toNum(b[`cost_sum_ratio_${v}`]),
            },
            {
              title: "房租成本",
              dataIndex: `rent_cost_${v}`,
              key: `rent_cost_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`rent_cost_${v}`]) - this.toNum(b[`rent_cost_${v}`]),
            },
            {
              title: "人工成本",
              dataIndex: `labor_cost_${v}`,
              key: `labor_cost_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`labor_cost_${v}`]) -
                this.toNum(b[`labor_cost_${v}`]),
            },
            {
              title: "水电成本",
              dataIndex: `water_electr_cost_${v}`,
              key: `water_electr_cost_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`water_electr_cost_${v}`]) -
                this.toNum(b[`water_electr_cost_${v}`]),
            },
            {
              title: "好评返现",
              dataIndex: `cashback_cost_${v}`,
              key: `cashback_cost_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`cashback_cost_${v}`]) -
                this.toNum(b[`cashback_cost_${v}`]),
            },
            {
              title: "运营成本",
              dataIndex: `oper_cost_${v}`,
              key: `oper_cost_${v}`,
              align: "right",
              width: 70,
              sorter: (a, b) =>
                this.toNum(a[`oper_cost_${v}`]) - this.toNum(b[`oper_cost_${v}`]),
            },
            {
              title: "利润",
              dataIndex: `profit_${v}`,
              key: `profit_${v}`,
              align: "right",
              width: 80,
              sorter: (a, b) =>
                this.toNum(a[`profit_${v}`]) - this.toNum(b[`profit_${v}`]),
            },
          ],
        }));
        // let month_col = {
        //   title: '月 利 润',
        //   children: this.sum_data.months.map(v => ({
        //     title: v,
        //     dataIndex: `profit_month_${v}`,
        //     key: `profit_month_${v}`,
        //     align: 'right',
        //     width: 100,
        //     sorter: (a, b) => this.toNum(a[`profit_month_${v}`]) - this.toNum(b[`profit_month_${v}`])
        //   }))
        // }
        console.log([...fiexed_cols, ...dates_cols]);
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
          new Set(this.sum_data.shops.map((row) => row[colName] || ""))
        )
          .sort()
          .map((col) => ({ label: col, value: col }));
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
      table_change(pagination) {
        localStorage.setItem("sum/defaultPageSize", pagination.pageSize);
      },
    },
    created() {
      this.scrollY = document.body.clientHeight - 248;
      this.defaultPageSize = +localStorage.getItem("sum/defaultPageSize") || 40;
      this.fetch_sum_single();
    },
    watch: {
      $route(route) {
        if (route.name == "sum") {
          this.defaultPageSize =
            +localStorage.getItem("sum/defaultPageSize") || 40;
          if (route.path != this.last_sum_route.path) {
            this.fetch_sum_single();
          }
          this.last_sum_route = route;
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
