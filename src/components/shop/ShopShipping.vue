<template lang="pug">
div
  h4 {{ shop_meta.shopName }} {{ shop_meta.platform }}
  a-table.ant-table-change(
    :columns="cols",
    :data-source="data",
    rowKey="key",
    :loading="loading",
    :expandRowByClick="true",
    :pagination="false",

    :expandIconAsCell="false",
    :expandIconColumnIndex="-1",
    :expandedRowKeys="expandedRowKeys",
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
    template(#bodyCell="{ column, text, record }")
      template(v-if="['优惠券', '时段加价', '距离加价'].includes(column.dataIndex)")
        .pre {{text ? text.replaceAll(';', '\n') : text}}
</template>

<script>
import { message } from "ant-design-vue";
import TableSelect from "../TableSelect";
import baseFetch from "../../api/base";

export default {
  name: "shop-shipping",
  components: {
    TableSelect,
  },
  props: ["shop_meta", "scrollY"],
  data() {
    return {
      cols: [
        // {
        //   title: "product",
        //   dataIndex: "shop_product_desc",
        //   width: 100,
        // },
        {
          title: "配送方",
          dataIndex: "配送方",
          width: 80,
        },
        {
          title: "账号",
          dataIndex: "账号",
          width: 80,
        },
        {
          title: "密码",
          dataIndex: "密码",
          width: 80,
        },
        {
          title: "余额",
          dataIndex: "余额",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "优惠券",
          dataIndex: "优惠券",
          width: 120,
        },
        {
          title: "时段加价",
          dataIndex: "时段加价",
          width: 150,
        },
        {
          title: "距离加价",
          dataIndex: "距离加价",
          width: 200,
        },
        {
          title: "基础费用",
          dataIndex: "基础费用",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "派单数量",
          dataIndex: "派单数量",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "成功数量",
          dataIndex: "成功数量",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "配送费总计",
          dataIndex: "配送费总计",
          width: 100,
          align: "right",
          _sort: true,
        },
        {
          title: "小费总计",
          dataIndex: "小费总计",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "支出总计",
          dataIndex: "支出总计",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "单均支出",
          dataIndex: "单均支出",
          width: 80,
          align: "right",
          _sort: true,
        },
        {
          title: "日期",
          dataIndex: "日期",
          width: 80,
          align: "right",
          _notFilter: true,
        },
      ].map(this.extendColumn),
      data: [],
      loading: false,
      expandedRowKeys: [],
    };
  },
  methods: {
    toNum(str) {
      try {
        let f = parseFloat(str);
        if (isNaN(f)) return 0;
        return f;
      } catch (err) {
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
    fetchShipping() {
      this.loading = true;
      let { shopId, date } = this.shop_meta;
      baseFetch({
        url: "/v1/operatings/exts/shipping_fees",
        params: {
          shop_id: shopId,
        },
      })
        .then((res) => {
          this.data = res;
          this.loading = false;
        })
        .catch((err) => {
          message.error(err.message);
          this.loading = false;
        });
    },
  },
  created() {
    this.fetchShipping();
  },
  watch: {
    shop_meta() {
      this.fetchShipping();
    },
  },
};
</script>

<style lang="sass">
.pre
  white-space: pre-line
</style>
