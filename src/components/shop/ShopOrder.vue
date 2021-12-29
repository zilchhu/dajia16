<template lang="pug">
a-table.ant-table-change(
  :columns="cols",
  :data-source="data",
  rowKey="订单编号",
  :loading="loading",
  :scroll="{ x: scrollX, y: 400 }",
  :expandRowByClick="true",
  :pagination="false",
  :expandIconAsCell="false",
  :expandIconColumnIndex="-1",
  size="small",
  :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
)
  template(
    #customFilterDropdown="{ confirm, clearFilters, column, selectedKeys, setSelectedKeys }"
  )
    table-select(
      :columnTitle="column.title",
      :columnIndex="column.dataIndex",
      :tableData="data",
      @select-change="setSelectedKeys",
      @confirm="confirm()",
      @reset="clearFilters()"
    )

  template(#headerCell="{ title, column }")
    template(v-if="column.width")
      .ellipsis(
        :style="`max-width: ${column.width - 20}px`",
        :title="column.title"
      ) {{ column.title }}

  template(#bodyCell="{ column, text, record }")
    template(v-if="column.dataIndex == '订单编号'")
      .order-id-cell {{ text }}
    template(v-else-if="column.dataIndex == '订单信息'")
      .order-info-cell {{ text }}
</template>

<script>
  import { message } from "ant-design-vue";
  import Shop from "../../api/shop";
  import TableSelect from "../TableSelect";
  // import dayjs from "dayjs";

  export default {
    name: "shop-order",
    components: {
      TableSelect,
    },
    props: ["goods_meta"],
    data() {
      return {
        cols: [
          {
            title: "订单编号",
            dataIndex: "订单编号",
            width: 110,
            align: "right",
          },
          {
            title: "订单信息",
            dataIndex: "订单信息",
            align: "right",
          },
          {
            title: "理论成本",
            dataIndex: "理论成本",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "商家收入",
            dataIndex: "商家收入",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "成本比例",
            dataIndex: "成本比例",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "订单配送",
            dataIndex: "订单配送",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "减配支出",
            dataIndex: "减配支出",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "新客立减",
            dataIndex: "新客立减",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "红包支出",
            dataIndex: "红包支出",
            width: 70,
            align: "right",
            _sort: true,
          },
          {
            title: "代金券支出",
            dataIndex: "代金券支出",
            width: 90,
            align: "right",
            _sort: true,
          },
          {
            title: "订单距离/m",
            dataIndex: "订单距离/m",
            width: 90,
            align: "right",
            _sort: true,
          },
        ].map(this.extendColumn),
        data: [],
        loading: false,
      };
    },
    computed: {
      scrollX() {
        return this.cols.map((v) => v.width ?? 200).reduce((s, w) => s + w, 10);
      },
    },
    methods: {
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
      fetchOrder() {
        this.loading = true;
        let { shopId, activi, counts, date } = this.goods_meta;
        new Shop(shopId)
          .order(activi, counts, date)
          .then((res) => {
            this.data = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
    },
    mounted() {
      this.fetchOrder();
    },
    watch: {
      goods_meta() {
        this.fetchOrder();
      },
    },
  };
</script>

<style lang="sass" scoped>
.order-id-cell
  font-size: 10px

.order-info-cell
  white-space: pre-wrap
  font-size: 0.93em

.ellipsis
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
</style>
