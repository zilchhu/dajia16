<template lang="pug">
s-table(
  :columns="cols",
  :data-source="data",
  rowKey="key",
  :loading="loading",
  :expandRowByClick="true",
  :pagination="false",
  :scroll="{ y: scrollY ?? 600 }",
  :expandIconAsCell="false",
  :expandIconColumnIndex="-1",
  :expandedRowKeys="expandedRowKeys",
  @expandedRowsChange="expandedRowsChange",
  size="small"
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

  template(#expandedRowRender="{ record }")
    shop-order(
      :goods_meta="{ ...shop_meta, activi: record['活动内容'], counts: record['商品数量'] }"
    )
</template>

<script>
  import { message } from "ant-design-vue";
  import Shop from "../../api/shop";
  import TableSelect from "../TableSelect";
  import ShopOrder from "./ShopOrder";

  export default {
    name: "shop-problem",
    components: {
      TableSelect,
      ShopOrder,
    },
    props: ["shop_meta", "scrollY"],
    data() {
      return {
        cols: [
          {
            title: "商品数量",
            dataIndex: "商品数量",
            width: 110,
            align: "right",
            _sort: true,
          },
          {
            title: "活动内容",
            dataIndex: "活动内容",
          },
          {
            title: "理论成本",
            dataIndex: "理论成本",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "商家收入",
            dataIndex: "商家收入",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "成本比例",
            dataIndex: "成本比例",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "订单数量",
            dataIndex: "订单数量",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "订单比例",
            dataIndex: "订单比例",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "单均配送",
            dataIndex: "单均配送",
            width: 100,
            align: "right",
            _sort: true,
          },
        ].map(this.extendColumn),
        data: [],
        loading: false,
        expandedRowKeys: []
      };
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
      fetchProb() {
        this.loading = true;
        let { shopId, date } = this.shop_meta;
        new Shop(shopId)
          .prob(date)
          .then((res) => {
            this.data = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
      expandedRowsChange(keys) {
        this.expandedRowKeys = keys;
      },
    },
    created() {
      this.fetchProb();
    },
    watch: {
      shop_meta() {
        this.expandedRowKeys = [];
        this.fetchProb();
      },
    },
  };
</script>
