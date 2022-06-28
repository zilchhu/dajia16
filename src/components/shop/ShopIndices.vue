<template lang="pug">
s-table(
  :columns="shop_indices_columns",
  :data-source="shop_indices_data.data",
  rowKey="field",
  :loading="spinning",
  :pagination="false",
  size="small",
  :scroll="{ x: scrollX }",
  bordered,
  :style="`max-width: ${scrollX + 10}px;`"
)
  template(
    #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
  )
    table-select(
      :columnTitle="column.title",
      :columnIndex="column.dataIndex",
      :tableData="shop_indices_data.data",
      @select-change="setSelectedKeys",
      @confirm="confirm()",
      @reset="clearFilters()"
    )
</template>

<script>
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import updateLocale from "dayjs/plugin/updateLocale";
import { message } from "ant-design-vue";
import TableSelect from "../TableSelect";
import baseFetch from "../../api/base";

import "dayjs/locale/zh-cn";

dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.extend(updateLocale);

dayjs.locale("zh-cn");

dayjs.updateLocale("zh-cn", {
  weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
});

export default {
  name: "shop-indices",
  components: {
    TableSelect,
  },
  props: ["shop_meta"],
  data() {
    return {
      shop_indices_data: {
        dates: [],
        data: [],
      },
      spinning: false,
    };
  },
  computed: {
    shop_indices_columns() {
      let fiexed_cols = [
        {
          title: "指标",
          dataIndex: "field",
          width: 120,
          fixed: "left",
        },
      ];
      let dates_cols = this.shop_indices_data.dates.map((v) => ({
        title: dayjs(v, "YYYY-MM-DD").format("M/D"),
        dataIndex: v,
        align: "right",
        width: 80,
        _notFilter: true,
      }));
      // console.log([...fiexed_cols, ...dates_cols])
      return [...fiexed_cols, ...dates_cols].map(this.extendColumn);
    },
    scrollX() {
      let x = this.reduce_width(this.shop_indices_columns);
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
    fetch_shop_indices() {
      this.spinning = true;
      baseFetch({
        url: "/v1/operatings/exts/offline_indices",
        params: {
          platform: this.shop_meta.platform,
          shop_id: this.shop_meta.shopId,
          day: 7,
        },
      })
        .then((res) => {
          this.shop_indices_data = res;
          this.spinning = false;
        })
        .catch((e) => {
          message.error(e.message);
          this.spinning = false;
        });
    },
  },
  created() {
    this.fetch_shop_indices();
  },
  watch: {
    shop_meta() {
      this.fetch_shop_indices();
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
