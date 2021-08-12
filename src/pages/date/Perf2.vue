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
        last_perf_route: { path: "/perf2" }
      };
    },
    computed: {
      perf_columns() {
        let fiexed_cols = [
          {
            title: "级别",
            dataIndex: "级别",
            width: 80,
            slots: { filterDropdown: "filterDropdown" },
            filterMultiple: true,
            // fixed: "left",
            onFilter: (value, record) => record.级别 == value,
          },
          {
            title: "人员",
            dataIndex: "人员",
            width: 80,
            slots: { filterDropdown: "filterDropdown", customRender: "person" },
            filterMultiple: true,
            // fixed: "left",
            onFilter: (value, record) => record.人员 == value,
          },
          {
            title: "收入",
            dataIndex: "收入",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.收入) - this.toNum(b.收入),
          },
          {
            title: "推广比例",
            dataIndex: "推广比例",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.推广比例) - this.toNum(b.推广比例),
          },
          {
            title: "成本比例",
            dataIndex: "成本比例",
            align: "right",
            width: 100,
            sorter: (a, b) =>
              this.toNum(a.成本比例) - this.toNum(b.成本比例),
          },
          {
            title: "利润",
            dataIndex: "利润",
            align: "right",
            width: 120,
            sorter: (a, b) =>
              this.toNum(a.利润) - this.toNum(b.利润),
          },
          {
            title: "提成",
            dataIndex: "提成",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.提成) - this.toNum(b.提成),
          },
          {
            title: "月累计提成",
            dataIndex: "月累计提成",
            align: "right",
            width: 100,
            sorter: (a, b) => this.toNum(a.月累计提成) - this.toNum(b.月累计提成),
          },
          {
            title: "日期",
            dataIndex: "date",
            align: "right",
            fixed: "right",
            slots: { filterDropdown: "filterDropdown" },
            width: 100,
            onFilter: (value, record) => record.date == value,
          },
        ];
        return [...fiexed_cols];
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
        return Array.from(new Set(this.perfs.map((row) => row[colName] ?? "")))
          .sort()
          .map((col) => ({
            label: col,
            value: col,
          }));
      },
      fetch_perf() {
        this.spinning = true;
        new Perf(this.day)
          .single2()
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
      }
    },
    created() {
      this.scrollY = document.body.clientHeight - 116;
      this.defaultPageSize = +localStorage.getItem("perf2/defaultPageSize") || 40;
      this.fetch_perf();
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
