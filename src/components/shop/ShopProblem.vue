<template lang="pug">
a-table(
  :columns="cols",
  :data-source="data",
  rowKey="key",
  :loading="loading",
  :expandRowByClick="true",
  :pagination="false",
  :expandIconAsCell="false",
  :expandIconColumnIndex="-1",
  :expandedRowKeys="expandedRowKeys",
  @expandedRowsChange="expandedRowsChange",
  size="small",
  style="width: 1180px"
)
  template(#expandedRowRender="{ record }")
    shop-order(
      :goods_meta="{ ...shop_meta, activi: record['活动内容'], counts: record['商品数量'] }"
    )
</template>

<script>
  import Shop from "../../api/shop";
  import { message } from "ant-design-vue";
  import ShopOrder from "./ShopOrder";

  let cols = [
    {
      title: "商品数量",
      dataIndex: "商品数量",
      width: 110,
      align: "right",
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
    },
    {
      title: "商家收入",
      dataIndex: "商家收入",
      width: 100,
      align: "right",
    },
    {
      title: "成本比例",
      dataIndex: "成本比例",
      width: 100,
      align: "right",
    },
    {
      title: "订单数量",
      dataIndex: "订单数量",
      width: 100,
      align: "right",
    },
    {
      title: "订单比例",
      dataIndex: "订单比例",
      width: 100,
      align: "right",
    },
    {
      title: "单均配送",
      dataIndex: "单均配送",
      width: 100,
      align: "right",
    },
  ];

  export default {
    name: "shop-problem",
    components: {
      ShopOrder,
    },
    props: ["shop_meta"],
    data() {
      return {
        cols,
        data: [],
        loading: false,
        expandedRowKeys: [],
        scrollY: 800,
      };
    },
    methods: {
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
